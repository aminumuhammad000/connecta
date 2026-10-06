import mongoose from 'mongoose';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import Ledger from '../models/Ledger.model.js';
/**
 * Unified Financial Settlement Service
 * Guarantees that:
 * Successful Payment / Financial Event -> Transaction Completed -> Wallet Adjusted -> Ledger Created
 * All executed consistently and idempotently with database-level uniqueness locks.
 */
class SettlementService {
    /**
     * 1. Record a Successful Wallet Deposit (Top-up)
     */
    async recordDeposit(params) {
        const { userId, amount, currency, gateway, reference, paymentId, description, metadata } = params;
        // Atomically increment wallet balance
        const updatedWallet = await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: amount } }, { upsert: true, new: true });
        const balanceAfter = updatedWallet.balance || 0;
        const balanceBefore = balanceAfter - amount;
        // Create or update completed transaction idempotently
        let transaction = null;
        try {
            transaction = await Transaction.create({
                userId,
                type: 'deposit',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                balanceBefore,
                balanceAfter,
                gateway: gateway || 'flutterwave',
                gatewayReference: reference,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                description: description || `Wallet deposit of ${(currency || 'NGN').toUpperCase()} ${amount}`,
                metadata,
            });
        }
        catch (txErr) {
            if (txErr.code === 11000) {
                transaction = await Transaction.findOne({ gatewayReference: reference, type: 'deposit' });
            }
            else {
                console.error('[SettlementService] Transaction creation error on deposit:', txErr);
            }
        }
        // Create immutable audit ledger entry idempotently
        let ledger = null;
        try {
            ledger = await Ledger.create({
                userId,
                walletId: updatedWallet._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: transaction?._id,
                action: 'credit',
                category: 'deposit',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore,
                balanceAfter,
                status: 'posted',
                reference,
                gateway: gateway || 'flutterwave',
                description: description || `Deposit of ${(currency || 'NGN').toUpperCase()} ${amount} via ${gateway || 'gateway'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code === 11000) {
                ledger = await Ledger.findOne({ reference, category: 'deposit', userId, action: 'credit' });
            }
            else {
                console.error('[SettlementService] Ledger creation error on deposit:', lErr);
            }
        }
        return { wallet: updatedWallet, transaction, ledger };
    }
    /**
     * 2. Record Direct Gateway Escrow Payment (Milestone / Project funded with card/gateway)
     */
    async recordEscrowHoldDirect(params) {
        const { payerId, payeeId, amount, netAmount, currency, gateway, reference, paymentId, projectId, description, metadata, } = params;
        // Atomically increment freelancer wallet balance & escrowBalance
        const updatedPayeeWallet = await Wallet.findOneAndUpdate({ userId: payeeId }, { $inc: { balance: netAmount, escrowBalance: netAmount } }, { upsert: true, new: true });
        const payeeBalanceAfter = updatedPayeeWallet.balance || 0;
        const payeeEscrowAfter = updatedPayeeWallet.escrowBalance || 0;
        // 1. Payee Transaction (Pending Escrow)
        let payeeTx = null;
        try {
            payeeTx = await Transaction.create({
                userId: payeeId,
                type: 'payment_received',
                amount: netAmount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'pending',
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                gateway: gateway || 'flutterwave',
                gatewayReference: reference,
                description: `🔒 Escrow payment for project: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (pErr) {
            if (pErr.code === 11000) {
                payeeTx = await Transaction.findOne({ paymentId, type: 'payment_received', userId: payeeId });
            }
        }
        // 2. Payee Ledger
        let payeeLedger = null;
        try {
            payeeLedger = await Ledger.create({
                userId: payeeId,
                walletId: updatedPayeeWallet._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: payeeTx?._id,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'credit',
                category: 'escrow_hold',
                amount: netAmount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: payeeBalanceAfter - netAmount,
                balanceAfter: payeeBalanceAfter,
                escrowBalanceBefore: payeeEscrowAfter - netAmount,
                escrowBalanceAfter: payeeEscrowAfter,
                status: 'posted',
                reference,
                gateway: gateway || 'flutterwave',
                description: `Escrow hold received: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Payee escrow ledger error:', lErr);
        }
        // 3. Payer Transaction (Payment Sent)
        let payerTx = null;
        try {
            payerTx = await Transaction.create({
                userId: payerId,
                type: 'payment_sent',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                gateway: gateway || 'flutterwave',
                gatewayReference: reference,
                description: `Payment for project (Escrowed): ${description || 'Project'}`,
                metadata,
            });
        }
        catch (pErr) {
            if (pErr.code === 11000) {
                payerTx = await Transaction.findOne({ paymentId, type: 'payment_sent', userId: payerId });
            }
        }
        // 4. Payer Ledger
        let payerLedger = null;
        try {
            payerLedger = await Ledger.create({
                userId: payerId,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: payerTx?._id,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'debit',
                category: 'escrow_hold',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: 0,
                balanceAfter: 0,
                status: 'posted',
                reference,
                gateway: gateway || 'flutterwave',
                description: `Direct payment escrow funded: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Payer escrow ledger error:', lErr);
        }
        return { payeeWallet: updatedPayeeWallet, payeeTx, payerTx, payeeLedger, payerLedger };
    }
    /**
     * 3. Record Escrow Payment Funded from Wallet Balance
     */
    async recordEscrowHoldFromWallet(params) {
        const { payerId, payeeId, amount, netAmount, currency, reference, paymentId, projectId, description, metadata, } = params;
        // Deduct payer wallet balance
        const updatedPayerWallet = await Wallet.findOneAndUpdate({ userId: payerId, balance: { $gte: amount } }, { $inc: { balance: -amount, totalSpent: amount } }, { new: true });
        if (!updatedPayerWallet) {
            throw new Error('Insufficient wallet balance for escrow hold');
        }
        const payerBalanceAfter = updatedPayerWallet.balance || 0;
        const payerBalanceBefore = payerBalanceAfter + amount;
        // Credit freelancer escrow balance & balance
        const updatedPayeeWallet = await Wallet.findOneAndUpdate({ userId: payeeId }, { $inc: { balance: netAmount, escrowBalance: netAmount } }, { upsert: true, new: true });
        const payeeBalanceAfter = updatedPayeeWallet.balance || 0;
        const payeeEscrowAfter = updatedPayeeWallet.escrowBalance || 0;
        // 1. Payer Transaction
        let payerTx = null;
        try {
            payerTx = await Transaction.create({
                userId: payerId,
                type: 'payment_sent',
                amount: -amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                balanceBefore: payerBalanceBefore,
                balanceAfter: payerBalanceAfter,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                gateway: 'wallet',
                gatewayReference: reference,
                description: `Escrow payment funded from wallet: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (pErr) {
            if (pErr.code === 11000) {
                payerTx = await Transaction.findOne({ paymentId, type: 'payment_sent', userId: payerId });
            }
        }
        // 2. Payer Ledger
        let payerLedger = null;
        try {
            payerLedger = await Ledger.create({
                userId: payerId,
                walletId: updatedPayerWallet._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: payerTx?._id,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'debit',
                category: 'escrow_hold',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: payerBalanceBefore,
                balanceAfter: payerBalanceAfter,
                status: 'posted',
                reference,
                gateway: 'wallet',
                description: `Wallet escrow payment: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Payer wallet escrow ledger error:', lErr);
        }
        // 3. Payee Transaction
        let payeeTx = null;
        try {
            payeeTx = await Transaction.create({
                userId: payeeId,
                type: 'payment_received',
                amount: netAmount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'pending',
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                gateway: 'wallet',
                gatewayReference: reference,
                description: `🔒 Escrow payment held: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (pErr) {
            if (pErr.code === 11000) {
                payeeTx = await Transaction.findOne({ paymentId, type: 'payment_received', userId: payeeId });
            }
        }
        // 4. Payee Ledger
        let payeeLedger = null;
        try {
            payeeLedger = await Ledger.create({
                userId: payeeId,
                walletId: updatedPayeeWallet._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: payeeTx?._id,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'credit',
                category: 'escrow_hold',
                amount: netAmount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: payeeBalanceAfter - netAmount,
                balanceAfter: payeeBalanceAfter,
                escrowBalanceBefore: payeeEscrowAfter - netAmount,
                escrowBalanceAfter: payeeEscrowAfter,
                status: 'posted',
                reference,
                gateway: 'wallet',
                description: `Escrow hold received: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Payee wallet escrow ledger error:', lErr);
        }
        return { payerWallet: updatedPayerWallet, payeeWallet: updatedPayeeWallet, payerTx, payeeTx, payerLedger, payeeLedger };
    }
    /**
     * 4. Record Escrow Release (Milestone / Project Approval)
     */
    async recordEscrowRelease(params) {
        const { paymentId, payeeId, netAmount, currency, reference, projectId, description, metadata } = params;
        // Atomically release escrow balance to available balance
        const updatedWallet = await Wallet.findOneAndUpdate({ userId: payeeId }, {
            $inc: {
                escrowBalance: -netAmount,
                totalEarnings: netAmount,
            },
        }, { upsert: true, new: true });
        const balanceAfter = updatedWallet.balance || 0;
        const escrowAfter = updatedWallet.escrowBalance || 0;
        // Update pending transactions to completed
        await Transaction.updateMany({ paymentId, type: 'payment_received', status: 'pending' }, {
            $set: {
                status: 'completed',
                description: `💸 Escrow released: ${description || 'Project'}`,
            },
        });
        const transaction = await Transaction.findOne({ paymentId, type: 'payment_received' });
        // Create Ledger entry for escrow release
        let ledger = null;
        try {
            ledger = await Ledger.create({
                userId: payeeId,
                walletId: updatedWallet._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: transaction?._id,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'credit',
                category: 'escrow_release',
                amount: netAmount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: balanceAfter,
                balanceAfter: balanceAfter,
                escrowBalanceBefore: escrowAfter + netAmount,
                escrowBalanceAfter: escrowAfter,
                status: 'posted',
                reference: `REL_${reference}`,
                description: `Escrow released to available balance: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Escrow release ledger error:', lErr);
        }
        return { wallet: updatedWallet, transaction, ledger };
    }
    /**
     * 5. Record Escrow Refund (Milestone / Project Cancelled or Refunded)
     */
    async recordEscrowRefund(params) {
        const { paymentId, payerId, payeeId, amount, netAmount, currency, reference, projectId, description, metadata } = params;
        // 1. Deduct from payee wallet
        const updatedPayeeWallet = await Wallet.findOneAndUpdate({ userId: payeeId }, { $inc: { escrowBalance: -netAmount, balance: -netAmount } }, { new: true });
        // Cancel pending payee transaction
        await Transaction.updateMany({ paymentId, type: 'payment_received', status: 'pending' }, { $set: { status: 'cancelled' } });
        // Payee Ledger
        try {
            await Ledger.create({
                userId: payeeId,
                walletId: updatedPayeeWallet?._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'debit',
                category: 'escrow_refund',
                amount: netAmount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: (updatedPayeeWallet?.balance || 0) + netAmount,
                balanceAfter: updatedPayeeWallet?.balance || 0,
                status: 'posted',
                reference: `REFUND_${reference}`,
                description: `Escrow reversed / refunded: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Payee refund ledger error:', lErr);
        }
        // 2. Refund payer wallet
        const updatedPayerWallet = await Wallet.findOneAndUpdate({ userId: payerId }, { $inc: { balance: amount } }, { upsert: true, new: true });
        const payerBalanceAfter = updatedPayerWallet.balance || 0;
        const payerBalanceBefore = payerBalanceAfter - amount;
        // Create refund transaction for payer
        let refundTx = null;
        try {
            refundTx = await Transaction.create({
                userId: payerId,
                type: 'refund',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                balanceBefore: payerBalanceBefore,
                balanceAfter: payerBalanceAfter,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                gatewayReference: `REFUND_${reference}`,
                description: `Refund for escrow payment: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (rErr) {
            if (rErr.code === 11000) {
                refundTx = await Transaction.findOne({ paymentId, type: 'refund' });
            }
        }
        // Payer Ledger
        let payerLedger = null;
        try {
            payerLedger = await Ledger.create({
                userId: payerId,
                walletId: updatedPayerWallet._id,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                transactionId: refundTx?._id,
                projectId: projectId ? new mongoose.Types.ObjectId(projectId.toString()) : undefined,
                action: 'credit',
                category: 'escrow_refund',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: payerBalanceBefore,
                balanceAfter: payerBalanceAfter,
                status: 'posted',
                reference: `REFUND_${reference}`,
                description: `Refund credited to wallet: ${description || 'Project'}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Payer refund ledger error:', lErr);
        }
        return { payerWallet: updatedPayerWallet, payeeWallet: updatedPayeeWallet, refundTx, payerLedger };
    }
    /**
     * 6. Record Withdrawal / Payout Request
     */
    async recordWithdrawalRequest(params) {
        const { userId, amount, currency, gateway, reference, withdrawalId, balanceBefore, balanceAfter, description, metadata, } = params;
        let transaction = null;
        try {
            transaction = await Transaction.create({
                userId,
                type: 'withdrawal',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                balanceBefore,
                balanceAfter,
                gateway: gateway || 'flutterwave',
                gatewayReference: reference,
                description: description || `Withdrawal request (${(currency || 'NGN').toUpperCase()} ${amount})`,
                metadata,
            });
        }
        catch (txErr) {
            if (txErr.code === 11000) {
                transaction = await Transaction.findOne({ gatewayReference: reference, type: 'withdrawal' });
            }
        }
        let ledger = null;
        try {
            ledger = await Ledger.create({
                userId,
                withdrawalId: withdrawalId ? new mongoose.Types.ObjectId(withdrawalId.toString()) : undefined,
                transactionId: transaction?._id,
                action: 'debit',
                category: 'withdrawal',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore,
                balanceAfter,
                status: 'posted',
                reference,
                gateway: gateway || 'flutterwave',
                description: description || `Withdrawal of ${(currency || 'NGN').toUpperCase()} ${amount}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Withdrawal ledger error:', lErr);
        }
        return { transaction, ledger };
    }
    /**
     * 7. Record Withdrawal Failure Refund
     */
    async recordWithdrawalRefund(params) {
        const { userId, amount, currency, gateway, reference, withdrawalId, description, metadata } = params;
        const updatedWallet = await Wallet.findOneAndUpdate({ userId }, { $inc: { balance: amount } }, { upsert: true, new: true });
        const balanceAfter = updatedWallet.balance || 0;
        const balanceBefore = balanceAfter - amount;
        let transaction = null;
        try {
            transaction = await Transaction.create({
                userId,
                type: 'refund',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                balanceBefore,
                balanceAfter,
                gateway: gateway || 'flutterwave',
                gatewayReference: `REFUND_${reference}`,
                description: description || `Refund for failed withdrawal: ${reference}`,
                metadata,
            });
        }
        catch (txErr) {
            if (txErr.code === 11000) {
                transaction = await Transaction.findOne({ gatewayReference: `REFUND_${reference}`, type: 'refund' });
            }
        }
        let ledger = null;
        try {
            ledger = await Ledger.create({
                userId,
                walletId: updatedWallet._id,
                withdrawalId: withdrawalId ? new mongoose.Types.ObjectId(withdrawalId.toString()) : undefined,
                transactionId: transaction?._id,
                action: 'credit',
                category: 'payout_refund',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore,
                balanceAfter,
                status: 'posted',
                reference: `REFUND_${reference}`,
                gateway: gateway || 'flutterwave',
                description: description || `Failed withdrawal refund: ${reference}`,
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Withdrawal refund ledger error:', lErr);
        }
        return { wallet: updatedWallet, transaction, ledger };
    }
    /**
     * 8. Record Job Verification Payment
     */
    async recordJobVerificationPayment(params) {
        const { userId, amount, currency, gateway, reference, paymentId, jobId, description, metadata } = params;
        let transaction = null;
        try {
            transaction = await Transaction.create({
                userId,
                type: 'payment_sent',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                status: 'completed',
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                gateway: gateway || 'flutterwave',
                gatewayReference: reference,
                description: description || 'Job verification fee',
                metadata,
            });
        }
        catch (txErr) {
            if (txErr.code === 11000) {
                transaction = await Transaction.findOne({ paymentId, type: 'payment_sent', userId });
            }
        }
        let ledger = null;
        try {
            ledger = await Ledger.create({
                userId,
                paymentId: paymentId ? new mongoose.Types.ObjectId(paymentId.toString()) : undefined,
                jobId: jobId ? new mongoose.Types.ObjectId(jobId.toString()) : undefined,
                transactionId: transaction?._id,
                action: 'debit',
                category: 'job_verification',
                amount,
                currency: (currency || 'NGN').toUpperCase(),
                balanceBefore: 0,
                balanceAfter: 0,
                status: 'posted',
                reference,
                gateway: gateway || 'flutterwave',
                description: description || 'Job verification fee',
                metadata,
            });
        }
        catch (lErr) {
            if (lErr.code !== 11000)
                console.error('[SettlementService] Job verification ledger error:', lErr);
        }
        return { transaction, ledger };
    }
}
export const settlementService = new SettlementService();
export default settlementService;
