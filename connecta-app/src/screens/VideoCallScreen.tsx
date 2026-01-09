import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';

export default function VideoCallScreen({ route, navigation }: any) {
    const { roomName, userName } = route.params;
    const c = useThemeColors();
    const [isLoading, setIsLoading] = useState(true);

    // Default Jitsi Meet URL
    // You can host your own Jitsi instance or use the public one
    const uri = `https://meet.jit.si/${roomName}#userInfo.displayName="${userName}"&config.startWithVideoMuted=true&config.startWithAudioMuted=true`;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Connecta Video</Text>
            </View>

            <View style={styles.webviewContainer}>
                <WebView
                    source={{ uri }}
                    style={{ flex: 1 }}
                    startInLoadingState
                    renderLoading={() => (
                        <View style={[styles.loading, { backgroundColor: 'black' }]}>
                            <ActivityIndicator size="large" color={c.primary} />
                            <Text style={{ color: 'white', marginTop: 10 }}>Connecting to secure room...</Text>
                        </View>
                    )}
                    onLoadEnd={() => setIsLoading(false)}
                    // Jitsi specific handling for permissions could go here if using native module
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    userAgent="Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#1a1a1a',
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    webviewContainer: {
        flex: 1,
    },
    loading: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
