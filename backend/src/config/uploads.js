import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Since this file resides in backend/src/config/, going two levels up resolves to the backend root directory.
export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
