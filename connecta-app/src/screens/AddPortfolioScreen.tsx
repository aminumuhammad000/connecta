import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Image, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPortfolioImage } from '../services/uploadService';
import * as profileService from '../services/profileService';

const AddPortfolioScreen = () => {
    const c = useThemeColors();
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            // base64: true, // No longer need base64 for file upload
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!title || !description || !image) {
            Alert.alert('Missing Info', 'Title, Description and Image are required.');
            return;
        }

        try {
            setIsLoading(true);

            // 1. Upload image if it's a local URI (not already a URL)
            let finalImageUrl = image;
            if (!image.startsWith('http')) {
                finalImageUrl = await uploadPortfolioImage(image);
            }

            // 2. Fetch and update profile using profileService
            // This is safer than the direct /api/portfolio endpoint which was causing 500 errors
            const currentProfile = await profileService.getMyProfile();
            const currentPortfolio = currentProfile?.portfolio || [];

            const newPortfolioItem = {
                title,
                description,
                projectUrl: projectUrl || undefined,
                imageUrl: finalImageUrl,
                tags: []
            };

            await profileService.updateMyProfile({
                portfolio: [...currentPortfolio, newPortfolioItem]
            });

            Alert.alert('Success', 'Portfolio item added!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Add portfolio error:', error);
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to add item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
            <View style={{ flex: 1, maxWidth: isDesktop ? 700 : '100%', width: '100%', alignSelf: 'center' }}>
                <View style={[styles.header, { borderBottomColor: c.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Add to Portfolio</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { backgroundColor: c.card, borderColor: c.border }]}>
                        {image ? (
                            <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <MaterialIcons name="add-photo-alternate" size={48} color={c.primary} />
                                <Text style={{ color: c.subtext, marginTop: 8 }}>Add Cover Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={[styles.label, { color: c.text, marginTop: 24 }]}>Project Title</Text>
                    <TextInput
                        style={[styles.input, { borderColor: c.border, backgroundColor: c.card, color: c.text }]}
                        placeholder="e.g. E-commerce Website"
                        placeholderTextColor={c.subtext}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={[styles.label, { color: c.text, marginTop: 16 }]}>Description</Text>
                    <TextInput
                        style={[styles.input, { borderColor: c.border, backgroundColor: c.card, color: c.text, height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                        placeholder="Describe what you did..."
                        placeholderTextColor={c.subtext}
                        multiline
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Text style={[styles.label, { color: c.text, marginTop: 16 }]}>Project URL (Optional)</Text>
                    <TextInput
                        style={[styles.input, { borderColor: c.border, backgroundColor: c.card, color: c.text }]}
                        placeholder="https://..."
                        placeholderTextColor={c.subtext}
                        autoCapitalize="none"
                        value={projectUrl}
                        onChangeText={setProjectUrl}
                    />

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: c.primary, marginTop: 40 }]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Project</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    imagePicker: {
        height: 200,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveBtn: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});

export default AddPortfolioScreen;
