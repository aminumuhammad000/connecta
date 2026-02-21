import { Platform } from 'react-native';
import { uploadFile, uploadFilePublic } from './api';

/**
 * Upload an avatar publicly (for new users)
 */
export const uploadAvatarPublic = async (uri: string): Promise<string> => {
    console.log('📤 Starting public avatar upload...');
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('avatar', blob, filename);
    } else {
        console.log('📱 Mobile platform detected. File details:', { uri, filename, type });
        formData.append('avatar', {
            uri,
            name: filename,
            type,
        } as any);
    }

    console.log('📤 FormData prepared. Fields:', (formData as any)._parts?.map((p: any) => p[0]));

    try {
        const axiosResponse: any = await uploadFilePublic(API_ENDPOINTS.UPLOAD_AVATAR_PUBLIC, formData);
        const responseData = axiosResponse;
        return responseData.url || responseData.data?.url;
    } catch (error) {
        console.error('❌ Public upload error:', error);
        throw error;
    }
};
import { API_ENDPOINTS, API_BASE_URL } from '../utils/constants';

/**
 * Upload an image to the server
 * @param uri Local URI of the image
 * @returns URL of the uploaded image
 */
export const uploadImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'file.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
    } else {
        formData.append('file', {
            uri,
            name: filename,
            type,
        } as any);
    }

    const apiResponse: any = await uploadFile(API_ENDPOINTS.UPLOAD_FILE, formData);
    let url = apiResponse.url || apiResponse.data?.url || apiResponse;

    if (url && typeof url === 'string' && url.startsWith('/')) {
        url = `${API_BASE_URL}${url}`;
    }

    return url;
};

/**
 * Upload an avatar to Cloudinary via the server
 * @param uri Local URI of the image
 * @returns URL of the uploaded avatar
 */
export const uploadAvatar = async (uri: string): Promise<string> => {
    console.log('📤 Starting avatar upload for URI:', uri.substring(0, 50) + '...');
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
        try {
            console.log('🌐 Web platform detected, converting URI to Blob...');
            const response = await fetch(uri);
            const blob = await response.blob();
            console.log('📦 Blob created successfully:', { type: blob.type, size: blob.size });

            // On Web, the third argument is the filename
            formData.append('avatar', blob, filename);
            console.log('✅ Blob appended to avatar field');
        } catch (err) {
            console.error('❌ Error creating blob for web upload:', err);
            // Fallback: If fetch fails, try to append the uri directly 
            // though this usually results in [object Object] if not handled by the environment
            formData.append('avatar', uri);
        }
    } else {
        console.log('📱 Mobile platform detected');
        formData.append('avatar', {
            uri: uri,
            name: filename,
            type: type,
        } as any);
    }

    try {
        console.log('🚀 Sending request to server...');
        const apiResponse: any = await uploadFile(API_ENDPOINTS.UPLOAD_AVATAR, formData);
        console.log('✅ Server response received');

        // The server might return { success: true, data: { url: "..." } } 
        // OR it might be flattened depending on the interceptor
        const url = apiResponse.url || apiResponse.data?.url || apiResponse;

        if (!url || typeof url !== 'string') {
            console.error('❌ Unexpected response format:', apiResponse);
            throw new Error('Invalid response from upload server');
        }

        return url;
    } catch (error: any) {
        console.error('❌ Upload service fatal error:', error);
        throw error;
    }
};

/**
 * Upload a portfolio image to Cloudinary via the server
 * @param uri Local URI of the image
 * @returns URL of the uploaded image
 */
export const uploadPortfolioImage = async (uri: string): Promise<string> => {
    console.log('📤 Starting portfolio upload for URI:', uri.substring(0, 50) + '...');
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'portfolio.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
    } else {
        formData.append('file', {
            uri: uri,
            name: filename,
            type: type,
        } as any);
    }

    try {
        const apiResponse: any = await uploadFile(API_ENDPOINTS.UPLOAD_PORTFOLIO_IMAGE, formData);
        console.log('✅ Portfolio upload response received');
        return apiResponse.url || apiResponse.data?.url || apiResponse;
    } catch (error) {
        console.error('❌ Upload service error:', error);
        throw error;
    }
};
