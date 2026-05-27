import { PrismaClient } from "@prisma/client";
const logger = (await import('../utils/logger.utils.js')).default || (await import('../utils/logger.utils.js')).default;
const prisma = new PrismaClient();
const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info(`MySQL Database Connected via Prisma`);
    
    // Set default status 'Pending' for existing data where status is null/undefined
    const updated = await prisma.formData.updateMany({
      where: {
        OR: [
          { status: null },
          { status: "" }
        ]
      },
      data: {
        status: "Pending"
      }
    });
    if (updated.count > 0) {
      logger.info(`Updated ${updated.count} passes with default status 'Pending'`);
    }
  } catch (error) {
    logger.error(`Error connecting to MySQL: ${error.message}`);
    process.exit(1);
  }
};
export { connectDB, prisma };