import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { prisma } from "../config/db.js";

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query.token) {
    // Support token in query string for SSE endpoints like /dashboard/stream
    token = req.query.token;
  }
  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401, "TOKEN_NOT_PROVIDED"));
  }
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return next(new AppError("Invalid or expired token.", 401, "TOKEN_EXPIRED"));
  }
  const currentUser = await prisma.user.findUnique({
    where: {
      id: decoded.id
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
  if (!currentUser) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401, "USER_NOT_EXIST"));
  }
  
  // Try to find the associated employee to get employeeId and fallback fields
  const employee = await prisma.employee.findFirst({
    where: { email: currentUser.email }
  });
  
  if (employee) {
    currentUser.employeeId = employee.employeeId;
    if (!currentUser.designation) currentUser.designation = employee.designation;
    if (!currentUser.name) currentUser.name = employee.name;
    if (!currentUser.departmentId) currentUser.departmentId = employee.departmentId;
    // We do not overwrite departmentRef, but if it's missing, we could theoretically fetch it.
  }
  
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403, "FORBIDDEN_USER"));
    }
    next();
  };
};

export const requireToken = (requiredToken) => {
  return (req, res, next) => {
    // Removed hardcoded Super Admin bypass. All permissions are now dynamic based on role configuration.
    
    const [feature, action] = requiredToken.split(":");
    
    const hasToken = req.user?.roleRef?.permissions?.some(p => {
      if (p.module.toLowerCase() === feature.toLowerCase()) {
         if (action === "create") return p.canCreate;
         if (action === "read") return p.canRead;
         if (action === "update") return p.canUpdate;
         if (action === "delete") return p.canDelete;
         if (action === "access") return true; 
         if (p.dashboardActions && p.dashboardActions[action]) return true;
      }
      return false;
    });

    if (!hasToken) {
      return next(new AppError(`Forbidden: Requires token ${requiredToken}`, 403, "FORBIDDEN_TOKEN"));
    }
    next();
  };
};