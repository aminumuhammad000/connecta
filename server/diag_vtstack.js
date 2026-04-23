import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model';
import Wallet from './src/models/Wallet.model';
import vtstackService from './src/services/vtstack.service';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/connecta');
        console.log('Connected to DB');
        
        const user = await User.findOne({ email: 'swallern@gmail.com' });
        if (!user) {
            console.log('User swallern@gmail.com not found');
            process.exit(0);
        }
        
        console.log('Found User:', user._id);
        
        let wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) {
            wallet = new Wallet({ userId: user._id });
            await wallet.save();
        }
        
        if (wallet.vtstackVirtualAccount && wallet.vtstackVirtualAccount.accountNumber) {
            console.log('Account exists:', wallet.vtstackVirtualAccount.accountNumber);
        } else {
            console.log('Creating account...');
            const res = await vtstackService.createVirtualAccount({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phoneNumber || '08000000000',
                bvn: '00000000000',
                reference: `diag_${Date.now()}`
            });
            
            if (res.success) {
                wallet.vtstackVirtualAccount = res.data;
                await wallet.save();
                console.log('Account created:', res.data.accountNumber);
            } else {
                console.log('Creation failed:', res.message);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

run();
