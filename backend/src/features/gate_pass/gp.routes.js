// import { Router } from 'express';
// import multer from 'multer';
// import { handleFormSubmission } from '../capture/formcontroller';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule
      ? mod
      : {
          default: mod,
        };
  };

// const router = Router();
// // Configure Multer for Memory Storage (provides file.buffer)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   // limits: { fileSize: 10 * 1024 * 1024 } // Optional: 5MB limit
// });
// // Use 'photo' as the field name to match your frontend
// router.post('/upload', upload.single('photo'), handleFormSubmission);
// export default router;
import * as express_1 from "express";
import multer_1 from "multer";
import * as gp_controller_1 from "../gate_pass/gp.controller.js";
import { protect, requireToken } from "../../middleware/auth.middleware.js";

const router = (0, express_1.Router)();
// Memory storage — file.buffer is available in the controller/service
const upload = (0, multer_1)({
  storage: multer_1.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  }, // 10 MB per file
});
/**
 * Accept:
 *   - "photo"         — the single webcam capture (required)
 *   - "aadharFile_N"  — one file per person (optional, up to 20 persons)
 *
 * Using upload.fields() so multer collects all files into req.files (an object),
 * while req.body still carries every text/JSON field.
 */
router.post(
  "/upload",
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
    ...Array.from(
      {
        length: 20,
      },
      (_, i) => ({
        name: `aadharFile_${i}`,
        maxCount: 1,
      }),
    ),
  ]),
  gp_controller_1.handleFormSubmission,
);


// We protect all dashboard and read/update endpoints
router.get("/dashboard/data", protect, gp_controller_1.getDashboardData);
router.get("/dashboard/stream", protect, gp_controller_1.getDashboardStream);
router.get("/", protect, gp_controller_1.getPasses);
router.get("/:id", protect, gp_controller_1.getPassById);
router.patch("/:id/status", protect, gp_controller_1.updatePassStatus);

export default router;
