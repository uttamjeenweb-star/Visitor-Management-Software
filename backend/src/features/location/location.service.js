import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

export const getLocationService = async () => {
  return await prisma.location.findMany({
    where: {
      status: "active"
    }
  });
};

export const createLocationService = async (data) => {
  return await prisma.location.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updateLocationService = async (locationId, data) => {
  const exist = await prisma.location.findUnique({
    where: {
      id: locationId
    }
  });
  if (!exist) throw new appError_1("Location not found", 404, "NOT_FOUND");
  return await prisma.location.update({
    where: {
      id: locationId
    },
    data
  });
};

export const deleteLocationService = async (locationId) => {
  const exist = await prisma.location.findUnique({
    where: {
      id: locationId
    }
  });
  if (!exist) throw new appError_1("Location not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Location is already deleted", 409, "CONFLICT");
  return await prisma.location.delete({
    where: {
      id: locationId
    }
  });
};
