import { z } from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Role name is required" }),
    weight: z.number().int().min(1).max(100).optional(),
    dataScope: z.string().optional(),
    permissions: z.array(
      z.object({
        module: z.string(),
        canRead: z.boolean().optional(),
        canCreate: z.boolean().optional(),
        canUpdate: z.boolean().optional(),
        canDelete: z.boolean().optional(),
        dashboardActions: z.any().optional(),
      })
    ).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    weight: z.number().int().min(1).max(100).optional(),
    dataScope: z.string().optional(),
    permissions: z.array(
      z.object({
        module: z.string(),
        canRead: z.boolean().optional(),
        canCreate: z.boolean().optional(),
        canUpdate: z.boolean().optional(),
        canDelete: z.boolean().optional(),
        dashboardActions: z.any().optional(),
      })
    ).optional(),
  }),
});
