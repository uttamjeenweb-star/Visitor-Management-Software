import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

export const getVisitingAreaService = async () => {
  return await prisma.visitingArea.findMany({
    where: {
      status: "active"
    }
  });
};

export const createVisitingAreaService = async (data) => {
  return await prisma.visitingArea.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updateVisitingAreaService = async (areaId, data) => {
  const exist = await prisma.visitingArea.findUnique({
    where: {
      id: areaId
    }
  });
  if (!exist) throw new appError_1("Visiting area not found", 404, "NOT_FOUND");
  return await prisma.visitingArea.update({
    where: {
      id: areaId
    },
    data
  });
};

export const deleteVisitingAreaService = async (areaId) => {
  const exist = await prisma.visitingArea.findUnique({
    where: {
      id: areaId
    }
  });
  if (!exist) throw new appError_1("Visiting area not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Visiting area is already deleted", 409, "CONFLICT");
  return await prisma.visitingArea.delete({
    where: {
      id: areaId
    }
  });
};
