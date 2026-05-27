import { prisma } from "../../config/db.js";
import AppError from "../../utils/appError.js";

export const createRole = async (data) => {
  const existingRole = await prisma.role.findUnique({
    where: { name: data.name },
  });

  if (existingRole) {
    throw new AppError("Role with this name already exists", 400, "CONFLICT_ERROR");
  }

  const role = await prisma.role.create({
    data: {
      name: data.name,
      weight: data.weight || 10,
      dataScope: data.dataScope || "personal",
      permissions: {
        create: data.permissions || [],
      },
    },
    include: {
      permissions: true,
    },
  });

  return role;
};

export const getRoles = async () => {
  return await prisma.role.findMany({
    include: {
      permissions: true,
    },
  });
};

export const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });

  if (!role) {
    throw new AppError("Role not found", 404, "NOT_FOUND");
  }

  return role;
};

export const updateRole = async (id, data) => {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new AppError("Role not found", 404, "NOT_FOUND");
  }

  // If permissions are provided, we replace all existing ones (cleanest approach for matrix)
  if (data.permissions) {
    await prisma.permission.deleteMany({
      where: { roleId: id },
    });
  }

  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      weight: data.weight,
      dataScope: data.dataScope,
      permissions: data.permissions
        ? {
            create: data.permissions,
          }
        : undefined,
    },
    include: {
      permissions: true,
    },
  });

  return updatedRole;
};

export const deleteRole = async (id) => {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new AppError("Role not found", 404, "NOT_FOUND");
  }

  // Check if users are assigned to this role
  const usersWithRole = await prisma.user.count({ where: { roleId: id } });
  if (usersWithRole > 0) {
    throw new AppError(`Cannot delete role. ${usersWithRole} users are currently assigned to it.`, 400, "BAD_REQUEST");
  }

  await prisma.role.delete({ where: { id } });

  return null;
};
