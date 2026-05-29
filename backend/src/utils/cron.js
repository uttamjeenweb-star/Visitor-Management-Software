import cron from "node-cron";
import { prisma } from "../config/db.js";
import logger from "./logger.utils.js";

const runCronJob = async () => {
  try {
    const company = await prisma.companyRegister.findUnique({
      where: { id: "default" },
    });
    
    // Default to 19:00 if not found
    const endTimeStr = company?.endTime || "19:00";
    const [endHour, endMin] = endTimeStr.split(":").map(Number);
    
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Expiration threshold: 2 hours after endTime today
    const thresholdDate = new Date();
    thresholdDate.setHours(endHour + 2, endMin, 0, 0);

    const isPastThreshold = now > thresholdDate;
    
    const ninePM = new Date();
    ninePM.setHours(21, 0, 0, 0);
    const isPastNinePM = now > ninePM;

    // Get all passes that are not Checked-Out, Expired or Rejected
    const activePasses = await prisma.formData.findMany({
      where: {
        status: {
          notIn: ["Checked-Out", "Expired", "Rejected"]
        }
      }
    });

    for (const pass of activePasses) {
      let shouldExpire = false;
      let shouldCheckOut = false;
      let newStatus = pass.status;

      const passDateStr = pass.passDate.toISOString().split("T")[0];

      if (pass.gatePassType === "single") {
        if (passDateStr < today) {
          shouldExpire = true;
        } else if (passDateStr === today) {
          if (isPastThreshold) {
            shouldExpire = true;
          }
          if (pass.status === "Checked-In" && isPastNinePM) {
            shouldCheckOut = true;
          }
        }
      } else if (pass.gatePassType === "multi") {
        const toDateStr = pass.to ? pass.to.toISOString().split("T")[0] : passDateStr;
        if (toDateStr < today) {
          shouldExpire = true;
        } else if (toDateStr === today && isPastThreshold) {
          shouldExpire = true;
        }
      }

      if (shouldCheckOut && pass.status === "Checked-In") {
        newStatus = "Checked-Out";
        await prisma.formData.update({
          where: { id: pass.id },
          data: {
            status: newStatus,
            checkedOutAt: new Date(),
            checkedOutBy: "System",
          }
        });
        logger.info(`Auto checked out pass ${pass.id}`);
      } else if (shouldExpire) {
        newStatus = pass.status === "Checked-In" ? "Checked-Out" : "Expired";
        
        const updateData = { status: newStatus };
        if (newStatus === "Checked-Out") {
          updateData.checkedOutAt = new Date();
          updateData.checkedOutBy = "System";
        }
        
        await prisma.formData.update({
          where: { id: pass.id },
          data: updateData
        });
        logger.info(`Auto ${newStatus} pass ${pass.id}`);
      }
    }

    // Reset multi-day passes for the new day
    // If a multi-day pass is valid for today, but its status is Checked-Out/Expired from the past
    // reset it to Approved
    const allPasses = await prisma.formData.findMany({
      where: {
        gatePassType: "multi",
        status: {
          in: ["Checked-Out", "Expired"]
        }
      }
    });

    for (const pass of allPasses) {
      const fromDateStr = pass.from ? pass.from.toISOString().split("T")[0] : pass.passDate.toISOString().split("T")[0];
      const toDateStr = pass.to ? pass.to.toISOString().split("T")[0] : fromDateStr;

      // If today is within the valid range, and the last update was before today
      if (today >= fromDateStr && today <= toDateStr) {
        const lastUpdate = pass.updatedAt.toISOString().split("T")[0];
        if (lastUpdate < today) {
          await prisma.formData.update({
            where: { id: pass.id },
            data: {
              status: "Approved",
            }
          });
          logger.info(`Reset multi-day pass ${pass.id} to Approved for the new day`);
        }
      }
    }

  } catch (err) {
    logger.error(`Cron job error: ${err.message}`);
  }
};

export const initCronJob = () => {
  // Run every 5 minutes
  cron.schedule("*/5 * * * *", runCronJob);
  logger.info("Cron job initialized to run every 5 minutes.");
};
