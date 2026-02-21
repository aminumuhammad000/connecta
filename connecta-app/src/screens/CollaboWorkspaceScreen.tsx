import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, Platform, Modal, Alert, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { getCollaboProject, getMessages, sendMessage, getTasks, createTask, updateTask, deleteTask, getFiles, uploadFile, fundCollaboProject, activateCollaboProject, startWork, removeFromRole, inviteToRole, addRole, markWorkspaceRead } from '../services/collaboService';
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

    const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'tasks' | 'files'>('dashboard');
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

    // Role State
    const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
    const [newRoleData, setNewRoleData] = useState({ title: '', description: '', budget: '', skills: '' });

    useEffect(() => {
        loadData();
    }, [projectId]);

    useEffect(() => {
        if (route.params?.selectedFreelancer && route.params?.targetRoleId) {
            const { selectedFreelancer, targetRoleId } = route.params;

            const handleInvite = async () => {
                try {
                    await inviteToRole(targetRoleId, selectedFreelancer._id);
                    showAlert({ title: 'Success', message: 'Invitation sent!', type: 'success' });
                    loadData(); // Refresh list to show pending state? Ideally inviteToRole updates status
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
            setIsAddRoleModalVisible(true);
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
        const clientId = projectData.project.clientId?._id || projectData.project.clientId;
        console.log('💰 handleFundProject clientId:', clientId, 'user:', JSON.stringify(user?._id || user?.id));
        navigation.navigate('Payment', {
            projectId: projectId,
            amount: projectData.project.totalBudget,
            projectTitle: projectData.project.title,
            freelancerId: clientId, // Self-payment for project escrow
            freelancerName: 'Project Escrow',
            paymentType: 'project_payment'
        });
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

    const renderDashboard = () => {
        const isClient = projectData?.project?.clientId?._id === user?._id;
        const isPlanning = projectData?.project?.status === 'planning';

        return (
            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={[styles.statCard, { borderColor: c.border, backgroundColor: c.card, marginBottom: 16 }]}>
                    <Text style={[styles.statLabel, { color: c.subtext }]}>Total Budget</Text>
                    <Text style={[styles.statValue, { color: c.text }]}>${projectData?.project?.totalBudget?.toLocaleString()}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <View style={[styles.statusBadge, { backgroundColor: isPlanning ? '#F59E0B' : '#10B981' }]}>
                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>{projectData?.project?.status?.toUpperCase()}</Text>
                        </View>
                    </View>

                    {isClient && isPlanning && (
                        <TouchableOpacity
                            onPress={handleFundProject}
                            style={{
                                marginTop: 16,
                                backgroundColor: c.primary,
                                padding: 12,
                                borderRadius: 8,
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '700' }}>Fund & Activate Project</Text>
                        </TouchableOpacity>
                    )}

                    {isClient && (projectData?.project?.status === 'active' || projectData?.project?.status === 'in_progress') && (
                        (() => {
                            const anyRoleFilled = projectData?.roles?.some((r: any) => r.status === 'filled' && r.freelancerId);
                            const isInProgress = projectData?.project?.status === 'in_progress';

                            if (anyRoleFilled && !isInProgress) {
                                return (
                                    <TouchableOpacity
                                        onPress={handleStartWork}
                                        style={{
                                            marginTop: 16,
                                            backgroundColor: '#10B981',
                                            padding: 12,
                                            borderRadius: 8,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: '700' }}>🚀 Start Work</Text>
                                    </TouchableOpacity>
                                );
                            }
                            return null;
                        })()
                    )}
                </View>

                {/* Team Members */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Team Members</Text>
                    {user?.userType === 'client' && (
                        <TouchableOpacity onPress={() => setIsAddRoleModalVisible(true)}>
                            <Text style={{ color: c.primary, fontWeight: '600' }}>+ Add Role</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {projectData?.roles?.map((role: any, index: number) => {
                    const isFilled = role.status === 'filled' && role.freelancerId;
                    const freelancer = role.freelancerId;

                    const isClient = user?.userType === 'client';
                    return (
                        <View key={index} style={{
                            backgroundColor: c.card,
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: c.border
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{role.title}</Text>
                                <View style={{
                                    backgroundColor: isFilled ? '#10B981' : '#F59E0B',
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 6
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>
                                        {isFilled ? 'Active' : 'Pending'}
                                    </Text>
                                </View>
                            </View>

                            {isFilled ? (
                                <View>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}
                                        onPress={() => navigation.navigate('PublicFreelancerProfile', { id: freelancer._id })}
                                    >
                                        <View style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            backgroundColor: c.primary + '20',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10
                                        }}>
                                            <Text style={{ color: c.primary, fontWeight: '700', fontSize: 14 }}>
                                                {freelancer?.firstName?.[0]}{freelancer?.lastName?.[0]}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }}>
                                                {freelancer?.firstName} {freelancer?.lastName}
                                            </Text>
                                            <Text style={{ color: c.subtext, fontSize: 12 }}>
                                                View Profile • ${role.budget}
                                            </Text>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={20} color={c.subtext} />
                                    </TouchableOpacity>

                                    {isClient && (
                                        <TouchableOpacity
                                            onPress={async () => {
                                                try {
                                                    await removeFromRole(role._id);
                                                    showAlert({ title: 'Success', message: 'Team member removed', type: 'success' });
                                                    loadData();
                                                } catch (error: any) {
                                                    showAlert({ title: 'Error', message: error.message || 'Failed to remove', type: 'error' });
                                                }
                                            }}
                                            style={{
                                                marginTop: 12,
                                                backgroundColor: '#EF4444',
                                                paddingVertical: 6,
                                                paddingHorizontal: 12,
                                                borderRadius: 16,
                                                alignSelf: 'flex-start'
                                            }}
                                        >
                                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 11 }}>Remove Member</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                <View>
                                    <Text style={{ color: c.subtext, fontSize: 13, marginTop: 4 }}>
                                        Waiting for freelancer to accept • ${role.budget}
                                    </Text>

                                    {isClient && (
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
                                                marginTop: 12,
                                                backgroundColor: projectData?.project?.status === 'planning' ? c.subtext : c.primary,
                                                padding: 10,
                                                borderRadius: 8,
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 13 }}>
                                                {projectData?.project?.status === 'planning' ? 'Fund to Invite' : 'Invite Freelancer'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView >
        );
    };

    const renderChat = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={{ flex: 1 }}
        >
            <FlatList
                data={messages}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isMe = item.senderId._id === user?._id;
                    return (
                        <View style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            marginBottom: 16,
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            gap: 8
                        }}>
                            {!isMe && (
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.primary }}>{item.senderId.firstName?.[0]}</Text>
                                </View>
                            )}
                            <View style={{ flexShrink: 1 }}>
                                {!isMe && <Text style={{ fontSize: 11, color: c.subtext, marginBottom: 4, marginLeft: 4 }}>{item.senderId.firstName} • {item.senderRole}</Text>}
                                <View style={{
                                    backgroundColor: isMe ? c.primary : c.card,
                                    padding: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 20,
                                    borderBottomRightRadius: isMe ? 4 : 20,
                                    borderBottomLeftRadius: isMe ? 20 : 4,
                                    borderWidth: isMe ? 0 : 1,
                                    borderColor: c.border,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1
                                }}>
                                    <Text style={{ color: isMe ? '#FFF' : c.text, fontSize: 15, lineHeight: 20 }}>{item.content}</Text>
                                </View>
                                <Text style={{ fontSize: 10, color: c.subtext, marginTop: 4, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />
            <View style={{ padding: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: c.border, flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, paddingBottom: Platform.OS === 'ios' ? 20 : 12 }}>
                <TextInput
                    style={{
                        flex: 1,
                        backgroundColor: c.background,
                        padding: 12,
                        paddingHorizontal: 16,
                        borderRadius: 24,
                        color: c.text,
                        borderWidth: 1,
                        borderColor: c.border,
                        fontSize: 15
                    }}
                    placeholder="Type a message..."
                    placeholderTextColor={c.subtext}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                    style={{
                        marginLeft: 12,
                        backgroundColor: inputText.trim() ? c.primary : c.subtext + '40',
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <MaterialIcons name="send" size={22} color="#FFF" />
                </TouchableOpacity>
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
                                                    const nextWrapper: any = { todo: 'in_progress', in_progress: 'review', review: 'done', done: 'todo' };
                                                    handleUpdateTaskStatus(task._id, nextWrapper[task.status]);
                                                }}
                                                style={{ backgroundColor: c.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                                            >
                                                <Text style={{ fontSize: 11, color: c.text, fontWeight: '600' }}>Move Next</Text>
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
                    { id: 'dashboard', label: 'Dashboard', icon: 'grid-view' },
                    { id: 'chat', label: 'Chat', icon: 'chat-bubble-outline' },
                    { id: 'tasks', label: 'Tasks', icon: 'assignment' },
                    { id: 'files', label: 'Files', icon: 'folder-open' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tabItem,
                            { borderBottomColor: activeTab === tab.id ? c.primary : 'transparent' }
                        ]}
                        onPress={() => setActiveTab(tab.id as any)}
                    >
                        <View style={{ position: 'relative' }}>
                            <MaterialIcons
                                name={tab.icon as any}
                                size={22}
                                color={activeTab === tab.id ? c.primary : c.subtext}
                            />
                            {tab.id === 'chat' && unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: -6,
                                    right: -10,
                                    backgroundColor: '#EF4444',
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 2,
                                    borderColor: c.card,
                                    paddingHorizontal: 4
                                }}>
                                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[
                            styles.tabText,
                            {
                                color: activeTab === tab.id ? c.primary : c.subtext,
                                fontSize: 10,
                                marginTop: 4,
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
                {activeTab === 'chat' && renderChat()}
                {activeTab === 'tasks' && renderTasks()}
                {activeTab === 'files' && renderFiles()}
            </View>

            <Modal
                visible={isAddRoleModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsAddRoleModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <View style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Add New Role</Text>
                            <TouchableOpacity onPress={() => setIsAddRoleModalVisible(false)}>
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
                                value={newRoleData.title}
                                onChangeText={(text) => setNewRoleData({ ...newRoleData, title: text })}
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
                                value={newRoleData.budget}
                                onChangeText={(text) => setNewRoleData({ ...newRoleData, budget: text })}
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
                                value={newRoleData.description}
                                onChangeText={(text) => setNewRoleData({ ...newRoleData, description: text })}
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
                                value={newRoleData.skills}
                                onChangeText={(text) => setNewRoleData({ ...newRoleData, skills: text })}
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
                                onPress={async () => {
                                    try {
                                        if (!newRoleData.title || !newRoleData.budget) {
                                            showAlert({ title: 'Validation Error', message: 'Please fill in title and budget', type: 'error' });
                                            return;
                                        }

                                        const skillsList = newRoleData.skills.split(',').map(s => s.trim()).filter(Boolean);

                                        const newRole = await addRole(projectId, {
                                            title: newRoleData.title,
                                            description: newRoleData.description,
                                            budget: Number(newRoleData.budget),
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
                                        setIsAddRoleModalVisible(false);
                                        setNewRoleData({ title: '', description: '', budget: '', skills: '' });
                                        loadData();
                                    } catch (error: any) {
                                        showAlert({ title: 'Error', message: error.message || 'Failed to add role', type: 'error' });
                                    }
                                }}
                            >
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>Add Role</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
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
        borderBottomColor: '#EEE',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 2,
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
