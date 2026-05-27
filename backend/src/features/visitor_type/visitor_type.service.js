import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

export const getVisitorTypeService = async () => {
  return await prisma.visitorType.findMany({
    where: {
      status: "active"
    }
  });
};

export const createVisitorTypeService = async (data) => {
  return await prisma.visitorType.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updateVisitorTypeService = async (visitorId, data) => {
  const exist = await prisma.visitorType.findUnique({
    where: {
      id: visitorId
    }
  });
  if (!exist) throw new appError_1("Visitor type not found", 404, "NOT_FOUND");
  return await prisma.visitorType.update({
    where: {
      id: visitorId
    },
    data
  });
};

export const deleteVisitorTypeService = async (visitorId) => {
  const exist = await prisma.visitorType.findUnique({
    where: {
      id: visitorId
    }
  });
  if (!exist) throw new appError_1("Visitor type not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Visitor type is already deleted", 409, "CONFLICT");
  return await prisma.visitorType.delete({
    where: {
      id: visitorId
    }
  });
};
