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
