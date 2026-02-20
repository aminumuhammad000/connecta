import api from "./api";

export interface VerificationData {
    idType: "national_id" | "voters_card" | "passport" | "other";
    idNumber: string;
    fullName: string;
    dateOfBirth?: string;
    idFrontImage: any;
    idBackImage?: any;
    selfieImage?: any;
}

const submitVerification = async (data: VerificationData) => {
    const formData = new FormData();
    formData.append("idType", data.idType);
    formData.append("idNumber", data.idNumber);
    formData.append("fullName", data.fullName);
    if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);

    if (data.idFrontImage) {
        formData.append("idFrontImage", {
            uri: data.idFrontImage.uri,
            type: "image/jpeg",
            name: "id-front.jpg",
        } as any);
    }

    if (data.idBackImage) {
        formData.append("idBackImage", {
            uri: data.idBackImage.uri,
            type: "image/jpeg",
            name: "id-back.jpg",
        } as any);
    }

    if (data.selfieImage) {
        formData.append("selfieImage", {
            uri: data.selfieImage.uri,
            type: "image/jpeg",
            name: "selfie.jpg",
        } as any);
    }

    const response = await api.post("/verifications/submit", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

const getVerificationStatus = async () => {
    const response = await api.get("/verifications/status");
    return response.data;
};

export default {
    submitVerification,
    getVerificationStatus,
};
