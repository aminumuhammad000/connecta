import React, { useRef } from 'react';
import { View, Text, Share, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useThemeColors } from '../theme/theme';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';

interface ShareFlyerProps {
    postTitle?: string;
    postBody: string;
    postType: string;
    actorName: string;
    buttonStyle?: any;
    textStyle?: any;
    label?: string;
    iconSize?: number;
}

export default function ShareFlyer({ postTitle, postBody, postType, actorName, buttonStyle, textStyle, label = 'Share', iconSize = 20 }: ShareFlyerProps) {
    const c = useThemeColors();
    const viewShotRef = useRef<ViewShot>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);

    const generateShareableFlyer = async () => {
        try {
            setIsGenerating(true);
            
            if (!viewShotRef.current) {
                Alert.alert('Error', 'Could not generate flyer');
                return;
            }

            // Capture the view as an image
            const uri = await viewShotRef.current.capture?.();
            
            if (!uri) {
                Alert.alert('Error', 'Could not capture flyer image');
                return;
            }

            // Share the image directly using the URI
            const result = await Share.share({
                url: uri,
                message: `Check out this Connecta post from ${actorName}!\n\n"${postBody.substring(0, 100)}..."\n\nJoin Connecta: myconnecta.ng`,
                title: 'Share Connecta Post',
            });

            if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error generating shareable flyer:', error);
            Alert.alert('Error', 'Could not generate shareable flyer. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <>
            {/* Hidden ViewShot Component for Generating Image */}
            <ViewShot 
                ref={viewShotRef}
                options={{ 
                    format: 'png', 
                    quality: 0.95,
                    width: 1080,
                    height: 1350
                }}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            >
                <View style={{
                    width: 1080,
                    height: 1350,
                    backgroundColor: c.card,
                    padding: 40,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    {/* Top Branding */}
                    <View style={{ alignItems: 'center', marginBottom: 30 }}>
                        <Text style={{
                            fontSize: 48,
                            fontWeight: '800',
                            color: '#FD6730',
                            marginBottom: 8,
                        }}>
                            Connecta
                        </Text>
                        <Text style={{
                            fontSize: 20,
                            color: c.subtext,
                            fontWeight: '500',
                        }}>
                            Professional Network
                        </Text>
                    </View>

                    {/* Main Content Box */}
                    <View style={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: 24,
                        padding: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        marginBottom: 40,
                    }}>
                        {postTitle && (
                            <Text style={{
                                fontSize: 36,
                                fontWeight: '800',
                                color: '#1F2937',
                                marginBottom: 24,
                                textAlign: 'center',
                            }}>
                                {truncateText(postTitle, 50)}
                            </Text>
                        )}

                        <Text style={{
                            fontSize: 28,
                            color: '#374151',
                            lineHeight: 40,
                            textAlign: 'center',
                            fontWeight: '600',
                        }}>
                            {truncateText(postBody, 150)}
                        </Text>
                    </View>

                    {/* Actor Info */}
                    <View style={{
                        alignItems: 'center',
                        marginBottom: 20,
                        borderTopWidth: 2,
                        borderTopColor: '#E5E7EB',
                        paddingTop: 20,
                        width: '100%',
                    }}>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: c.text,
                            marginBottom: 8,
                        }}>
                            By {actorName}
                        </Text>
                        <Text style={{
                            fontSize: 16,
                            color: c.subtext,
                            fontWeight: '500',
                        }}>
                            on Connecta
                        </Text>
                    </View>

                    {/* Bottom CTA */}
                    <View style={{
                        alignItems: 'center',
                        backgroundColor: '#FD6730',
                        paddingHorizontal: 40,
                        paddingVertical: 20,
                        borderRadius: 16,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '800',
                            color: '#FFFFFF',
                        }}>
                            myconnecta.ng
                        </Text>
                    </View>
                </View>
            </ViewShot>

            {/* Share Button */}
            <TouchableOpacity 
                onPress={generateShareableFlyer}
                disabled={isGenerating}
                style={[
                    {
                        opacity: isGenerating ? 0.6 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        marginHorizontal: 4,
                    },
                    buttonStyle,
                ]}
            >
                {isGenerating ? (
                    <ActivityIndicator size={20} color={c.subtext} />
                ) : (
                    <>
                        <Ionicons name="share-social-outline" size={iconSize} color={c.subtext} />
                        <Text style={[{
                            fontSize: 13,
                            fontWeight: '600',
                            marginLeft: 6,
                            color: c.subtext,
                        }, textStyle]}>{label}</Text>
                    </>
                )}
            </TouchableOpacity>
        </>
    );
}
