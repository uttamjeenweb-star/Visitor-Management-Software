import AppError from "../../utils/appError.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.utils.js";
import { prisma } from "../../config/db.js";
import * as bcrypt from "bcryptjs";

const registerUser = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (existingUser) {
    throw new AppError("Email already exists", 400, "CONFLICT_ERROR");
  }
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const newUser = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      systemPassword: data.password,
    },
  });
  
  const accessToken = signAccessToken(newUser.id);
  const refreshToken = signRefreshToken(newUser.id);
  
  newUser.password = undefined;
  
  return {
    user: newUser,
    accessToken,
    refreshToken
  };
};

const loginUser = async (data) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    include: {
      departmentRef: true,
      roleRef: {
        include: {
          permissions: true
        }
      }
    }
  });
  
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new AppError("Incorrect email or password", 401, "INVALID_CREDENTIAL");
  }

  // Update systemPassword dynamically when user logs in so existing users get it populated
  await prisma.user.update({
    where: { id: user.id },
    data: { systemPassword: data.password }
  });
  user.systemPassword = data.password;

  const employee = await prisma.employee.findFirst({
    where: { email: user.email }
  });
  if (employee) {
    user.employeeId = employee.employeeId;
    if (!user.designation) user.designation = employee.designation;
    if (!user.name) user.name = employee.name;
    if (!user.departmentId) user.departmentId = employee.departmentId;
  }
  
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  
  user.password = undefined;
  
  return {
    user,
    accessToken,
    refreshToken
  };
};

export { registerUser, loginUser };