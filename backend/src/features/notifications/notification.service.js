import { prisma } from "../../config/db.js";
import AppError from "../../utils/appError.js";
import { emitNotification } from "../../socket.js";

export const createNotification = async (userId, title, message, type = "info", link = null) => {
  const notification = await prisma.inAppNotification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });

  // Emit to socket room for real-time update
  emitNotification(userId, notification);

  return notification;
};

export const getUserNotifications = async (userId, unreadOnly = false) => {
  return await prisma.inAppNotification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.inAppNotification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404, "NOT_FOUND");
  }

  return await prisma.inAppNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  return await prisma.inAppNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
