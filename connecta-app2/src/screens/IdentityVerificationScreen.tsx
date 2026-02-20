import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useThemeColors } from "../theme/theme";
import verificationService from "../services/verificationService";
import { useInAppAlert } from "../components/InAppAlert";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";

const ID_TYPES = [
    { label: "National ID Card", value: "national_id" },
    { label: "Voter's Card", value: "voters_card" },
    { label: "International Passport", value: "passport" },
    { label: "Other Identity", value: "other" },
];

export default function IdentityVerificationScreen({ navigation }: any) {
    const c = useThemeColors();
    const { width } = useWindowDimensions();
    const isDesktop = width > 768;
    const { showAlert } = useInAppAlert();
    const { updateUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [existingVerification, setExistingVerification] = useState<any>(null);

    const [idType, setIdType] = useState<any>("national_id");
    const [idNumber, setIdNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [idFrontImage, setIdFrontImage] = useState<any>(null);
    const [idBackImage, setIdBackImage] = useState<any>(null);
    const [selfieImage, setSelfieImage] = useState<any>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            setCheckingStatus(true);
            const status = await verificationService.getVerificationStatus();
            setExistingVerification(status);
        } catch (error) {
            // 404 is fine, means no request yet
            console.log("No existing verification found");
        } finally {
            setCheckingStatus(false);
        }
    };

    const handlePickImage = async (target: "front" | "back" | "selfie") => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: target === "selfie" ? [1, 1] : [16, 10],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const image = result.assets[0];
                if (target === "front") setIdFrontImage(image);
                else if (target === "back") setIdBackImage(image);
                else if (target === "selfie") setSelfieImage(image);
            }
        } catch (error) {
            showAlert({
                title: "Error",
                message: "Failed to pick image",
                type: "error",
            });
        }
    };

    const handleSubmit = async () => {
        if (!idNumber || !fullName || !idFrontImage) {
            showAlert({
                title: "Missing Information",
                message: "Please fill in all required fields and upload at least the ID front image.",
                type: "error",
            });
            return;
        }

        try {
            setLoading(true);
            await verificationService.submitVerification({
                idType,
                idNumber,
                fullName,
                dateOfBirth,
                idFrontImage,
                idBackImage,
                selfieImage,
            });

            showAlert({
                title: "Success",
                message: "Verification request submitted successfully. We will review it shortly.",
                type: "success",
            });

            // Refresh user sparks globally
            const updatedUser = await userService.getMe();
            updateUser(updatedUser);

            navigation.goBack();
        } catch (error: any) {
            showAlert({
                title: "Submission Failed",
                message: error.response?.data?.message || "Something went wrong. Please try again.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} />
            </View>
        );
    }

    if (existingVerification && existingVerification.status !== "rejected") {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={c.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: c.text }]}>Verification Status</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.statusContent}>
                    <MaterialCommunityIcons
                        name={
                            existingVerification.status === "approved"
                                ? "check-decagram"
                                : "clock-outline"
                        }
                        size={80}
                        color={existingVerification.status === "approved" ? "#10B981" : "#F59E0B"}
                    />
                    <Text style={[styles.statusTitle, { color: c.text }]}>
                        {existingVerification.status === "approved"
                            ? "Verified Professional"
                            : "Verification Pending"}
                    </Text>
                    <Text style={[styles.statusDesc, { color: c.subtext }]}>
                        {existingVerification.status === "approved"
                            ? "Your identity has been verified. You now have a verified badge on your profile."
                            : "Your documents are currently being reviewed by our team. This usually takes 24-48 hours."}
                    </Text>

                    <Card style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: c.subtext }]}>ID Type:</Text>
                            <Text style={[styles.infoValue, { color: c.text }]}>
                                {ID_TYPES.find((t) => t.value === existingVerification.idType)?.label}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: c.subtext }]}>Full Name:</Text>
                            <Text style={[styles.infoValue, { color: c.text }]}>
                                {existingVerification.fullName}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: c.subtext }]}>Submitted on:</Text>
                            <Text style={[styles.infoValue, { color: c.text }]}>
                                {new Date(existingVerification.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </Card>

                    <Button
                        title="Go Back"
                        onPress={() => navigation.goBack()}
                        variant="outline"
                        style={{ marginTop: 20, width: '100%' }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={c.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>Identity Verification</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.introSection}>
                    <Text style={[styles.introTitle, { color: c.text }]}>Get Verified</Text>
                    <Text style={[styles.introDesc, { color: c.subtext }]}>
                        Verify your identity to build trust with clients and earn a verified badge.
                    </Text>
                    <View style={[styles.feeBox, { backgroundColor: c.primary + '10', borderColor: c.primary + '30' }]}>
                        <View style={styles.feeItem}>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color={c.primary} />
                            <Text style={[styles.feeText, { color: c.text }]}>Cost: <Text style={{ fontWeight: 'bold' }}>500 Sparks</Text></Text>
                        </View>
                        <View style={styles.feeItem}>
                            <MaterialCommunityIcons name="gift" size={20} color="#10B981" />
                            <Text style={[styles.feeText, { color: c.text }]}>Reward: <Text style={{ fontWeight: 'bold', color: '#10B981' }}>100 Sparks back</Text> on approval</Text>
                        </View>
                    </View>
                </View>

                {existingVerification?.status === "rejected" && (
                    <View style={[styles.rejectionNotice, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                        <Ionicons name="alert-circle" size={24} color="#B91C1C" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ color: '#B91C1C', fontWeight: 'bold' }}>Previous Request Rejected</Text>
                            <Text style={{ color: '#B91C1C', fontSize: 13 }}>{existingVerification.adminNotes || "Please provide clearer images and try again."}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.formSection}>
                    <Text style={[styles.label, { color: c.text }]}>Select ID Type</Text>
                    <View style={styles.idTypeGrid}>
                        {ID_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.value}
                                style={[
                                    styles.idTypeButton,
                                    { borderColor: c.border },
                                    idType === type.value && { borderColor: c.primary, backgroundColor: c.primary + "10" },
                                ]}
                                onPress={() => setIdType(type.value)}
                            >
                                <Text
                                    style={[
                                        styles.idTypeText,
                                        { color: c.text },
                                        idType === type.value && { color: c.primary, fontWeight: "bold" },
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>Full Name (as on ID)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="e.g. John Doe"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>ID Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
                            value={idNumber}
                            onChangeText={setIdNumber}
                            placeholder="Enter ID number"
                            placeholderTextColor={c.subtext}
                        />
                    </View>

                    <Text style={[styles.label, { color: c.text, marginTop: 10 }]}>Upload Images</Text>

                    <View style={styles.uploadRow}>
                        <TouchableOpacity
                            style={[styles.uploadBox, { backgroundColor: c.card, borderColor: c.border }]}
                            onPress={() => handlePickImage("front")}
                        >
                            {idFrontImage ? (
                                <Image source={{ uri: idFrontImage.uri }} style={styles.previewImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={32} color={c.primary} />
                                    <Text style={[styles.uploadText, { color: c.subtext }]}>Front Side</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.uploadBox, { backgroundColor: c.card, borderColor: c.border }]}
                            onPress={() => handlePickImage("back")}
                        >
                            {idBackImage ? (
                                <Image source={{ uri: idBackImage.uri }} style={styles.previewImage} />
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={32} color={c.primary} />
                                    <Text style={[styles.uploadText, { color: c.subtext }]}>Back Side (Opt)</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.uploadRow}>
                        <TouchableOpacity
                            style={[styles.uploadBox, { backgroundColor: c.card, borderColor: c.border, width: '100%' }]}
                            onPress={() => handlePickImage("selfie")}
                        >
                            {selfieImage ? (
                                <Image source={{ uri: selfieImage.uri }} style={styles.previewImage} />
                            ) : (
                                <>
                                    <Ionicons name="person-outline" size={32} color={c.primary} />
                                    <Text style={[styles.uploadText, { color: c.subtext }]}>Selfie with ID (Optional)</Text>
                                    <Text style={[styles.uploadSubtext, { color: c.subtext }]}>Hold your ID next to your face</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <Button
                    title={loading ? "Submitting..." : "Submit for Verification"}
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.submitButton}
                />
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        padding: 20,
    },
    introSection: {
        marginBottom: 25,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    introDesc: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    feeBox: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    feeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    feeText: {
        fontSize: 14,
    },
    rejectionNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 25,
    },
    formSection: {
        gap: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    idTypeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 10,
    },
    idTypeButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
    },
    idTypeText: {
        fontSize: 14,
    },
    inputGroup: {
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 15,
        fontSize: 15,
    },
    uploadRow: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 5,
    },
    uploadBox: {
        flex: 1,
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    uploadText: {
        fontSize: 13,
        fontWeight: "500",
        marginTop: 8,
    },
    uploadSubtext: {
        fontSize: 11,
        marginTop: 4,
    },
    previewImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    submitButton: {
        marginTop: 30,
    },
    statusContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 10,
    },
    statusDesc: {
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 30,
    },
    infoCard: {
        width: "100%",
        padding: 20,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
    },
});
