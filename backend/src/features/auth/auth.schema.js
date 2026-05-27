import * as zod_1 from "zod";
export const registerSchema = zod_1.z.object({
  body: zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters")
  })
});
export const loginSchema = zod_1.z.object({
  body: zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required")
  })
});