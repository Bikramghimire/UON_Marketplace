import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure multer memory storage
 * Files are stored in memory as buffers
 */
const storage = multer.memoryStorage();

/**
 * File filter for images only
 */
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

/**
 * Multer upload configuration
 * - Stores files in memory (buffers)
 * - Limits file size to 5MB
 * - Allows multiple files (up to 10)
 * - Only accepts image files
 */
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Middleware for single image upload
 */
export const uploadSingle = upload.single('image');

/**
 * Middleware for multiple image upload
 */
export const uploadMultiple = upload.array('images', 10); // Max 10 images

export default upload;

