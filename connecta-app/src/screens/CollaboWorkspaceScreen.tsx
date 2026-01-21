import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, TextInput, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { getCollaboProject, getMessages, sendMessage, getTasks, createTask, updateTask, getFiles, uploadFile, fundCollaboProject, activateCollaboProject, startWork } from '../services/collaboService';
import { useInAppAlert } from '../components/InAppAlert';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../utils/constants';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

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

    // Task State
    const [tasks, setTasks] = useState<any[]>([]);
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activeTaskTab, setActiveTaskTab] = useState('todo'); // For mobile tabs view instead of horizontal scroll if preferred, but let's try columns first. 
    // File State
    const [files, setFiles] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, [projectId]);

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
            socket.off('collabo:file_upload');
        };
    }, [socket, projectData]);

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

    const handleFundProject = async () => {
        try {
            await fundCollaboProject(projectId);
            showAlert({ title: 'Project funded and activated!', type: 'success' });
            loadData();
        } catch (error) {
            showAlert({ title: 'Failed to fund project', type: 'error' });
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
                <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 }}>Team Members</Text>
                {projectData?.roles?.map((role: any, index: number) => {
                    const isFilled = role.status === 'filled' && role.freelancerId;
                    const freelancer = role.freelancerId;

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
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
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
                                                ${role.budget}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <Text style={{ color: c.subtext, fontSize: 13, marginTop: 4 }}>
                                    Waiting for freelancer to accept • ${role.budget}
                                </Text>
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
            style={{ flex: 1 }}
        >
            <FlatList
                data={messages}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const isMe = item.senderId._id === user?._id;
                    return (
                        <View style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            marginBottom: 12
                        }}>
                            {!isMe && <Text style={{ fontSize: 10, color: c.subtext, marginBottom: 2 }}>{item.senderId.firstName}</Text>}
                            <View style={{
                                backgroundColor: isMe ? c.primary : c.card,
                                padding: 12,
                                borderRadius: 12,
                                borderWidth: isMe ? 0 : 1,
                                borderColor: c.border
                            }}>
                                <Text style={{ color: isMe ? '#FFF' : c.text }}>{item.content}</Text>
                            </View>
                            <Text style={{ fontSize: 10, color: c.subtext, marginTop: 2, alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                }}
            />
            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: c.border, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    style={{
                        flex: 1,
                        backgroundColor: c.card,
                        padding: 12,
                        borderRadius: 24,
                        color: c.text,
                        borderWidth: 1,
                        borderColor: c.border
                    }}
                    placeholder="Type a message..."
                    placeholderTextColor={c.subtext}
                    value={inputText}
                    onChangeText={setInputText}
                />
                <TouchableOpacity onPress={handleSend} style={{ marginLeft: 12, backgroundColor: c.primary, padding: 12, borderRadius: 24 }}>
                    <MaterialIcons name="send" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

    // ... rest of the file

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const newTask = await createTask({
                workspaceId: projectData.workspace._id,
                title: newTaskTitle,
                status: 'todo',
                priority: 'medium'
            });
            setTasks(prev => [newTask, ...prev]);
            setNewTaskTitle('');
            setIsTaskModalVisible(false);
        } catch (error) {
            console.error(error);
        }
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
            { id: 'todo', title: 'To Do', color: '#64748B' },
            { id: 'in_progress', title: 'In Progress', color: '#3B82F6' },
            { id: 'review', title: 'Review', color: '#F59E0B' },
            { id: 'done', title: 'Done', color: '#10B981' }
        ];

        return (
            <View style={{ flex: 1 }}>
                <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                        onPress={() => setIsTaskModalVisible(true)}
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                    >
                        <MaterialIcons name="add" size={20} color="#FFF" />
                        <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 4 }}>Add Task</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal pagingEnabled style={{ flex: 1 }}>
                    {columns.map(col => (
                        <View key={col.id} style={{ width: 340, padding: 8, height: '100%' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 8 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col.color, marginRight: 8 }} />
                                <Text style={{ color: c.text, fontWeight: '700', fontSize: 16 }}>{col.title}</Text>
                                <View style={{ backgroundColor: c.border, borderRadius: 10, paddingHorizontal: 8, marginLeft: 8 }}>
                                    <Text style={{ fontSize: 12, color: c.subtext }}>
                                        {tasks.filter(t => t.status === col.id).length}
                                    </Text>
                                </View>
                            </View>

                            <ScrollView style={{ flex: 1, backgroundColor: c.background === '#000' ? '#111' : '#F8FAFC', borderRadius: 12 }}>
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <TouchableOpacity
                                        key={task._id}
                                        onPress={() => {
                                            // Simple rotation for demo: todo -> in_progress -> review -> done
                                            const nextWrapper: any = { todo: 'in_progress', in_progress: 'review', review: 'done', done: 'todo' };
                                            handleUpdateTaskStatus(task._id, nextWrapper[task.status]);
                                        }}
                                        style={{ backgroundColor: c.card, padding: 12, margin: 8, borderRadius: 8, borderWidth: 1, borderColor: c.border }}
                                    >
                                        <Text style={{ color: c.text, fontWeight: '600', marginBottom: 4 }}>{task.title}</Text>
                                        {task.assigneeId && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'purple', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
                                                    <Text style={{ color: '#FFF', fontSize: 10 }}>{task.assigneeId.firstName?.[0]}</Text>
                                                </View>
                                                <Text style={{ fontSize: 12, color: c.subtext }}>{task.assigneeId.firstName}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                                {tasks.filter(t => t.status === col.id).length === 0 && (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Text style={{ color: c.subtext, fontSize: 12 }}>No tasks</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    ))}
                </ScrollView>

                <Modal
                    visible={isTaskModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setIsTaskModalVisible(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                        <View style={{ backgroundColor: c.card, borderRadius: 16, padding: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 16 }}>New Task</Text>
                            <TextInput
                                style={{ backgroundColor: c.background, padding: 12, borderRadius: 8, color: c.text, borderWidth: 1, borderColor: c.border, marginBottom: 16 }}
                                placeholder="Task Title"
                                placeholderTextColor={c.subtext}
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                                <TouchableOpacity onPress={() => setIsTaskModalVisible(false)} style={{ padding: 10 }}>
                                    <Text style={{ color: c.subtext }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCreateTask} style={{ backgroundColor: c.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}>
                                    <Text style={{ color: '#FFF', fontWeight: '600' }}>Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
                            marginRight: 12
                        }}>
                            <MaterialIcons
                                name={item.type.includes('image') ? 'image' : 'description'}
                                size={24}
                                color={c.subtext}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600', color: c.text }}>{item.name}</Text>
                            <Text style={{ fontSize: 12, color: c.subtext }}>
                                {(item.size / 1024).toFixed(1)} KB • Uploaded by {item.uploaderId.firstName}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => console.log("Download", item.url)}>
                            <MaterialIcons name="download" size={20} color={c.primary} />
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
                <Text style={[styles.headerTitle, { color: c.text }]}>{projectData?.project?.title || "Collabo"}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabBar}>
                {['dashboard', 'chat', 'tasks', 'files'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabItem,
                            { borderBottomColor: activeTab === tab ? c.primary : 'transparent' }
                        ]}
                        onPress={() => setActiveTab(tab as any)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab ? c.primary : c.subtext }
                        ]}>
                            {tab.toUpperCase()}
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
