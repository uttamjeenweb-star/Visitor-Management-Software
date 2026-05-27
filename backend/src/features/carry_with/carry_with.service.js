import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

export const getCarryWithService = async () => {
  return await prisma.carryWith.findMany({
    where: {
      status: "active"
    }
  });
};

export const createCarryWithService = async (data) => {
  return await prisma.carryWith.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updateCarryWithService = async (itemId, data) => {
  const exist = await prisma.carryWith.findUnique({
    where: {
      id: itemId
    }
  });
  if (!exist) throw new appError_1("Carry With item not found", 404, "NOT_FOUND");
  return await prisma.carryWith.update({
    where: {
      id: itemId
    },
    data
  });
};

export const deleteCarryWithService = async (itemId) => {
  const exist = await prisma.carryWith.findUnique({
    where: {
      id: itemId
    }
  });
  if (!exist) throw new appError_1("Carry-with item not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Carry-with item is already deleted", 409, "CONFLICT");
  return await prisma.carryWith.delete({
    where: {
      id: itemId
    }
  });
};
