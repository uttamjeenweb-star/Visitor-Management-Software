import { catchAsync } from "../../utils/catchAsync.js";
import * as authService from "./auth.service.js";
import AppError from "../../utils/appError.js";
import { verifyRefreshToken, signAccessToken } from "../../utils/jwt.utils.js";
import { prisma } from "../../config/db.js";

const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction, // true in prod for https, false in dev for http
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin prod, 'lax' for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  
  setRefreshTokenCookie(res, refreshToken);
  
  res.status(201).json({
    status: "success",
    accessToken,
    data: {
      user,
    },
  });
});

export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  
  setRefreshTokenCookie(res, refreshToken);
  
  res.status(200).json({
    status: "success",
    accessToken,
    data: {
      user,
    },
  });
});

export const refresh = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return next(new AppError("No refresh token found", 401, "UNAUTHORIZED"));
  }

  const decoded = verifyRefreshToken(refreshToken);
  
  if (!decoded) {
    return next(new AppError("Invalid or expired refresh token", 401, "UNAUTHORIZED"));
  }
  
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  
  if (!user) {
    return next(new AppError("User no longer exists", 401, "UNAUTHORIZED"));
  }
  
  const accessToken = signAccessToken(user.id);
  
  res.status(200).json({
    status: "success",
    accessToken
  });
});

export const getMe = catchAsync(async (req, res) => {
  // requires auth middleware to set req.user
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

export const getUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, roleId: true }
  });
  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});