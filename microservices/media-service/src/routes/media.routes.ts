import express, { Request, Response } from 'express';
import { upload } from '../config/cloudinary';
import { Media } from '../models/media.model';

const router = express.Router();

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    const { path, filename, size, mimetype } = req.file as any;

    const media = new Media({
        userId: (req as any).currentUser?.id || 'anonymous',
        url: path,
        publicId: filename,
        fileName: req.file.originalname,
        fileType: mimetype,
        size: size,
    });

    await media.save();

    res.status(201).send(media);
});

router.get('/:id', async (req: Request, res: Response) => {
    const media = await Media.findById(req.params.id);
    if (!media) {
        return res.status(404).send({ message: 'Media not found' });
    }
    res.send(media);
});

export { router as mediaRouter };
