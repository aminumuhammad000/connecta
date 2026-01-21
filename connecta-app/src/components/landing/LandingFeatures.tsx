import React from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const features = [
    {
        id: 0,
        title: "AI Job Scouting",
        desc: "Connecta crawls the entire web to bring relevant gigs right to you.",
        icon: "cpu",
        iconLib: Feather,
        gradient: ['#FD6730', '#F94144'],
    },
    {
        id: 1,
        title: "Smart Matching",
        desc: "Our AI matches your skills with clients. No more spam applications.",
        icon: "zap",
        iconLib: Feather,
        gradient: ['#F6E05E', '#ED8936'],
    },
    {
        id: 2,
        title: "Connecta Collabo",
        desc: "Dedicated workspace for freelance teams. Chat and manage tasks.",
        icon: "users",
        iconLib: Feather,
        gradient: ['#4299E1', '#667EEA'],
    },
    {
        id: 3,
        title: "Secure Escrow",
        desc: "Get paid on time. Funds held securely until milestones are met.",
        icon: "shield",
        iconLib: Feather,
        gradient: ['#48BB78', '#38B2AC'],
    },
];

const LandingFeatures = () => {
    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <LinearGradient
                    colors={item.gradient}
                    style={styles.iconBox}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <item.iconLib name={item.icon} size={32} color="#FFF" />
                </LinearGradient>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>

                <View style={styles.footer}>
                    <Text style={styles.nextText}>NEXT UP</Text>
                    <Feather name="arrow-right" size={14} color="#CBD5E0" />
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Everything You Need to <Text style={{ color: '#FD6730' }}>Dominate</Text>
                </Text>
                <Text style={styles.subtitle}>
                    Connecta packs the freelance universe into one platform.
                </Text>
            </View>

            <FlatList
                data={features}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 48} // Card width + margin
                snapToAlignment="center"
                decelerationRate="fast"
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 50,
        backgroundColor: '#FFF',
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 12,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        maxWidth: 300,
        lineHeight: 24,
    },
    listContent: {
        paddingHorizontal: 24,
        gap: 16,
    },
    cardContainer: {
        width: width - 70, // Slightly smaller than screen width
        marginRight: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 32,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 5,
        minHeight: 320,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A202C',
        marginBottom: 12,
    },
    cardDesc: {
        fontSize: 16,
        color: '#718096',
        lineHeight: 24,
        marginBottom: 32,
    },
    footer: {
        marginTop: 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: '#F7FAFC',
        paddingTop: 20,
    },
    nextText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#CBD5E0',
        letterSpacing: 1,
    },
});

export default LandingFeatures;
