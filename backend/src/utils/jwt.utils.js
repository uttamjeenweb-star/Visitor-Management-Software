import jwt from "jsonwebtoken";
import env from "../config/env.js";

const signAccessToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "15m" });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const signRefreshToken = (id) => {
  // Using a longer expiration for refresh token (e.g., 7 days)
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "7d" });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken };