import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, Platform, Modal, Alert, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { getCollaboProject, getMessages, sendMessage, getTasks, createTask, updateTask, deleteTask, getFiles, uploadFile, fundCollaboProject, fundCollaboProjectFromWallet, activateCollaboProject, startWork, removeFromRole, inviteToRole, addRole, updateRole, markWorkspaceRead, generateAutoTasks, getActivities, deleteFile, aiInviteToRole }
    from '../services/collaboService';
import { getWalletBalance } from '../services/paymentService';
import * as WebBrowser from 'expo-web-browser';
import { useInAppAlert } from '../components/InAppAlert';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../utils/constants';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function CollaboWorkspaceScreen({ route, navigation }: any) {
    const { projectId } = route.params;
    const c = useThemeColors();
    const { socket } = useSocket();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'tasks' | 'files' | 'activities'>('dashboard');
    const [projectData, setProjectData] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { showAlert } = useInAppAlert();
    const [unreadCount, setUnreadCount] = useState(0);

    // Task State
    const [tasks, setTasks] = useState<any[]>([]);
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assigneeId: '' });
    const [activeTaskTab, setActiveTaskTab] = useState('todo'); // For mobile tabs view instead of horizontal scroll if preferred, but let's try columns first. 
    // File State
    const [files, setFiles] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    // Activity State
    const [activities, setActivities] = useState<any[]>([]);

    // Role State
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [roleForm, setRoleForm] = useState({ title: '', description: '', budget: '', skills: '' });

    // Funding State
    const [isFundingModalVisible, setIsFundingModalVisible] = useState(false);
    const [fundingLoading, setFundingLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    useEffect(() => {
        loadData();
        if (user?.userType === 'client') {
            loadWalletBalance();
        }
    }, [projectId]);

    const loadWalletBalance = async () => {
        try {
            const data = await getWalletBalance();
            setWalletBalance(data.balance);
        } catch (error) {
            console.error('Error loading wallet balance:', error);
        }
    };

    useEffect(() => {
        if (route.params?.selectedFreelancer && route.params?.targetRoleId) {
            const { selectedFreelancer, targetRoleId } = route.params;

            const handleInvite = async () => {
                try {
                    await inviteToRole(targetRoleId, selectedFreelancer._id);
                    showAlert({ title: 'Success', message: 'Invitation sent!', type: 'success' });
                    loadData();
                } catch (error: any) {
                    showAlert({ title: 'Error', message: error.message || 'Failed to invite', type: 'error' });
                }
            };
            handleInvite();

            // Clear params to prevent re-triggering
            navigation.setParams({ selectedFreelancer: undefined, targetRoleId: undefined });
        }
    }, [route.params?.selectedFreelancer, route.params?.targetRoleId]);

    useEffect(() => {
        if (route.params?.openAddRole) {
            setIsEditingRole(false);
            setRoleForm({ title: '', description: '', budget: '', skills: '' });
            setIsRoleModalVisible(true);
            navigation.setParams({ openAddRole: undefined });
        }
    }, [route.params?.openAddRole]);

    useEffect(() => {
        if (activeTab === 'chat') {
            setUnreadCount(0);
            if (projectData?.workspace?._id) {
                // Mark as read on server
                markWorkspaceRead(projectData.workspace._id).catch(console.error);
            }
        }
    }, [activeTab, projectData]);

    useEffect(() => {
        if (!socket || !projectData?.workspace) return;

        const workspaceId = projectData.workspace._id;
        socket.emit('room:join', workspaceId);

        socket.on('collabo:message', (newMessage: any) => {
            if (newMessage.workspaceId === workspaceId) {
                setMessages(prev => {
                    if (prev.some(m => m._id === newMessage._id)) return prev;
                    return [...prev, newMessage];
                });
                if (activeTab !== 'chat') {
                    setUnreadCount(prev => prev + 1);
                }
            }
        });

        socket.on('collabo:task_update', (updatedTask: any) => {
            if (updatedTask.workspaceId === workspaceId) {
                setTasks(prev => {
                    const idx = prev.findIndex(t => t._id === updatedTask._id);
                    if (idx > -1) {
                        const newTasks = [...prev];
                        newTasks[idx] = updatedTask;
                        return newTasks;
                    }
                    return [updatedTask, ...prev];
                });
            }
        });

        socket.on('collabo:task_delete', (deletedTaskId: string) => {
            setTasks(prev => prev.filter(t => t._id !== deletedTaskId));
        });

        socket.on('collabo:file_upload', (newFile: any) => {
            if (newFile.workspaceId === workspaceId) {
                setFiles(prev => {
                    if (prev.some(f => f._id === newFile._id)) return prev;
                    return [newFile, ...prev];
                });
            }
        });
        socket.on('collabo:activity', (newActivity: any) => {
            if (newActivity.workspaceId === workspaceId) {
                setActivities(prev => [newActivity, ...prev].slice(0, 50));
            }
        });

        return () => {
            socket.emit('room:leave', workspaceId);
            socket.off('collabo:message');
            socket.off('collabo:task_update');
            socket.off('collabo:task_delete');
            socket.off('collabo:file_upload');
        };
    }, [socket, projectData, activeTab]);

    const loadData = async () => {
        try {
            const data = await getCollaboProject(projectId);
            setProjectData(data);

            // Load messages for default channel
            if (data.workspace) {
                const msgs = await getMessages(data.workspace._id, 'General');
                setMessages(msgs);

                const taskList = await getTasks(data.workspace._id);
                setTasks(taskList);

                const fileList = await getFiles(data.workspace._id);
                setFiles(fileList);

                const activityList = await getActivities(data.workspace._id);
                setActivities(activityList);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            // Optimistic update
            const tempMsg = {
                _id: Date.now().toString(),
                content: inputText,
                senderId: user,
                createdAt: new Date().toISOString(),
                workspaceId: projectData.workspace._id
            };
            // setMessages(prev => [...prev, tempMsg]); // Optional: wait for ack instead

            const myRole = projectData?.roles?.find((r: any) => r.freelancerId?._id === user?._id);
            const senderRole = myRole ? myRole.title : (projectData?.project?.clientId?._id === user?._id ? 'Client' : 'Member');

            await sendMessage({
                workspaceId: projectData.workspace._id,
                channelName: 'General',
                senderRole,
                content: inputText
            });
            setInputText('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleFundProject = () => {
        if (!projectData?.project) return;
        setIsFundingModalVisible(true);
    };

    const handlePayWithWallet = async () => {
        const budget = projectData.project.totalBudget || 0;
        if (walletBalance !== null && walletBalance < budget) {
            Alert.alert("Insufficient Balance", "Your wallet balance is lower than the project budget. Please top up your wallet or use Flutterwave.");
            return;
        }

        try {
            setFundingLoading(true);
            const response = await fundCollaboProjectFromWallet(projectId);
            if (response.success) {
                showAlert({ title: 'Project Funded!', message: 'Your project is now active.', type: 'success' });
                setIsFundingModalVisible(false);
                loadData();
                loadWalletBalance();
            }
        } catch (error: any) {
            showAlert({ title: 'Funding Failed', message: error.message || 'Payment could not be processed.', type: 'error' });
        } finally {
            setFundingLoading(false);
        }
    };

    const handlePayWithFlutterwave = async () => {
        try {
            setFundingLoading(true);
            const response = await fundCollaboProject(projectId);

            if (response && response.authorizationUrl) {
                await WebBrowser.openBrowserAsync(response.authorizationUrl);
                setIsFundingModalVisible(false);
                Alert.alert(
                    "Funding Initiated",
                    "Once you complete the payment in the browser, your project status will be updated automatically.",
                    [{ text: "OK", onPress: () => loadData() }]
                );
            } else {
                throw new Error("Failed to get payment URL");
            }
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to initiate Flutterwave payment', type: 'error' });
        } finally {
            setFundingLoading(false);
        }
    };

    const handleStartWork = async () => {
        try {
            await startWork(projectId);
            showAlert({ title: 'Work started! Team has been notified.', type: 'success' });
            loadData();
        } catch (error: any) {
            showAlert({ title: error.message || 'Failed to start work', type: 'error' });
        }
    };

    const handleRemoveFreelancer = async (roleId: string) => {
        Alert.alert(
            "Remove Member",
            "Are you sure you want to remove this freelancer from the role?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeFromRole(roleId);
                            showAlert({ title: 'Success', message: 'Member removed from project', type: 'success' });
                            loadData();
                        } catch (error: any) {
                            showAlert({ title: 'Error', message: error.message || 'Failed to remove member', type: 'error' });
                        }
                    }
                }
            ]
        );
    };

    const handleAIInvite = async (roleId: string) => {
        try {
            const result = await aiInviteToRole(roleId);
            showAlert({
                title: 'AI Invite Sent',
                message: result.message || 'AI has invited the best match for this role!',
                type: 'success'
            });
            loadData();
        } catch (error: any) {
            showAlert({ title: 'AI Invite Failed', message: error.message || 'Failed to perform AI invitation', type: 'error' });
        }
    };

    const handleGenerateAutoTasks = async () => {
        try {
            setFundingLoading(true);
            await generateAutoTasks(projectId);
            showAlert({ title: 'AI Tasks Generated', message: 'The AI has created a roadmap for your team.', type: 'success' });
            loadData();
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to generate tasks', type: 'error' });
        } finally {
            setFundingLoading(false);
        }
    };

    const handleSaveRole = async () => {
        if (!roleForm.title || !roleForm.budget) {
            showAlert({ title: 'Validation Error', message: 'Please fill in title and budget', type: 'error' });
            return;
        }

        try {
            const skillsList = roleForm.skills.split(',').map(s => s.trim()).filter(Boolean);

            if (isEditingRole && selectedRole) {
                await updateRole(selectedRole._id, {
                    title: roleForm.title,
                    description: roleForm.description,
                    budget: Number(roleForm.budget),
                    skills: skillsList
                });
                showAlert({ title: 'Success', message: 'Role updated successfully', type: 'success' });
            } else {
                const newRole = await addRole(projectId, {
                    title: roleForm.title,
                    description: roleForm.description,
                    budget: Number(roleForm.budget),
                    skills: skillsList
                });

                if (route.params?.inviteFreelancerId) {
                    try {
                        await inviteToRole(newRole._id, route.params.inviteFreelancerId);
                        showAlert({ title: 'Success', message: 'Role added and invitation sent!', type: 'success' });
                        navigation.setParams({ inviteFreelancerId: undefined });
                    } catch (err: any) {
                        showAlert({ title: 'Partial Success', message: 'Role added but invite failed: ' + err.message, type: 'warning' });
                    }
                } else {
                    showAlert({ title: 'Success', message: 'Role added successfully', type: 'success' });
                }
            }

            setIsRoleModalVisible(false);
            setRoleForm({ title: '', description: '', budget: '', skills: '' });
            setSelectedRole(null);
            setIsEditingRole(false);
            loadData();
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to save role', type: 'error' });
        }
    };

    const handleConfirmTaskDone = async (task: any) => {
        try {
            const nextStatus = task.status === 'todo' ? 'in_progress' : (task.status === 'in_progress' ? 'review' : 'done');
            await updateTask(task._id, { status: nextStatus });
            showAlert({ title: 'Status Updated', message: `Task moved to ${nextStatus}`, type: 'success' });
            loadData();
        } catch (error: any) {
            showAlert({ title: 'Error', message: error.message || 'Failed to update task', type: 'error' });
        }
    };

    const renderDashboard = () => {
        const isClient = projectData?.project?.clientId?._id === user?._id;
        const isPlanning = projectData?.project?.status === 'planning';
        const project = projectData?.project;

        return (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Wallet Balance Card */}
                <View style={{ padding: 16 }}>
                    <View style={{
                        backgroundColor: c.isDark ? '#1F2937' : c.primary,
                        borderRadius: 24,
                        padding: 24,
                        shadowColor: c.primary,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.2,
                        shadowRadius: 20,
                        elevation: 10,
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Decorative background element */}
                        <View style={{
                            position: 'absolute',
                            right: -20,
                            top: -20,
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>PROJECT BUDGET</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '800' }}>₦{project?.totalBudget?.toLocaleString()}</Text>
                                    <View style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>NGN</Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="card" size={28} color="rgba(255,255,255,0.6)" />
                        </View>

                        <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                backgroundColor: isPlanning ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: isPlanning ? '#F59E0B' : '#10B981',
                                    marginRight: 6
                                }} />
                                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>
                                    {project?.status?.toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }} />
                            {isClient && isPlanning && (
                                <TouchableOpacity
                                    onPress={handleFundProject}
                                    style={{
                                        backgroundColor: '#FFF',
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 14,
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Ionicons name="add-circle" size={18} color={c.primary} style={{ marginRight: 6 }} />
                                    <Text style={{ color: c.primary, fontWeight: '800', fontSize: 13 }}>PAY AND ACTIVATE</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {isClient && (project?.status === 'active' || project?.status === 'in_progress') && (
                    (() => {
                        const anyRoleFilled = projectData?.roles?.some((r: any) => r.status === 'filled' && r.freelancerId);
                        const isInProgress = project?.status === 'in_progress';

                        if (anyRoleFilled && !isInProgress) {
                            return (
                                <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
                                    <TouchableOpacity
                                        onPress={handleStartWork}
                                        activeOpacity={0.8}
                                        style={{
                                            backgroundColor: '#10B981',
                                            paddingVertical: 16,
                                            borderRadius: 20,
                                            alignItems: 'center',
                                            shadowColor: '#10B981',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 10,
                                            elevation: 5,
                                            flexDirection: 'row',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Ionicons name="rocket" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>START THE JOB</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }
                        return null;
                    })()
                )}

                {/* Team Section */}
                <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 }}>
                        <View>
                            <Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>Team Roles</Text>
                            <Text style={{ fontSize: 13, color: c.subtext, marginTop: 2 }}>{projectData?.roles?.length || 0} active positions</Text>
                        </View>
                        {user?.userType === 'client' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setIsEditingRole(false);
                                    setRoleForm({ title: '', description: '', budget: '', skills: '' });
                                    setIsRoleModalVisible(true);
                                }}
                                style={{
                                    backgroundColor: c.primary + '15',
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 12
                                }}
                            >
                                <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>+ New Role</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={width * 0.85 + 16}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                    >
                        {projectData?.roles?.map((role: any, index: number) => {
                            const isFilled = role.status === 'filled' && role.freelancerId;
                            const freelancer = role.freelancerId;
                            const isClientUser = user?.userType === 'client';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.9}
                                    onPress={() => isFilled && navigation.navigate('PublicFreelancerProfile', { id: freelancer._id })}
                                    style={{
                                        backgroundColor: c.card,
                                        width: width * 0.85,
                                        marginRight: 16,
                                        padding: 20,
                                        borderRadius: 24,
                                        borderWidth: 1,
                                        borderColor: c.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 12,
                                        elevation: 3
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 16,
                                            backgroundColor: isFilled ? c.primary + '10' : '#F3F4F6',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <MaterialIcons
                                                name={isFilled ? "verified-user" : "person-search"}
                                                size={26}
                                                color={isFilled ? c.primary : '#9CA3AF'}
                                            />
                                        </View>
                                        <View style={{
                                            backgroundColor: isFilled ? '#D1FAE5' : '#FEF3C7',
                                            paddingHorizontal: 10,
                                            paddingVertical: 4,
                                            borderRadius: 10
                                        }}>
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: isFilled ? '#065F46' : '#92400E' }}>
                                                {isFilled ? 'FILLED' : 'OPEN'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={{ fontSize: 18, fontWeight: '800', color: c.text, marginBottom: 4 }}>{role.title}</Text>
                                    <Text style={{ fontSize: 14, color: c.subtext, lineHeight: 18, height: 36 }} numberOfLines={2}>
                                        {role.description || "No description provided for this role."}
                                    </Text>

                                    <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View>
                                            <Text style={{ fontSize: 11, color: c.subtext, fontWeight: '600' }}>Budget</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>₦{role.budget?.toLocaleString()}</Text>
                                        </View>

                                        {isClientUser ? (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setSelectedRole(role);
                                                    setRoleForm({
                                                        title: role.title,
                                                        description: role.description || '',
                                                        budget: role.budget.toString(),
                                                        skills: role.skills?.join(', ') || ''
                                                    });
                                                    setIsEditingRole(true);
                                                    setIsRoleModalVisible(true);
                                                }}
                                                style={{ backgroundColor: c.background, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: c.border }}
                                            >
                                                <MaterialIcons name="settings" size={18} color={c.text} />
                                            </TouchableOpacity>
                                        ) : (
                                            <MaterialIcons name="arrow-forward" size={18} color={c.border} />
                                        )}
                                    </View>

                                    {isFilled && (
                                        <View style={{
                                            marginTop: 20,
                                            paddingTop: 16,
                                            borderTopWidth: 1,
                                            borderTopColor: c.border,
                                            flexDirection: 'row',
                                            alignItems: 'center'
                                        }}>
                                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
                                                {freelancer?.avatar ? (
                                                    <Image source={{ uri: freelancer.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                                                ) : (
                                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>{freelancer?.firstName?.[0]}</Text>
                                                )}
                                            </View>
                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 13 }}>{freelancer?.firstName} {freelancer?.lastName}</Text>
                                                <Text style={{ color: c.subtext, fontSize: 11 }}>Assigned Freelancer</Text>
                                            </View>
                                        </View>
                                    )}

                                    {!isFilled && isClientUser && (
                                        <View style={{ marginTop: 20, flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (projectData?.project?.status === 'planning') {
                                                        Alert.alert("Payment Required", "Please fund the project to invite freelancers.", [
                                                            { text: "Cancel" },
                                                            { text: "Pay Now", onPress: handleFundProject }
                                                        ]);
                                                        return;
                                                    }
                                                    navigation.navigate('SelectFreelancer', {
                                                        roleId: role._id,
                                                        projectId: projectId
                                                    });
                                                }}
                                                style={{
                                                    flex: 4,
                                                    backgroundColor: c.primary,
                                                    paddingVertical: 14,
                                                    borderRadius: 16,
                                                    alignItems: 'center',
                                                    shadowColor: c.primary,
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.2,
                                                    shadowRadius: 8,
                                                    elevation: 4
                                                }}
                                            >
                                                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14 }}>Invite</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleAIInvite(role._id)}
                                                style={{
                                                    flex: 1.2,
                                                    backgroundColor: c.isDark ? '#374151' : '#F3F4F6',
                                                    paddingVertical: 14,
                                                    borderRadius: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: 1,
                                                    borderColor: c.border
                                                }}
                                            >
                                                <Ionicons name="sparkles" size={20} color={c.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        );
    };


    const renderChat = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={{ flex: 1, backgroundColor: c.background }}
        >
            <FlatList
                data={messages}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const isMe = item.senderId?._id === user?._id;
                    const prevMsg = messages[index - 1];
                    const isSameSender = prevMsg?.senderId?._id === item.senderId?._id;
                    const nextMsg = messages[index + 1];
                    const isLastInGroup = nextMsg?.senderId?._id !== item.senderId?._id;

                    return (
                        <View style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            marginBottom: isSameSender ? 4 : 16,
                            marginTop: isSameSender ? 0 : 8,
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                        }}>
                            {!isMe && !isSameSender && (
                                <View style={{
                                    width: 32, height: 32,
                                    borderRadius: 12,
                                    backgroundColor: c.primary + '20',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                    marginBottom: 4
                                }}>
                                    {item.senderId?.avatar ? (
                                        <Image source={{ uri: item.senderId.avatar }} style={{ width: 32, height: 32, borderRadius: 12 }} />
                                    ) : (
                                        <Text style={{ fontSize: 12, fontWeight: '800', color: c.primary }}>{item.senderId?.firstName?.[0]}</Text>
                                    )}
                                </View>
                            )}
                            {!isMe && isSameSender && <View style={{ width: 40 }} />}

                            <View style={{ flexShrink: 1 }}>
                                {!isMe && !isSameSender && (
                                    <Text style={{ fontSize: 11, color: c.subtext, marginBottom: 4, marginLeft: 4, fontWeight: '700' }}>
                                        {item.senderId?.firstName} {item.senderId?.lastName} • {item.senderRole}
                                    </Text>
                                )}
                                <View style={{
                                    backgroundColor: isMe ? c.primary : c.card,
                                    padding: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 18,
                                    borderBottomRightRadius: isMe ? (isLastInGroup ? 4 : 18) : 18,
                                    borderBottomLeftRadius: isMe ? 18 : (isLastInGroup ? 4 : 18),
                                    borderWidth: isMe ? 0 : 1,
                                    borderColor: c.border,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 5,
                                    elevation: 1
                                }}>
                                    <Text style={{ color: isMe ? '#FFF' : c.text, fontSize: 15, lineHeight: 20 }}>{item.content}</Text>
                                </View>
                                {isLastInGroup && (
                                    <Text style={{ fontSize: 9, color: c.subtext, marginTop: 4, alignSelf: isMe ? 'flex-end' : 'flex-start', opacity: 0.7 }}>
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                }}
            />
            <View style={{
                padding: 12,
                paddingHorizontal: 16,
                backgroundColor: 'transparent',
                paddingBottom: Platform.OS === 'ios' ? 24 : 12
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: c.card,
                    borderRadius: 24,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: c.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5
                }}>
                    <TouchableOpacity style={{ padding: 8 }}>
                        <Ionicons name="add-circle-outline" size={24} color={c.subtext} />
                    </TouchableOpacity>
                    <TextInput
                        style={{
                            flex: 1,
                            padding: 10,
                            paddingHorizontal: 12,
                            color: c.text,
                            fontSize: 15,
                            maxHeight: 100
                        }}
                        placeholder="Message team..."
                        placeholderTextColor={c.subtext}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        style={{
                            backgroundColor: inputText.trim() ? c.primary : 'transparent',
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Ionicons name="send" size={20} color={inputText.trim() ? "#FFF" : c.subtext} />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );

    // ... rest of the file

    const handleSaveTask = async () => {
        if (!taskForm.title.trim()) return;
        try {
            if (isEditingTask && selectedTask) {
                const updated = await updateTask(selectedTask._id, taskForm);
                setTasks(prev => prev.map(t => t._id === selectedTask._id ? updated : t));
                showAlert({ title: 'Task updated', type: 'success' });
            } else {
                const newTask = await createTask({
                    workspaceId: projectData.workspace._id,
                    ...taskForm,
                    status: 'todo'
                });
                setTasks(prev => [newTask, ...prev]);
                showAlert({ title: 'Task created', type: 'success' });
            }
            setTaskForm({ title: '', description: '', priority: 'medium', assigneeId: '' });
            setIsTaskModalVisible(false);
            setIsEditingTask(false);
            setSelectedTask(null);
        } catch (error) {
            console.error(error);
            showAlert({ title: 'Failed to save task', type: 'error' });
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTask(taskId);
                            setTasks(prev => prev.filter(t => t._id !== taskId));
                            showAlert({ title: 'Task deleted', type: 'success' });
                        } catch (error) {
                            showAlert({ title: 'Failed to delete task', type: 'error' });
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
        try {
            // Optimistic
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
            await updateTask(taskId, { status: newStatus });
        } catch (error) {
            console.error(error);
        }
    };

    const renderTasks = () => {
        const isClient = projectData?.project?.clientId?._id === user?._id;
        const columns = [
            { id: 'todo', title: 'To Do', color: '#64748B', icon: 'list' },
            { id: 'in_progress', title: 'In Progress', color: '#3B82F6', icon: 'trending-up' },
            { id: 'review', title: 'Review', color: '#F59E0B', icon: 'visibility' },
            { id: 'done', title: 'Done', color: '#10B981', icon: 'check-circle' }
        ];

        const teamMembers = projectData?.roles?.filter((r: any) => r.status === 'filled').map((r: any) => r.freelancerId) || [];

        return (
            <View style={{ flex: 1 }}>
                <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Project Tasks</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {isClient && (
                            <TouchableOpacity
                                onPress={handleGenerateAutoTasks}
                                disabled={fundingLoading}
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.background, borderWidth: 1, borderColor: c.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}
                            >
                                <MaterialIcons name="auto-awesome" size={18} color={c.primary} />
                                <Text style={{ color: c.primary, fontWeight: '600', marginLeft: 4 }}>AI Auto</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                setIsEditingTask(false);
                                setTaskForm({ title: '', description: '', priority: 'medium', assigneeId: '' });
                                setIsTaskModalVisible(true);
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                        >
                            <MaterialIcons name="add" size={20} color="#FFF" />
                            <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 4 }}>Add Task</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                    {columns.map(col => (
                        <View key={col.id} style={{ width: width - 40, marginHorizontal: 20, paddingVertical: 8, height: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
                                <MaterialIcons name={col.icon as any} size={20} color={col.color} style={{ marginRight: 8 }} />
                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 16, flex: 1 }}>{col.title}</Text>
                                <View style={{ backgroundColor: col.color + '20', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 }}>
                                    <Text style={{ fontSize: 12, color: col.color, fontWeight: '700' }}>
                                        {tasks.filter(t => t.status === col.id).length}
                                    </Text>
                                </View>
                            </View>

                            <ScrollView style={{ flex: 1, backgroundColor: c.isDark ? '#111' : '#F8FAFC', borderRadius: 16, padding: 8 }}>
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <View
                                        key={task._id}
                                        style={{
                                            backgroundColor: c.card,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: c.border,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 4,
                                            elevation: 2
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>{task.title}</Text>
                                                {task.description ? <Text style={{ color: c.subtext, fontSize: 13 }} numberOfLines={2}>{task.description}</Text> : null}
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                                <TouchableOpacity onPress={() => {
                                                    setSelectedTask(task);
                                                    setTaskForm({
                                                        title: task.title,
                                                        description: task.description || '',
                                                        priority: task.priority || 'medium',
                                                        assigneeId: task.assigneeId?._id || ''
                                                    });
                                                    setIsEditingTask(true);
                                                    setIsTaskModalVisible(true);
                                                }}>
                                                    <MaterialIcons name="edit" size={18} color={c.subtext} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDeleteTask(task._id)}>
                                                    <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {task.assigneeId ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.primary + '20', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                                                            <Text style={{ color: c.primary, fontSize: 10, fontWeight: '700' }}>{task.assigneeId.firstName?.[0]}</Text>
                                                        </View>
                                                        <Text style={{ fontSize: 12, color: c.subtext }}>{task.assigneeId.firstName}</Text>
                                                    </View>
                                                ) : (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <MaterialIcons name="person-outline" size={14} color={c.subtext} style={{ marginRight: 4 }} />
                                                        <Text style={{ fontSize: 12, color: c.subtext }}>Unassigned</Text>
                                                    </View>
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => {
                                                    const nextWrapper: any = { todo: 'in_progress', in_progress: 'review', review: 'done' };
                                                    const nextStatus = nextWrapper[task.status];
                                                    if (nextStatus) {
                                                        handleUpdateTaskStatus(task._id, nextStatus);
                                                    }
                                                }}
                                                disabled={
                                                    (task.status === 'review' && !isClient) ||
                                                    ((task.status === 'todo' || task.status === 'in_progress') && task.assigneeId?._id !== user?._id && !isClient)
                                                }
                                                style={{
                                                    backgroundColor: (task.status === 'review' && !isClient) ? c.border + '50' : c.primary + '10',
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: (task.status === 'review' && !isClient) ? c.border : c.primary
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 12,
                                                    color: (task.status === 'review' && !isClient) ? c.subtext : c.primary,
                                                    fontWeight: '700'
                                                }}>
                                                    {task.status === 'todo' ? 'Start Work' : (task.status === 'in_progress' ? 'Submit' : (task.status === 'review' ? 'Confirm Done' : 'Completed'))}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                                {tasks.filter(t => t.status === col.id).length === 0 && (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <MaterialIcons name="inbox" size={40} color={c.subtext + '40'} />
                                        <Text style={{ color: c.subtext, fontSize: 14, marginTop: 8 }}>No tasks here</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>

                <Modal
                    visible={isTaskModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsTaskModalVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 }}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                            <View style={{ backgroundColor: c.card, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '700', color: c.text }}>{isEditingTask ? 'Edit Task' : 'New Task'}</Text>
                                    <TouchableOpacity onPress={() => setIsTaskModalVisible(false)}>
                                        <MaterialIcons name="close" size={24} color={c.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={{ color: c.text, fontWeight: '600', marginBottom: 8 }}>Title</Text>
                                <TextInput
                                    style={{ backgroundColor: c.background, padding: 12, borderRadius: 12, color: c.text, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}
                                    placeholder="What needs to be done?"
                                    placeholderTextColor={c.subtext}
                                    value={taskForm.title}
                                    onChangeText={(text) => setTaskForm({ ...taskForm, title: text })}
                                />

                                <Text style={{ color: c.text, fontWeight: '600', marginBottom: 8 }}>Description (Optional)</Text>
                                <TextInput
                                    style={{ backgroundColor: c.background, padding: 12, borderRadius: 12, color: c.text, borderWidth: 1, borderColor: c.border, marginBottom: 16, minHeight: 80 }}
                                    placeholder="Add more details..."
                                    placeholderTextColor={c.subtext}
                                    value={taskForm.description}
                                    onChangeText={(text) => setTaskForm({ ...taskForm, description: text })}
                                    multiline
                                    textAlignVertical="top"
                                />

                                <Text style={{ color: c.text, fontWeight: '600', marginBottom: 8 }}>Assign To</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                    {teamMembers.map((member: any) => (
                                        <TouchableOpacity
                                            key={member._id}
                                            onPress={() => setTaskForm({ ...taskForm, assigneeId: member._id })}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                                borderRadius: 20,
                                                backgroundColor: taskForm.assigneeId === member._id ? c.primary : c.background,
                                                borderWidth: 1,
                                                borderColor: taskForm.assigneeId === member._id ? c.primary : c.border,
                                                marginRight: 8,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 6
                                            }}
                                        >
                                            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: taskForm.assigneeId === member._id ? 'rgba(255,255,255,0.3)' : c.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: taskForm.assigneeId === member._id ? '#FFF' : c.primary, fontSize: 9, fontWeight: '700' }}>{member.firstName?.[0]}</Text>
                                            </View>
                                            <Text style={{ color: taskForm.assigneeId === member._id ? '#FFF' : c.text, fontSize: 13, fontWeight: '600' }}>{member.firstName}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity
                                        onPress={() => setIsTaskModalVisible(false)}
                                        style={{ flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: c.border }}
                                    >
                                        <Text style={{ color: c.subtext, fontWeight: '600' }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSaveTask}
                                        disabled={!taskForm.title.trim()}
                                        style={{ flex: 2, backgroundColor: taskForm.title.trim() ? c.primary : c.subtext + '40', padding: 14, borderRadius: 12, alignItems: 'center' }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: '700' }}>{isEditingTask ? 'Update Task' : 'Create Task'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
            </View>
        );
    };

    const handleUploadFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({});

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setIsUploading(true);

                const formData = new FormData();
                formData.append('workspaceId', projectData.workspace._id);
                // @ts-ignore: React Native FormData
                formData.append('file', {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/octet-stream'
                });

                const newFile = await uploadFile(formData);
                setFiles(prev => [newFile, ...prev]);

            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("File upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const renderFiles = () => (
        <View style={{ flex: 1, padding: 16 }}>
            <TouchableOpacity
                onPress={handleUploadFile}
                disabled={isUploading}
                style={{
                    borderWidth: 2,
                    borderColor: c.primary,
                    borderStyle: 'dashed',
                    borderRadius: 16,
                    padding: 24,
                    alignItems: 'center',
                    marginBottom: 24,
                    backgroundColor: c.card
                }}>
                {isUploading ? (
                    <ActivityIndicator color={c.primary} />
                ) : (
                    <>
                        <MaterialIcons name="cloud-upload" size={32} color={c.primary} />
                        <Text style={{ marginTop: 8, color: c.text, fontWeight: '600' }}>Drop files or tap to upload</Text>
                    </>
                )}
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 }}>Recent Files</Text>

            <FlatList
                data={files}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: c.border,
                        backgroundColor: c.card,
                        borderRadius: 12,
                        marginBottom: 8
                    }}>
                        <View style={{
                            width: 40, height: 40,
                            backgroundColor: c.border,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                            overflow: 'hidden'
                        }}>
                            {item.type.includes('image') ? (
                                <Image source={{ uri: item.url }} style={{ width: 40, height: 40 }} resizeMode="cover" />
                            ) : (
                                <MaterialIcons
                                    name={item.type.includes('image') ? 'image' : (item.type.includes('pdf') ? 'picture-as-pdf' : 'description')}
                                    size={24}
                                    color={c.subtext}
                                />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                                <Text style={{ fontWeight: '600', color: c.text }}>{item.name}</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 12, color: c.subtext }}>
                                {(item.size / 1024).toFixed(1)} KB • Uploaded by {item.uploaderId.firstName}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(item.url)} style={{ padding: 4 }}>
                            <MaterialIcons name="visibility" size={20} color={c.primary} />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={{ color: c.subtext, textAlign: 'center', marginTop: 20 }}>No files yet.</Text>}
            />
        </View>
    );

    const renderActivities = () => (
        <View style={{ flex: 1, padding: 16 }}>
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>Activity Pulse</Text>
                <Text style={{ fontSize: 13, color: c.subtext, marginTop: 4 }}>Real-time updates from your team</Text>
            </View>

            <FlatList
                data={activities}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const activityTime = new Date(item.createdAt).getTime();
                    const isNew = index === 0 && Date.now() - activityTime < 30000;

                    return (
                        <View style={{
                            flexDirection: 'row',
                            paddingVertical: 14,
                            borderBottomWidth: index === activities.length - 1 ? 0 : 1,
                            borderBottomColor: c.border,
                            backgroundColor: isNew ? c.primary + '08' : 'transparent',
                            borderRadius: isNew ? 12 : 0,
                            paddingHorizontal: isNew ? 12 : 0,
                        }}>
                            <View style={{ position: 'relative' }}>
                                <View style={{
                                    width: 40, height: 40,
                                    borderRadius: 20,
                                    backgroundColor: c.border,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12
                                }}>
                                    {item.userId?.avatar ? (
                                        <Image source={{ uri: item.userId.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                    ) : (
                                        <Text style={{ color: c.subtext, fontWeight: '700' }}>{item.userId?.firstName?.[0]}</Text>
                                    )}
                                </View>
                                {isNew && (
                                    <View style={{
                                        position: 'absolute',
                                        right: 10,
                                        bottom: 0,
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: '#10B981',
                                        borderWidth: 2,
                                        borderColor: c.background
                                    }} />
                                )}
                            </View>

                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Text style={{ fontSize: 14, color: c.text, fontWeight: '500' }}>
                                        <Text style={{ fontWeight: '700' }}>{item.userId?.firstName} {item.userId?.lastName}</Text>
                                        {' '}{item.details}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <MaterialIcons name="access-time" size={12} color={c.subtext} style={{ marginRight: 4 }} />
                                    <Text style={{ fontSize: 11, color: c.subtext }}>
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={{ padding: 60, alignItems: 'center' }}>
                        <MaterialIcons name="bubble-chart" size={48} color={c.border} />
                        <Text style={{ color: c.subtext, marginTop: 16, textAlign: 'center' }}>No recent activity. Everything's quiet!</Text>
                    </View>
                }
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={[styles.header, { borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: c.text }]}>{projectData?.project?.title || "Collabo"}</Text>
                    {projectData?.project?.teamName && (
                        <Text style={{ fontSize: 12, color: c.subtext }}>{projectData.project.teamName}</Text>
                    )}
                </View>
                <View style={{ width: 24 }} />
            </View>

            <View style={[styles.tabBar, { borderBottomColor: c.border, backgroundColor: c.card }]}>
                {[
                    { id: 'dashboard', label: 'Home', icon: 'home-outline', activeIcon: 'home', type: 'Ionicons' },
                    { id: 'activities', label: 'Pulse', icon: 'flash-outline', activeIcon: 'flash', type: 'Ionicons' },
                    { id: 'chat', label: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', type: 'Ionicons' },
                    { id: 'tasks', label: 'Tasks', icon: 'checkbox-outline', activeIcon: 'checkbox', type: 'Ionicons' },
                    { id: 'files', label: 'Files', icon: 'folder-open-outline', activeIcon: 'folder-open', type: 'Ionicons' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabItem,
                            { borderBottomWidth: 2, borderBottomColor: activeTab === tab.id ? c.primary : 'transparent' }
                        ]}
                        onPress={() => setActiveTab(tab.id as any)}
                    >
                        <View style={{ position: 'relative' }}>
                            <Ionicons
                                name={(activeTab === tab.id ? tab.activeIcon : tab.icon) as any}
                                size={20}
                                color={activeTab === tab.id ? c.primary : c.subtext}
                            />
                            {tab.id === 'chat' && unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -10,
                                    backgroundColor: '#EF4444',
                                    minWidth: 16,
                                    height: 16,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 2,
                                    borderColor: c.card,
                                    paddingHorizontal: 2
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '800' }}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[
                            styles.tabText,
                            {
                                color: activeTab === tab.id ? c.primary : c.subtext,
                                fontSize: 10,
                                marginTop: 2,
                                fontWeight: activeTab === tab.id ? '700' : '500'
                            }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flex: 1 }}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'activities' && renderActivities()}
                {activeTab === 'chat' && renderChat()}
                {activeTab === 'tasks' && renderTasks()}
                {activeTab === 'files' && renderFiles()}
            </View>

            <Modal
                visible={isRoleModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsRoleModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <View style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>
                                {isEditingRole ? 'Edit Role' : 'Add New Role'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsRoleModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <Text style={{ color: c.text, marginBottom: 8 }}>Role Title</Text>
                            <TextInput
                                style={{
                                    backgroundColor: c.background,
                                    borderWidth: 1,
                                    borderColor: c.border,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: c.text,
                                    marginBottom: 16
                                }}
                                value={roleForm.title}
                                onChangeText={(text) => setRoleForm({ ...roleForm, title: text })}
                                placeholder="e.g. Backend Developer"
                                placeholderTextColor={c.subtext}
                            />

                            <Text style={{ color: c.text, marginBottom: 8 }}>Budget</Text>
                            <TextInput
                                style={{
                                    backgroundColor: c.background,
                                    borderWidth: 1,
                                    borderColor: c.border,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: c.text,
                                    marginBottom: 16
                                }}
                                value={roleForm.budget.toString()}
                                onChangeText={(text) => setRoleForm({ ...roleForm, budget: text })}
                                placeholder="e.g. 500"
                                keyboardType="numeric"
                                placeholderTextColor={c.subtext}
                            />

                            <Text style={{ color: c.text, marginBottom: 8 }}>Description</Text>
                            <TextInput
                                style={{
                                    backgroundColor: c.background,
                                    borderWidth: 1,
                                    borderColor: c.border,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: c.text,
                                    marginBottom: 16,
                                    minHeight: 100
                                }}
                                value={roleForm.description}
                                onChangeText={(text) => setRoleForm({ ...roleForm, description: text })}
                                placeholder="Describe the role responsibilities..."
                                placeholderTextColor={c.subtext}
                                multiline
                                textAlignVertical="top"
                            />

                            <Text style={{ color: c.text, marginBottom: 8 }}>Skills (comma separated)</Text>
                            <TextInput
                                style={{
                                    backgroundColor: c.background,
                                    borderWidth: 1,
                                    borderColor: c.border,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: c.text,
                                    marginBottom: 24
                                }}
                                value={roleForm.skills}
                                onChangeText={(text) => setRoleForm({ ...roleForm, skills: text })}
                                placeholder="e.g. Node.js, React, TypeScript"
                                placeholderTextColor={c.subtext}
                            />

                            <TouchableOpacity
                                style={{
                                    backgroundColor: c.primary,
                                    paddingVertical: 16,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    marginBottom: 20
                                }}
                                onPress={handleSaveRole}
                            >
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
                                    {isEditingRole ? 'Update Role' : 'Add Role'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Funding Selection Modal */}
            <Modal
                visible={isFundingModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsFundingModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: c.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                        <View style={{ width: 40, height: 4, backgroundColor: c.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

                        <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 8, textAlign: 'center' }}>Fund & Activate</Text>
                        <Text style={{ fontSize: 14, color: c.subtext, marginBottom: 24, textAlign: 'center' }}>Choose your preferred payment method to activate this project.</Text>

                        <View style={{ backgroundColor: c.background, padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={{ color: c.subtext, fontSize: 13 }}>Project Budget</Text>
                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>₦{projectData?.project?.totalBudget?.toLocaleString()}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ color: c.subtext, fontSize: 13 }}>Platform Fee</Text>
                                <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>Free for Collabo</Text>
                            </View>
                        </View>

                        {/* Pay with Wallet */}
                        <TouchableOpacity
                            onPress={handlePayWithWallet}
                            disabled={fundingLoading}
                            style={{
                                backgroundColor: c.primary + '10',
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: c.primary,
                                marginBottom: 12,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                <Ionicons name="wallet-outline" size={24} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>Pay from Wallet</Text>
                                <Text style={{ color: c.subtext, fontSize: 12 }}>
                                    Balance: ₦{walletBalance?.toLocaleString() || '0'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={c.primary} />
                        </TouchableOpacity>

                        {/* Pay with Flutterwave */}
                        <TouchableOpacity
                            onPress={handlePayWithFlutterwave}
                            disabled={fundingLoading}
                            style={{
                                backgroundColor: c.card,
                                padding: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: c.border,
                                marginBottom: 20,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: '#DDD' }}>
                                <Ionicons name="card-outline" size={24} color="#334155" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>Flutterwave Checkout</Text>
                                <Text style={{ color: c.subtext, fontSize: 12 }}>Cards, Bank Transfer, USSD</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={c.subtext} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsFundingModalVisible(false)}
                            style={{ padding: 16, alignItems: 'center' }}
                        >
                            <Text style={{ color: c.subtext, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>

                        {fundingLoading && (
                            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 30, alignItems: 'center', justifyContent: 'center' }]}>
                                <ActivityIndicator size="large" color={c.primary} />
                                <Text style={{ marginTop: 12, color: c.primary, fontWeight: '700' }}>Processing...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    tabText: { fontSize: 12, fontWeight: '700' },
    statRow: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    statLabel: { fontSize: 12, marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: '700' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    memberName: { fontSize: 14, fontWeight: '700' },
    memberRole: { fontSize: 12 },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    }
});
