import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};


export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,   },
  fileFilter: fileFilter
});


export const uploadSingle = upload.single('image');


export const uploadMultiple = upload.array('images', 10); 
export default upload;

