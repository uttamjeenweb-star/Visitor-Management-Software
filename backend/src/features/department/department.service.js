import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

import { applyDataScope } from "../../utils/scope.js";

export const getDepartmentService = async (user) => {
  const baseQuery = { status: "active" };
  const query = applyDataScope(user, baseQuery, "id", "id");
  
  return await prisma.department.findMany({
    where: query
  });
};

export const createDepartmentService = async (data) => {
  if (data.managerEmployeeId === "") {
    data.managerEmployeeId = null;
  }
  return await prisma.department.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updateDepartmentService = async (departmentId, data) => {
  const exist = await prisma.department.findUnique({
    where: {
      id: departmentId
    }
  });
  if (!exist) throw new appError_1("Department not found", 404, "NOT_FOUND");
  
  // Rule: Strict manager requirement on edit (but not on create)
  if (!data.managerEmployeeId) {
    throw new appError_1("Manager Employee ID is strictly required when updating a department.", 400, "BAD_REQUEST");
  }

  if (data.managerEmployeeId === "") {
    data.managerEmployeeId = null;
  }

  return await prisma.department.update({
    where: {
      id: departmentId
    },
    data
  });
};

export const deleteDepartmentService = async (departmentId) => {
  const exist = await prisma.department.findUnique({
    where: {
      id: departmentId
    }
  });
  if (!exist) throw new appError_1("Department not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Department is already deleted", 409, "CONFLICT");
  return await prisma.department.delete({
    where: {
      id: departmentId
    }
  });
};
