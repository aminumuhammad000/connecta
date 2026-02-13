import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load env from project root (server/)
dotenv.config({ path: path.join(__dirname, '../../.env') });
console.log('Testing Cloudinary Config...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '******' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
async function test() {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connection Successful:', result);
    }
    catch (error) {
        console.error('❌ Cloudinary Connection Failed:', error);
    }
}
test();
