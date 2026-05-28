import { UPLOAD_DIR } from "../config/uploads.js";
import multer_1 from "multer";
import path_1 from "path";
import fs_1 from "fs"; // Ensure the directory exists
const uploadDir = UPLOAD_DIR;
if (!fs_1.existsSync(uploadDir)) {
  fs_1.mkdirSync(uploadDir, {
    recursive: true
  });
}
const storage = multer_1.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path_1.extname(file.originalname)}`);
  }
});
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed for logo upload"));
  }
  cb(null, true);
};

export const upload = (0, multer_1)({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadLogo = (0, multer_1)({
  storage: multer_1.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});