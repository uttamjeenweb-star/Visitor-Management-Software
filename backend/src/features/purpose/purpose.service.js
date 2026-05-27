import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

export const getPurposeService = async () => {
  return await prisma.purpose.findMany({
    where: {
      status: "active"
    }
  });
};

export const createPurposeService = async (data) => {
  return await prisma.purpose.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updatePurposeService = async (purposeId, data) => {
  const exist = await prisma.purpose.findUnique({
    where: {
      id: purposeId
    }
  });
  if (!exist) throw new appError_1("Purpose not found", 404, "NOT_FOUND");
  return await prisma.purpose.update({
    where: {
      id: purposeId
    },
    data
  });
};

export const deletePurposeService = async (purposeId) => {
  const exist = await prisma.purpose.findUnique({
    where: {
      id: purposeId
    }
  });
  if (!exist) throw new appError_1("Purpose not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Purpose is already deleted", 409, "CONFLICT");
  return await prisma.purpose.delete({
    where: {
      id: purposeId
    }
  });
};
