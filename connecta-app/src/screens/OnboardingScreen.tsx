import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated, StatusBar, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/theme';
import Logo from '../components/Logo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as storage from '../utils/storage';

const { width, height } = Dimensions.get('window');

interface OnboardingItem {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    stat?: string;
    statLabel?: string;
}

const ONBOARDING_DATA: OnboardingItem[] = [
    {
        id: '1',
        title: 'Find Perfect Freelancers',
        subtitle: 'Access a global network of top-tier talent ready to bring your ideas to life.',
        icon: 'person-search',
        stat: '15k+',
        statLabel: 'Verified Experts',
    },
    {
        id: '2',
        title: 'Secure Payments',
        subtitle: 'Your money is safe with our escrow system. Only pay when you are 100% satisfied.',
        icon: 'verified-user',
        stat: '100%',
        statLabel: 'Payment Protection',
    },
    {
        id: '3',
        title: 'Manage Projects Easily',
        subtitle: 'Track progress, share files, and communicate seamlessly in one unified workspace.',
        icon: 'dashboard',
        stat: '24/7',
        statLabel: 'Support & Tools',
    },
];

interface OnboardingScreenProps {
    navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
    const c = useThemeColors();
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = async () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        // Could save a flag here if we want to hide it next time
        // await storage.setItem('HAS_SEEN_ONBOARDING', 'true');
        navigation.replace('Welcome');
    };

    const SkipButton = () => (
        <TouchableOpacity
            style={styles.skipButton}
            onPress={completeOnboarding}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Text style={{ color: c.text, fontSize: 16, fontWeight: '600', opacity: 0.8 }}>Skip</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        // Animations
        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
        });

        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [100, 0, 100],
            extrapolate: 'clamp',
        });

        return (
            <View style={[styles.slide, { width }]}>
                <Animated.View style={[styles.visualContainer, { transform: [{ scale }, { translateY }], opacity }]}>
                    {/* Background Blob/Shape */}
                    <View style={[styles.blob, { backgroundColor: c.primary + '15' }]} />

                    <View style={[styles.iconContainer, { backgroundColor: c.card, shadowColor: c.primary }]}>
                        <MaterialIcons name={item.icon} size={80} color={c.primary} />
                    </View>

                    {/* Floating Stats Card */}
                    <View style={[styles.floatingCard, { backgroundColor: c.card, shadowColor: '#000' }]}>
                        <View style={[styles.statIconBadge, { backgroundColor: c.primary + '20' }]}>
                            <MaterialIcons name="insights" size={20} color={c.primary} />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: c.text }]}>{item.stat}</Text>
                            <Text style={[styles.statLabel, { color: c.subtext }]}>{item.statLabel}</Text>
                        </View>
                    </View>
                </Animated.View>

                <View style={styles.contentContainer}>
                    <Text style={[styles.title, { color: c.text }]}>
                        {item.title.split(' ').map((word, i) => (
                            <Text key={i} style={i === 1 ? { color: c.primary } : {}}>{word} </Text>
                        ))}
                    </Text>
                    <Text style={[styles.subtitle, { color: c.subtext }]}>{item.subtitle}</Text>
                </View>
            </View>
        );
    };

    const Paginator = () => {
        return (
            <View style={styles.paginator}>
                {ONBOARDING_DATA.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });
                    const dotColor = scrollX.interpolate({
                        inputRange,
                        outputRange: [c.border, c.primary, c.border],
                        extrapolate: 'clamp',
                    });
                    return (
                        <Animated.View key={i} style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]} />
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <StatusBar barStyle={c.isDark ? 'light-content' : 'dark-content'} />

            <View style={styles.header}>
                <View style={{ opacity: 0 }}>
                    <Logo size={32} />
                </View>
                <SkipButton />
            </View>

            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
            />

            <View style={styles.footer}>
                <Paginator />

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: c.primary, shadowColor: c.primary }]}
                    onPress={handleNext}
                    activeOpacity={0.9}
                >
                    <Text style={styles.btnText}>
                        {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
                    </Text>
                    <MaterialIcons
                        name={currentIndex === ONBOARDING_DATA.length - 1 ? "check" : "arrow-forward"}
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipButton: {
        padding: 8,
    },
    slide: {
        flex: 1,
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        width: width,
        height: width * 0.8,
    },
    blob: {
        position: 'absolute',
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: 999,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        zIndex: 2,
    },
    floatingCard: {
        position: 'absolute',
        bottom: 20,
        right: 40,
        padding: 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 3,
    },
    statIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    contentContainer: {
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    footer: {
        padding: 32,
        gap: 32,
    },
    paginator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    btn: {
        flexDirection: 'row',
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default OnboardingScreen;
