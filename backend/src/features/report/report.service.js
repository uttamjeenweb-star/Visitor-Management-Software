import { prisma } from "../../config/db.js";
import logger from "../../utils/logger.utils.js";
import { getAllowedHostIds } from "../../utils/scope.js";

export const getReportPassesService = async (filters = {}, user = null) => {
  try {
    let finalFilters = { ...filters };
    
    if (user) {
      const allowedHosts = await getAllowedHostIds(user);
      if (allowedHosts !== null) {
        finalFilters.toMeetWith = { in: allowedHosts };
      }
    }

    return await prisma.formData.findMany({
      where: finalFilters,
      include: {
        persons: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  } catch (err) {
    logger.error(`getReportPassesService error: ${err.message}`);
    throw err;
  }
};
