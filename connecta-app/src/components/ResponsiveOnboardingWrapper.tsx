import React from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView, Platform, ViewProps } from 'react-native';
import { useThemeColors } from '../theme/theme';

interface ResponsiveOnboardingWrapperProps extends ViewProps {
    children: React.ReactNode;
    maxWidth?: number;
    sideComponent?: React.ReactNode; // For a split-screen desktop view
}

const ResponsiveOnboardingWrapper: React.FC<ResponsiveOnboardingWrapperProps> = ({
    children,
    maxWidth = 480,
    sideComponent,
    style,
    ...props
}) => {
    const { width, height } = useWindowDimensions();
    const c = useThemeColors();
    const isDesktop = width > 768;

    if (isDesktop) {
        return (
            <View style={[styles.desktopContainer, { backgroundColor: c.background }]}>
                {sideComponent && (
                    <View style={[styles.sidePanel, { backgroundColor: c.primary + '05' }]}>
                        {sideComponent}
                    </View>
                )}
                <View style={[styles.formPanel, { flex: 1.2, alignItems: 'center', justifyContent: 'center' }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.desktopContent}
                        style={{ width: '100%' }}
                    >
                        <View style={[
                            styles.desktopCard,
                            {
                                backgroundColor: c.card,
                                borderRadius: 32,
                                padding: 40,
                                width: '100%',
                                maxWidth: maxWidth,
                                alignSelf: 'center'
                            },
                            style
                        ]}>
                            {children}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }

    return (
        <View style={[{ flex: 1, height: '100%', minHeight: Platform.OS === 'web' ? '100vh' : '100%', backgroundColor: c.background } as any, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    sidePanel: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.05)',
        padding: 40,
    },
    container: { flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%' } as any,
    mainWrapper: {
        flex: 1,
        height: '100%',
    },
    formPanel: {
        flex: 1,
        height: '100%',
    },
    desktopContent: {
        flexGrow: 1,
        paddingVertical: 60,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    desktopCard: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 5,
        marginHorizontal: 20,
        overflow: 'visible', // Ensure shadows and content aren't clipped
    }
});

export default ResponsiveOnboardingWrapper;
