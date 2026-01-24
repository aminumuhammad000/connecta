import { uploadFile } from './api';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/constants';

/**
 * Upload an image to the server
 * @param uri Local URI of the image
 * @returns URL of the uploaded image
 */
export const uploadImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
        uri,
        name: filename,
        type,
    } as any);

    const response: any = await uploadFile(API_ENDPOINTS.UPLOAD_FILE, formData);

    // Backend returns { message: "...", data: { url: "/uploads/..." } }
    let url = response.data?.url;

    if (url && url.startsWith('/')) {
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
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
        uri,
        name: filename,
        type,
    } as any);

    const response: any = await uploadFile(API_ENDPOINTS.UPLOAD_AVATAR, formData);

    // Backend returns { success: true, data: { url: "https://res.cloudinary.com/..." } }
    return response.data?.url;
};

/**
 * Upload a portfolio image to Cloudinary via the server
 * @param uri Local URI of the image
 * @returns URL of the uploaded image
 */
export const uploadPortfolioImage = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
        uri,
        name: filename,
        type,
    } as any);

    const response: any = await uploadFile(API_ENDPOINTS.UPLOAD_PORTFOLIO_IMAGE, formData);

    // Backend returns { success: true, data: { url: "https://res.cloudinary.com/..." } }
    return response.data?.url;
};
