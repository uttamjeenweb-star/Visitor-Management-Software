import { catchAsync } from "../../utils/catchAsync.js";
import * as notificationService from "./notification.service.js";

export const getMyNotifications = catchAsync(async (req, res) => {
  const unreadOnly = req.query.unread === "true";
  const notifications = await notificationService.getUserNotifications(req.user.id, unreadOnly);
  
  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: { notifications },
  });
});

export const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.id);
  
  res.status(200).json({
    status: "success",
    data: { notification },
  });
});

export const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  
  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});
