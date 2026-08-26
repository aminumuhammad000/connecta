import { Request, Response } from 'express';
import WorkforceMember from '../models/WorkforceMember.model.js';
import WorkforceAttendance from '../models/WorkforceAttendance.model.js';
import WorkforceContract from '../models/WorkforceContract.model.js';
import WorkforcePayment from '../models/WorkforcePayment.model.js';
import WorkforceSettings from '../models/WorkforceSettings.model.js';
import User from '../models/user.model.js';
import Job from '../models/Job.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import Proposal from '../models/Proposal.model.js';

// ============================================
// DASHBOARD & SETTINGS
// ============================================

export const getPublicWorkforceInfo = async (req: Request, res: Response) => {
  try {
    const { workforceId } = req.params;
    const companyUser = await User.findById(workforceId).select('companyName firstName lastName title profileImage location');

    if (!companyUser) {
      return res.status(404).json({ success: false, message: 'Workforce company not found' });
    }

    const companyName = companyUser.companyName || companyUser.title || `${companyUser.firstName} ${companyUser.lastName || ''}`.trim();

    return res.status(200).json({
      success: true,
      data: {
        _id: companyUser._id,
        companyName,
        firstName: companyUser.firstName,
        lastName: companyUser.lastName,
        location: companyUser.location,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch workforce details' });
  }
};

export const getWorkerMeData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const userObj = await User.findById(userId);

    let member = await WorkforceMember.findOne({
      $or: [{ workerId: userId }, { email: userObj?.email?.toLowerCase() }],
    }).populate('companyId', 'firstName lastName companyName title email profileImage phoneNumber');

    if (member && !member.workerId) {
      member.workerId = userId;
      await member.save();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    let contracts: any[] = [];
    let todayAttendance: any = null;
    let attendanceHistory: any[] = [];
    let paymentsHistory: any[] = [];
    let proposalsList: any[] = [];
    let monthlyEarnings = 0;

    if (member || userId) {
      const [cList, todayAtt, attHist, payHist, mPay, pList] = await Promise.all([
        member ? WorkforceContract.find({ workforceMemberId: member._id }).sort({ createdAt: -1 }) : Promise.resolve([]),
        member ? WorkforceAttendance.findOne({ workforceMemberId: member._id, date: todayStr }) : Promise.resolve(null),
        member ? WorkforceAttendance.find({ workforceMemberId: member._id }).sort({ date: -1 }).limit(30) : Promise.resolve([]),
        member ? WorkforcePayment.find({ workforceMemberId: member._id }).sort({ paymentDate: -1 }).limit(20) : Promise.resolve([]),
        member ? WorkforcePayment.aggregate([
          { $match: { workforceMemberId: member._id, status: 'completed', createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]) : Promise.resolve([]),
        Proposal.find({ freelancerId: userId }).populate('jobId', 'title location budget currency').sort({ createdAt: -1 }),
      ]);

      contracts = cList;
      todayAttendance = todayAtt;
      attendanceHistory = attHist;
      paymentsHistory = payHist;
      proposalsList = pList;
      monthlyEarnings = mPay.length > 0 ? mPay[0].total : (member?.paymentAmount || 0);
    }

    return res.status(200).json({
      success: true,
      data: {
        member,
        employer: member?.companyId || null,
        contracts,
        todayAttendance,
        attendanceHistory,
        paymentsHistory,
        proposals: proposalsList,
        monthlyEarnings,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch worker data' });
  }
};

export const declineContract = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const contract = await WorkforceContract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    contract.status = 'terminated';
    await contract.save();

    await WorkforceMember.findByIdAndUpdate(contract.workforceMemberId, { inviteStatus: 'declined' });

    return res.status(200).json({ success: true, message: 'Contract declined', data: contract });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to decline contract' });
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [activeWorkers, workingToday, activeJobs, monthlyPayments] = await Promise.all([
      WorkforceMember.countDocuments({ companyId: userId, status: 'active' }),
      WorkforceAttendance.countDocuments({ companyId: userId, date: todayStr, status: 'present' }),
      Job.countDocuments({ clientId: userId, status: 'active' }),
      WorkforcePayment.aggregate([
        { $match: { companyId: userId, status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalMonthlyPayroll = monthlyPayments.length > 0 ? monthlyPayments[0].total : 0;

    // Recent activity list
    const recentMembers = await WorkforceMember.find({ companyId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAttendance = await WorkforceAttendance.find({ companyId: userId, date: todayStr })
      .populate('workforceMemberId', 'fullName role')
      .limit(5);

    const userObj = await User.findById(userId).select('payrollWalletBalance');
    const payrollWalletBalance = userObj?.payrollWalletBalance || 2500000;

    return res.status(200).json({
      success: true,
      data: {
        activeWorkers,
        workingToday,
        activeJobs,
        totalMonthlyPayroll,
        payrollWalletBalance,
        recentMembers,
        todayAttendance: recentAttendance,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch dashboard stats' });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    let settings = await WorkforceSettings.findOne({ companyId: userId });
    if (!settings) {
      settings = await WorkforceSettings.create({ companyId: userId });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch settings' });
  }
};

export const saveSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { onboardingCompleted, objectives, workerCountRange, hasExistingWorkers, requireLocationForAttendance, allowSelfCheckIn, defaultCurrency } = req.body;

    let settings = await WorkforceSettings.findOne({ companyId: userId });
    if (!settings) {
      settings = new WorkforceSettings({ companyId: userId });
    }

    if (onboardingCompleted !== undefined) settings.onboardingCompleted = onboardingCompleted;
    if (objectives !== undefined) settings.objectives = objectives;
    if (workerCountRange !== undefined) settings.workerCountRange = workerCountRange;
    if (hasExistingWorkers !== undefined) settings.hasExistingWorkers = hasExistingWorkers;
    if (requireLocationForAttendance !== undefined) settings.requireLocationForAttendance = requireLocationForAttendance;
    if (allowSelfCheckIn !== undefined) settings.allowSelfCheckIn = allowSelfCheckIn;
    if (defaultCurrency !== undefined) settings.defaultCurrency = defaultCurrency;

    await settings.save();
    return res.status(200).json({ success: true, message: 'Settings saved', data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to save settings' });
  }
};

// ============================================
// WORKERS MANAGEMENT
// ============================================

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { status, search, role } = req.query;

    const query: any = { companyId: userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    if (role) {
      query.role = new RegExp(String(role), 'i');
    }
    if (search) {
      query.$or = [
        { fullName: new RegExp(String(search), 'i') },
        { email: new RegExp(String(search), 'i') },
        { phone: new RegExp(String(search), 'i') },
        { role: new RegExp(String(search), 'i') },
      ];
    }

    const workers = await WorkforceMember.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: workers });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch workers' });
  }
};

export const addWorker = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { fullName, email, phone, role, skills, location, employmentType, paymentType, paymentAmount, currency, startDate, endDate, idNumber } = req.body;

    if (!fullName || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, and role are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingMember = await WorkforceMember.findOne({ companyId: userId, email: cleanEmail });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'A worker with this email already exists in your workforce' });
    }

    // Check if email belongs to an existing Connecta user
    const connectaUser = await User.findOne({ email: cleanEmail });

    const newWorker = await WorkforceMember.create({
      companyId: userId,
      workerId: connectaUser ? connectaUser._id : undefined,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : (connectaUser?.phoneNumber || ''),
      role: role.trim(),
      skills: Array.isArray(skills) ? skills : [],
      location: location || '',
      employmentType: employmentType || 'contract',
      paymentType: paymentType || 'monthly',
      paymentAmount: Number(paymentAmount) || 0,
      currency: currency || 'NGN',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      idNumber,
      status: 'active',
      inviteStatus: connectaUser ? 'accepted' : 'sent',
    });

    return res.status(201).json({
      success: true,
      message: connectaUser ? 'Worker added and linked to existing Connecta account!' : 'Worker added! Connecta invitation ready.',
      data: newWorker,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to add worker' });
  }
};

export const bulkImportWorkers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workers } = req.body;

    if (!Array.isArray(workers) || workers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of worker records to import' });
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const w of workers) {
      try {
        if (!w.name || !w.email || !w.role) {
          skippedCount++;
          errors.push(`Row for ${w.email || w.name || 'Unknown'} missing required fields.`);
          continue;
        }

        const cleanEmail = w.email.toLowerCase().trim();
        const exists = await WorkforceMember.findOne({ companyId: userId, email: cleanEmail });
        if (exists) {
          skippedCount++;
          errors.push(`Worker ${cleanEmail} already exists in your workforce.`);
          continue;
        }

        const connectaUser = await User.findOne({ email: cleanEmail });

        await WorkforceMember.create({
          companyId: userId,
          workerId: connectaUser ? connectaUser._id : undefined,
          fullName: w.name.trim(),
          email: cleanEmail,
          phone: w.phone ? String(w.phone).trim() : '',
          role: w.role.trim(),
          skills: w.skills ? String(w.skills).split(',').map((s: string) => s.trim()) : [],
          employmentType: w.employmentType || 'contract',
          paymentType: w.paymentType || 'monthly',
          paymentAmount: Number(w.paymentAmount) || 0,
          currency: w.currency || 'NGN',
          startDate: w.startDate ? new Date(w.startDate) : new Date(),
          status: 'active',
          inviteStatus: connectaUser ? 'accepted' : 'sent',
        });

        importedCount++;
      } catch (err: any) {
        skippedCount++;
        errors.push(`Error importing ${w.email}: ${err.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import complete: ${importedCount} workers added, ${skippedCount} skipped.`,
      data: { importedCount, skippedCount, errors },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to bulk import workers' });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workerId } = req.params;

    const worker = await WorkforceMember.findOne({ _id: workerId, companyId: userId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const [contracts, attendance, payments] = await Promise.all([
      WorkforceContract.find({ workforceMemberId: workerId }),
      WorkforceAttendance.find({ workforceMemberId: workerId }).sort({ date: -1 }).limit(30),
      WorkforcePayment.find({ workforceMemberId: workerId }).sort({ paymentDate: -1 }).limit(20),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        worker,
        contracts,
        attendance,
        payments,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch worker profile' });
  }
};

export const updateWorker = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workerId } = req.params;

    const worker = await WorkforceMember.findOne({ _id: workerId, companyId: userId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    Object.assign(worker, req.body);
    await worker.save();

    return res.status(200).json({ success: true, message: 'Worker updated successfully', data: worker });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update worker' });
  }
};

export const deleteWorker = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workerId } = req.params;

    const worker = await WorkforceMember.findOneAndDelete({ _id: workerId, companyId: userId });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    return res.status(200).json({ success: true, message: 'Worker removed from workforce' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete worker' });
  }
};

// ============================================
// ATTENDANCE
// ============================================

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { date, startDate, endDate } = req.query;

    const query: any = { companyId: userId };
    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else {
      query.date = new Date().toISOString().split('T')[0];
    }

    const records = await WorkforceAttendance.find(query)
      .populate('workforceMemberId', 'fullName role email phone profileImage')
      .sort({ date: -1 });

    return res.status(200).json({ success: true, data: records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch attendance' });
  }
};

export const recordCheckIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workforceMemberId, location, notes } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    // Find member
    let member = await WorkforceMember.findOne({ _id: workforceMemberId });
    if (!member) {
      // Check if logged in user is worker checking themselves in
      member = await WorkforceMember.findOne({ workerId: userId });
    }

    if (!member) {
      return res.status(404).json({ success: false, message: 'Workforce member record not found' });
    }

    let record = await WorkforceAttendance.findOne({
      companyId: member.companyId,
      workforceMemberId: member._id,
      date: todayStr,
    });

    if (!record) {
      record = new WorkforceAttendance({
        companyId: member.companyId,
        workforceMemberId: member._id,
        workerId: member.workerId,
        date: todayStr,
        checkInTime: new Date(),
        status: 'present',
        location,
        notes,
      });
    } else {
      record.checkInTime = new Date();
      record.status = 'present';
      if (location) record.location = location;
      if (notes) record.notes = notes;
    }

    await record.save();
    return res.status(200).json({ success: true, message: 'Check-in recorded successfully!', data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to record check-in' });
  }
};

export const recordCheckOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workforceMemberId } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];

    let member = await WorkforceMember.findOne({ _id: workforceMemberId });
    if (!member) {
      member = await WorkforceMember.findOne({ workerId: userId });
    }

    if (!member) {
      return res.status(404).json({ success: false, message: 'Workforce member record not found' });
    }

    const record = await WorkforceAttendance.findOne({
      companyId: member.companyId,
      workforceMemberId: member._id,
      date: todayStr,
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today to check out' });
    }

    record.checkOutTime = new Date();
    await record.save();

    return res.status(200).json({ success: true, message: 'Check-out recorded successfully!', data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to record check-out' });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workforceMemberId, date, status, notes } = req.body;

    const dateStr = date || new Date().toISOString().split('T')[0];
    const member = await WorkforceMember.findOne({ _id: workforceMemberId, companyId: userId });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    let record = await WorkforceAttendance.findOne({
      companyId: userId,
      workforceMemberId,
      date: dateStr,
    });

    if (!record) {
      record = new WorkforceAttendance({
        companyId: userId,
        workforceMemberId,
        workerId: member.workerId,
        date: dateStr,
        status: status || 'present',
        notes,
      });
    } else {
      record.status = status || record.status;
      if (notes !== undefined) record.notes = notes;
    }

    await record.save();
    return res.status(200).json({ success: true, message: 'Attendance status updated', data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to mark attendance' });
  }
};

// ============================================
// CONTRACTS
// ============================================

export const getContracts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const contracts = await WorkforceContract.find({ companyId: userId })
      .populate('workforceMemberId', 'fullName role email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: contracts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch contracts' });
  }
};

export const createContract = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workforceMemberId, jobTitle, startDate, endDate, employmentType, paymentType, paymentAmount, currency, responsibilities, terms } = req.body;

    const member = await WorkforceMember.findOne({ _id: workforceMemberId, companyId: userId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const newContract = await WorkforceContract.create({
      companyId: userId,
      workforceMemberId,
      workerId: member.workerId,
      jobTitle: jobTitle || member.role,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      employmentType: employmentType || member.employmentType,
      paymentType: paymentType || member.paymentType,
      paymentAmount: Number(paymentAmount) || member.paymentAmount,
      currency: currency || member.currency || 'NGN',
      responsibilities: responsibilities || '',
      terms: terms || 'Standard Connecta Workforce Terms & Agreement.',
      status: 'sent',
    });

    return res.status(201).json({ success: true, message: 'Digital contract created & issued', data: newContract });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to create contract' });
  }
};

export const acceptContract = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const contract = await WorkforceContract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    contract.status = 'accepted';
    contract.acceptedAt = new Date();
    await contract.save();

    // Update worker status
    await WorkforceMember.findByIdAndUpdate(contract.workforceMemberId, { status: 'active', inviteStatus: 'accepted' });

    return res.status(200).json({ success: true, message: 'Contract accepted successfully!', data: contract });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to accept contract' });
  }
};

// ============================================
// PAYMENTS & PAYROLL
// ============================================

export const getPayments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const payments = await WorkforcePayment.find({ companyId: userId })
      .populate('workforceMemberId', 'fullName role email phone')
      .sort({ paymentDate: -1 });

    return res.status(200).json({ success: true, data: payments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch payments' });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { workforceMemberId, amount, paymentType, description, currency } = req.body;

    const member = await WorkforceMember.findOne({ _id: workforceMemberId, companyId: userId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const payAmount = Number(amount) || member.paymentAmount;
    const ref = `WF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Debit client wallet if exists
    let wallet = await Wallet.findOne({ user: userId });
    if (wallet && wallet.balance >= payAmount) {
      wallet.balance -= payAmount;
      await wallet.save();

      await Transaction.create({
        user: userId,
        type: 'withdrawal',
        amount: payAmount,
        currency: currency || member.currency || 'NGN',
        status: 'completed',
        description: `Workforce Payment to ${member.fullName} (${description || paymentType})`,
        reference: ref,
      });
    }

    // Trigger live Flutterwave payout transfer if worker has bank details
    if (member.bankDetails && member.bankDetails.accountNumber && member.bankDetails.bankCode) {
      try {
        const flutterwaveService = (await import('../services/flutterwave.service.js')).default;
        await flutterwaveService.initiateTransfer({
          accountBank: member.bankDetails.bankCode,
          accountNumber: member.bankDetails.accountNumber,
          amount: payAmount,
          currency: currency || member.currency || 'NGN',
          narration: description || `Payroll Payment to ${member.fullName}`,
          reference: ref,
        });
      } catch (flwErr: any) {
        console.warn('Flutterwave direct transfer warning:', flwErr.message);
      }
    }

    const newPayment = await WorkforcePayment.create({
      companyId: userId,
      workforceMemberId,
      workerId: member.workerId,
      amount: payAmount,
      currency: currency || member.currency || 'NGN',
      paymentType: paymentType || member.paymentType,
      status: 'completed',
      description: description || `Payroll Payment for ${member.role}`,
      reference: ref,
      paymentDate: new Date(),
    });

    return res.status(201).json({ success: true, message: `Payment of ${newPayment.currency} ${payAmount.toLocaleString()} processed and sent to bank!`, data: newPayment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to process payment' });
  }
};

// ============================================
// WORKFORCE EMPLOYER JOBS ONLY
// ============================================

export const getWorkforceJobs = async (req: Request, res: Response) => {
  try {
    // Find all workforce employer user IDs (companies with registered members, contracts, or settings)
    const [workforceCompanies, workforceSettings, contractCompanies] = await Promise.all([
      WorkforceMember.distinct('companyId'),
      WorkforceSettings.distinct('companyId'),
      WorkforceContract.distinct('companyId'),
    ]);

    const workforceEmployerIds = Array.from(
      new Set([
        ...workforceCompanies.map((id) => id.toString()),
        ...workforceSettings.map((id) => id.toString()),
        ...contractCompanies.map((id) => id.toString()),
      ])
    );

    // Query active jobs posted by workforce employers or contract/workforce roles
    const query: any = {
      status: 'active',
      $or: [
        { clientId: { $exists: true } },
        { clientId: { $in: workforceEmployerIds } },
        { jobType: { $in: ['full_time_contract', 'contract', 'freelance'] } },
      ],
    };

    const jobs = await Job.find(query)
      .populate('clientId', 'companyName firstName lastName title profileImage location')
      .sort({ createdAt: -1 })
      .lean();

    const formattedJobs = jobs.map((j: any) => ({
      ...j,
      companyName: j.clientId?.companyName || j.clientId?.title || `${j.clientId?.firstName || ''} ${j.clientId?.lastName || ''}`.trim() || 'Workforce Employer',
    }));

    return res.status(200).json({ success: true, data: formattedJobs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch workforce jobs' });
  }
};

export const updateWorkerPayoutStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { workerId } = req.params;
    const { payoutStatus } = req.body;

    const member = await WorkforceMember.findOne({ _id: workerId, companyId: userId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    member.payoutStatus = payoutStatus;
    await member.save();

    return res.status(200).json({
      success: true,
      message: `Worker payout status updated to ${payoutStatus}!`,
      data: member,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to update payout status' });
  }
};

export const fundPayrollWallet = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { amount, reference, paymentMethod } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid funding amount' });
    }

    const userObj = await User.findById(userId);
    if (!userObj) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentBalance = userObj.payrollWalletBalance || 2500000;
    const newBalance = currentBalance + Number(amount);
    userObj.payrollWalletBalance = newBalance;
    await userObj.save();

    return res.status(200).json({
      success: true,
      message: `Payroll wallet funded with ₦${Number(amount).toLocaleString()} via Flutterwave!`,
      data: {
        payrollWalletBalance: newBalance,
        fundedAmount: Number(amount),
        reference: reference || `FLW-PAYROLL-${Date.now()}`,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fund payroll wallet' });
  }
};
