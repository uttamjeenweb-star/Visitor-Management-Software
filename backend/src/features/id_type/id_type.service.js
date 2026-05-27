import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";

export const getIdTypeService = async () => {
  return await prisma.IdType.findMany({
    where: {
      status: "active"
    }
  });
};

export const createIdTypeService = async (data) => {
  return await prisma.IdType.create({
    data: {
      ...data,
      status: "active"
    }
  });
};

export const updateIdTypeService = async (idTypeId, data) => {
  const exist = await prisma.IdType.findUnique({
    where: {
      id: idTypeId
    }
  });
  if (!exist) throw new appError_1("ID type not found", 404, "NOT_FOUND");
  return await prisma.IdType.update({
    where: {
      id: idTypeId
    },
    data
  });
};

export const deleteIdTypeService = async (idTypeId) => {
  const exist = await prisma.IdType.findUnique({
    where: {
      id: idTypeId
    }
  });
  if (!exist) throw new appError_1("ID type not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("ID type is already deleted", 409, "CONFLICT");
  return await prisma.IdType.delete({
    where: {
      id: idTypeId
    }
  });
};
