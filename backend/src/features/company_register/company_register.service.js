import { prisma } from "../../config/db.js";
import { uploadImage, deleteImage } from "../../config/cloudinary.js";

const COMPANY_REGISTER_ID = "default";

export const getCompanyRegisterService = async () => {
  return await prisma.companyRegister.findUnique({
    where: { id: COMPANY_REGISTER_ID }
  });
};

export const upsertCompanyRegisterService = async (data, logoFile) => {
  const existing = await prisma.companyRegister.findUnique({
    where: { id: COMPANY_REGISTER_ID },
  });

  let logoUrl = existing?.logoUrl ?? "";
  let logoPublicId = existing?.logoPublicId ?? null;
  
  if (logoFile) {
    if (existing?.logoPublicId) {
      await deleteImage(existing.logoPublicId).catch(() => {});
    }
    const uploadResult = await uploadImage(logoFile.buffer, 'create-pass/company');
    logoUrl = uploadResult.secure_url;
    logoPublicId = uploadResult.public_id;
  }

  const payload = {
    companyFullName: data.companyFullName ?? "",
    companyShortName: data.companyShortName ?? "",
    companyContactNo: data.companyContactNo ?? "",
    logoUrl,
    logoPublicId,
    hostName: data.hostName ?? "",
    portNo: Number.isFinite(Number(data.portNo)) ? Number(data.portNo) : 0,
    userEmailId: data.userEmailId ?? "",
    emailPassword: data.emailPassword ?? "",
    startTime: data.startTime ?? "09:00",
    endTime: data.endTime ?? "19:00",
  };

  if (existing) {
    return await prisma.companyRegister.update({
      where: { id: COMPANY_REGISTER_ID },
      data: payload,
    });
  }

  return await prisma.companyRegister.create({
    data: { id: COMPANY_REGISTER_ID, ...payload },
  });
};
