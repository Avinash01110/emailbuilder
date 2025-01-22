import express from "express";
import multer from "multer";
import emailController from "../controllers/emailController.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.get("/getEmailLayout", emailController.getEmailLayout);
router.get("/email/:id", emailController.getEmailById);
router.put("/email/:id", emailController.updateEmailById);
router.post(
  "/uploadImage",
  upload.single("image"),
  emailController.uploadImage
);
router.post("/uploadEmailConfig", emailController.uploadEmailConfig);
router.get(
  "/renderAndDownloadTemplate/:id",
  emailController.renderAndDownloadTemplate
);

export default router;
