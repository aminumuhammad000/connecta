import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import DesktopTopNav from '../navigation/DesktopTopNav';
import DesktopLeftSidebar from '../navigation/DesktopLeftSidebar';
import DesktopRightSidebar from '../navigation/DesktopRightSidebar';
import { useNavigation } from '@react-navigation/native';

interface DesktopLayoutProps {
    children: React.ReactNode;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <DesktopTopNav />
            {/* Main Content Area - with top padding for fixed header */}
            <View style={styles.contentWrapper}>
                {/* Left Column - Profile Card */}
                <View style={styles.leftColumn}>
                    <DesktopLeftSidebar navigation={navigation} />
                </View>

                {/* Center Column - Feed/Content */}
                <View style={styles.centerColumn}>
                    {children}
                </View>

                {/* Right Column - Suggestions */}
                <View style={styles.rightColumn}>
                    <DesktopRightSidebar />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Lighter gray for modern look
        height: '100%',
    },
    contentWrapper: {
        flex: 1,
        flexDirection: 'row',
        maxWidth: 1200, // Reduced slightly for tighter look
        width: '100%',
        alignSelf: 'center',
        paddingTop: 80, // 64px header + spacing
        gap: 24,
        paddingHorizontal: 24,
    },
    leftColumn: {
        width: 250, // Fixed width
        // Sticky behavior if needed, or just static
    },
    centerColumn: {
        flex: 1,
        height: '100%',
        minWidth: 500,
        // The children (Stack Navigator) will handle their own scrolling usually
    },
    rightColumn: {
        width: 300, // Fixed width
        display: 'flex',
    }
});

export default DesktopLayout;
