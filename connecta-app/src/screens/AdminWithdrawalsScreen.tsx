rm root@vm933yhzh:/var/www/connecta# cd /var/www/connecta

git merge --abort || true
git reset --hard HEAD || true
git clean -fdx || true

rm -rf server/dist
git checkout --ours -- server/src/scripts/create-admin.ts

git add .gitignore server/src/scripts/create-admin.ts
git commit -m "Resolve server dist merge conflict"

git pull
npm --prefix server run build
fatal: There is no merge to abort (MERGE_HEAD missing).
HEAD is now at 25a3be9 sjdhs
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        deleted:    server/dist/app.js
        deleted:    server/dist/check-jobs.js
        deleted:    server/dist/config/app.config.js
        deleted:    server/dist/config/cloudinary.config.js
        deleted:    server/dist/config/db.config.js
        deleted:    server/dist/config/env.config.js
        deleted:    server/dist/config/google.config.js
        deleted:    server/dist/config/redis.js
        deleted:    server/dist/controllers/Contact.controller.js
        deleted:    server/dist/controllers/Dashboard.controller.js
        deleted:    server/dist/controllers/GetActiveProject.controller.js
        deleted:    server/dist/controllers/Job.controller.js
        deleted:    server/dist/controllers/Message.controller.js
        deleted:    server/dist/controllers/Profile.controller.js
        deleted:    server/dist/controllers/Project.controller.js
        deleted:    server/dist/controllers/Proposal.controller.js
        deleted:    server/dist/controllers/Verification.controller.js
        deleted:    server/dist/controllers/avatar.controller.js
        deleted:    server/dist/controllers/broadcast.controller.js
        deleted:    server/dist/controllers/contract.controller.js
        deleted:    server/dist/controllers/feed.controller.js
        deleted:    server/dist/controllers/notification.controller.js
        deleted:    server/dist/controllers/payment.controller.js
        deleted:    server/dist/controllers/review.controller.js
        deleted:    server/dist/controllers/settings.controller.js
        deleted:    server/dist/controllers/upload.controller.js
        deleted:    server/dist/controllers/user.controller.js
        deleted:    server/dist/core/database/index.js
        deleted:    server/dist/core/errors/AppError.js
        deleted:    server/dist/core/errors/errorHandler.js
        deleted:    server/dist/core/middleware/admin.middleware.js
        deleted:    server/dist/core/middleware/apiKeyAuth.js
        deleted:    server/dist/core/middleware/auth.middleware.js
        deleted:    server/dist/core/utils/fileUpload.js
        deleted:    server/dist/core/utils/helpers.js
        deleted:    server/dist/core/utils/pagination.js
        deleted:    server/dist/core/utils/socketIO.js
        deleted:    server/dist/debug-rec.js
        deleted:    server/dist/extractEntities.js
        deleted:    server/dist/models/Contact.model.js
        deleted:    server/dist/models/Contract.model.js
        deleted:    server/dist/models/Conversation.model.js
        deleted:    server/dist/models/Feed.model.js
        deleted:    server/dist/models/FeedComment.model.js
        deleted:    server/dist/models/Job.model.js
        deleted:    server/dist/models/JobMatch.model.js
        deleted:    server/dist/models/Message.model.js
        deleted:    server/dist/models/Notification.model.js
        deleted:    server/dist/models/Payment.model.js
        deleted:    server/dist/models/Profile.model.js
        deleted:    server/dist/models/Project.model.js
        deleted:    server/dist/models/Proposal.model.js
        deleted:    server/dist/models/Review.model.js
        deleted:    server/dist/models/SystemSettings.model.js
        deleted:    server/dist/models/Transaction.model.js
        deleted:    server/dist/models/Verification.model.js
        deleted:    server/dist/models/Wallet.model.js
        deleted:    server/dist/models/Withdrawal.model.js
        deleted:    server/dist/models/otp.model.js
        deleted:    server/dist/models/user.model.js
        deleted:    server/dist/routes/Dashboard.routes.js
        deleted:    server/dist/routes/Job.routes.js
        deleted:    server/dist/routes/Message.routes.js
        deleted:    server/dist/routes/Profile.routes.js
        deleted:    server/dist/routes/Project.routes.js
        deleted:    server/dist/routes/Proposal.routes.js
        deleted:    server/dist/routes/agentRoute.js
        deleted:    server/dist/routes/avatar.routes.js
        deleted:    server/dist/routes/broadcast.routes.js
        deleted:    server/dist/routes/contact.routes.js
        deleted:    server/dist/routes/contract.routes.js
        deleted:    server/dist/routes/feed.routes.js
        deleted:    server/dist/routes/notification.routes.js
        deleted:    server/dist/routes/payment.routes.js
        deleted:    server/dist/routes/review.routes.js
        deleted:    server/dist/routes/settings.routes.js
        deleted:    server/dist/routes/upload.routes.js
        deleted:    server/dist/routes/user.routes.js
        deleted:    server/dist/routes/v1.routes.js
        deleted:    server/dist/routes/verification.routes.js
        deleted:    server/dist/scripts/create-admin.js
        deleted:    server/dist/scripts/debug-pdf.js
        deleted:    server/dist/scripts/fix_reviews.js
        deleted:    server/dist/scripts/launch-announcement.js
        deleted:    server/dist/scripts/reset-admin-password.js
        deleted:    server/dist/scripts/seed-feed.js
        deleted:    server/dist/scripts/seed-test-user.js
        deleted:    server/dist/scripts/seedFullDatabase.js
        deleted:    server/dist/scripts/setup-default-email.js
        deleted:    server/dist/scripts/test-cloudinary.js
        deleted:    server/dist/scripts/test-email.js
        deleted:    server/dist/scripts/test-pdf-parse.js
        deleted:    server/dist/scripts/test-smtp-config.js
        deleted:    server/dist/scripts/verifyGigNotification.js
        deleted:    server/dist/services/PDFGeneration.service.js
        deleted:    server/dist/services/Reputation.service.js
        deleted:    server/dist/services/apiKeys.service.js
        deleted:    server/dist/services/cron.service.js
        deleted:    server/dist/services/email.service.js
        deleted:    server/dist/services/feed.service.js
        deleted:    server/dist/services/notification.service.js
        deleted:    server/dist/services/recommendation.service.js
        deleted:    server/dist/services/twilio.service.js
        deleted:    server/dist/services/vtstack.service.js
        deleted:    server/dist/utils/emailTemplates.js
        deleted:    server/dist/utils/seeder.js
        deleted:    server/dist/utils/tfidf.js
        deleted:    server/dist/webhooks/controllers/twilioWebhook.js
        deleted:    server/dist/webhooks/middleware/webhookAuth.js
        deleted:    server/dist/webhooks/routes/webhook.js

no changes added to commit (use "git add" and/or "git commit -a")
The authenticity of host 'github.com (140.82.121.3)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.

> server@1.0.0 build
> tsc

sh: 1: tsc: not found
root@vm933yhzh:/var/www/connecta# cd /var/www/connecta
git remote set-url origin git@github.com:aminumuhammad000/connecta.git
git pull
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
root@vm933yhzh:/var/www/connecta# import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import paymentService from '../services/paymentService';
import { useInAppAlert } from '../components/InAppAlert';

const AdminWithdrawalsScreen = ({ navigation }: any) => {
    const c = useThemeColors();
    const { showAlert } = useInAppAlert();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadWithdrawals = async () => {
        try {
            setIsLoading(true);
            const data = await paymentService.getPendingWithdrawals();
            setWithdrawals(data);
        } catch (error) {
            console.error('Error loading withdrawals:', error);
            showAlert({ title: 'Error', message: 'Failed to load withdrawals', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadWithdrawals();
        }, [])
    );

    const handleApprove = async (id: string, amount: number) => {
        Alert.alert(
            'Confirm Approval',
            `Are you sure you want to process this withdrawal of ₦${amount}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Process',
                    style: 'default',
                    onPress: async () => {
                        try {
                            setProcessingId(id);
                            await paymentService.processWithdrawal(id);
                            showAlert({ title: 'Success', message: 'Withdrawal processed!', type: 'success' });
                            loadWithdrawals();
                        } catch (error: any) {
                            console.error('Process error:', error);
                            showAlert({ title: 'Error', message: error.message || 'Failed to process', type: 'error' });
                        } finally {
                            setProcessingId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const isProcessing = processingId === item._id;

        return (
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.row}>
                    <View>
                        <Text style={[styles.amount, { color: c.text }]}>
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: item.currency || 'NGN' }).format(item.amount)}
                        </Text>
                        <Text style={[styles.date, { color: c.subtext }]}>
                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                        </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={{ color: '#D97706', fontSize: 12, fontWeight: '700' }}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: c.border }]} />

                <View style={{ gap: 4, marginBottom: 12 }}>
                    <Text style={{ color: c.text, fontWeight: '600' }}>User Details:</Text>
                    <Text style={{ color: c.subtext }}>{item.userId?.firstName} {item.userId?.lastName}</Text>
                    <Text style={{ color: c.subtext }}>{item.userId?.email}</Text>
                </View>

                <View style={{ gap: 4, marginBottom: 16 }}>
                    <Text style={{ color: c.text, fontWeight: '600' }}>Bank Details:</Text>
                    <Text style={{ color: c.subtext }}>Bank: {item.bankDetails?.bankName}</Text>
                    <Text style={{ color: c.subtext }}>Account: {item.bankDetails?.accountNumber}</Text>
                    <Text style={{ color: c.subtext }}>Name: {item.bankDetails?.accountName}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: c.primary, opacity: isProcessing ? 0.7 : 1 }]}
                    onPress={() => handleApprove(item._id, item.amount)}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="check-circle" size={20} color="white" />
                            <Text style={styles.btnText}>Approve & Pay</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: c.text }]}>Withdrawal Requests</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={c.primary} />
                </View>
            ) : (
                <FlatList
                    data={withdrawals}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialIcons name="fact-check" size={64} color={c.subtext} />
                            <Text style={{ color: c.subtext, marginTop: 16 }}>No pending withdrawals</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: { fontSize: 20, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    list: { padding: 16 },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    amount: { fontSize: 24, fontWeight: '800' },
    date: { fontSize: 13, marginTop: 4 },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    divider: { height: 1, width: '100%', marginBottom: 16 },
    btn: {
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default AdminWithdrawalsScreen;
