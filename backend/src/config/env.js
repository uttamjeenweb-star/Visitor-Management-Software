import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
import * as zod_1 from "zod";
import dotenv_1 from "dotenv";
import path_1 from "path"; // Load .env file
dotenv_1.config({
  path: path_1.resolve(__dirname, '../../.env')
});
const envSchema = zod_1.z.object({
  NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
  PORT: zod_1.z.string().default('5000'),
  DATABASE_URL: zod_1.z.string(),
  JWT_SECRET: zod_1.z.string(),
  CLIENT_URL: zod_1.z.string().default('http://localhost:5173')
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}
const env = _env.data;
export default env;