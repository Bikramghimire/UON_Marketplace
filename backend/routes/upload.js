

import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();


router.post('/images', protect, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map((file, index) => {
      return uploadToCloudinary(file.buffer, 'uon_marketplace/products');
    });

    const uploadResults = await Promise.all(uploadPromises);

        const images = uploadResults.map((result, index) => ({
      url: result.url,
      public_id: result.public_id,
      isPrimary: index === 0,       width: result.width,
      height: result.height,
      format: result.format
    }));

    res.json({
      success: true,
      message: `${images.length} image(s) uploaded successfully`,
      data: {
        images: images
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading images',
      error: error.message
    });
  }
});


router.post('/image', protect, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

        const file = req.files[0];
    const result = await uploadToCloudinary(file.buffer, 'uon_marketplace/products');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image',
      error: error.message
    });
  }
});

export default router;

