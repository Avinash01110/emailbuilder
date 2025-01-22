import express from 'express';
import multer from 'multer';
import emailController from '../controllers/emailController.js';

const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get('/getEmailLayout', emailController.getEmailLayout);
router.get('/email/:id', emailController.getEmailById);
router.put('/email/:id', emailController.updateEmailById);
router.post('/uploadImage', upload.single('image'), emailController.uploadImage);
router.post('/uploadEmailConfig', emailController.uploadEmailConfig);
router.get('/renderAndDownloadTemplate/:id', emailController.renderAndDownloadTemplate);

export default router;