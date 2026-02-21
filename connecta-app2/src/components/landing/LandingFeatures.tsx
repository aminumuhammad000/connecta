import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const features = [
    {
        id: 0,
        title: "AI Job Matching",
        desc: "Smart algorithms connect you with perfect opportunities",
        icon: "cpu",
        gradient: ['#FF6B6B', '#FD6730'] as const,
    },
    {
        id: 1,
        title: "Team Collaboration",
        desc: "Work together seamlessly with built-in workspace tools",
        icon: "users",
        gradient: ['#4ECDC4', '#44A08D'] as const,
    },
    {
        id: 2,
        title: "Secure Payments",
        desc: "Protected escrow ensures you get paid on time, every time",
        icon: "shield",
        gradient: ['#667EEA', '#764BA2'] as const,
    },
    {
        id: 3,
        title: "Global Network",
        desc: "Connect with talent and clients from around the world",
        icon: "globe",
        gradient: ['#F093FB', '#F5576C'] as const,
    },
];

const LandingFeatures = ({ isDesktop }: { isDesktop?: boolean }) => {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Why Choose <Text style={{ color: '#FD6730' }}>Connecta</Text>
                </Text>
                <Text style={styles.subtitle}>
                    Everything you need to succeed as a freelancer or hire top talent
                </Text>
            </View>

            <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
                {features.map((item) => (
                    <View
                        key={item.id}
                        style={[
                            styles.card,
                            isDesktop && styles.desktopCard
                        ]}
                    >
                        <LinearGradient
                            colors={item.gradient}
                            style={styles.iconBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Feather name={item.icon as any} size={28} color="#FFF" />
                        </LinearGradient>

                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        backgroundColor: '#FAFBFC',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
    },
    grid: {
        gap: 16,
    },
    desktopGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    desktopCard: {
        width: '48%',
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A202C',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    cardDesc: {
        fontSize: 14,
        color: '#718096',
        lineHeight: 20,
    },
});

export default LandingFeatures;
