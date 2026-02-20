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
                <View style={[styles.formPanel, { flex: sideComponent ? 1 : 1, alignItems: 'center', justifyContent: 'center' }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.desktopContent,
                            { width: '100%', maxWidth: maxWidth }
                        ]}
                    >
                        <View style={[styles.desktopCard, { backgroundColor: c.card, borderRadius: 32, padding: 40 }, style]}>
                            {children}
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }

    return (
        <View style={[{ flex: 1, backgroundColor: c.background }, style]} {...props}>
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
    },
    formPanel: {
        flex: 1,
        height: '100%',
    },
    desktopContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    desktopCard: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 5,
        marginHorizontal: 20,
    }
});

export default ResponsiveOnboardingWrapper;
