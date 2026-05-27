import { prisma } from "../config/db.js";

export const applyDataScope = (user, query = {}, hostField = "hostEmployeeId", departmentField = "departmentId") => {
  const scope = user?.roleRef?.dataScope || "personal";

  if (scope === "global") {
    // No additional filters needed for global scope
    return query;
  }

  if (scope === "departmental") {
    // If departmental scope, filter by the user's department
    // Assuming the main model has a relation or field for departmentId
    // Or we must join. This depends on the specific query structure.
    // For now, we inject departmentId if applicable, or expect the controller to use this properly.
    return {
      ...query,
      [departmentField]: user?.departmentId || "unassigned" // Fallback to an impossible string so Prisma doesn't ignore it
    };
  }

  if (scope === "personal") {
    // Only see own records
    return {
      ...query,
      [hostField]: user?.employeeId || user?.id || "unassigned"
    };
  }

  return query;
};

/**
 * Returns an array of allowed `toMeetWith` values (IDs and/or Names) based on user's scope.
 * If scope is global, returns null (meaning no restriction).
 */
export const getAllowedHostIds = async (user) => {
  const scope = user?.roleRef?.dataScope || "personal";

  if (scope === "global") {
    return null; // No filtering needed
  }

  if (scope === "departmental") {
    // Return all employees in the user's department
    if (!user?.departmentId) return []; // Fallback empty
    const employees = await prisma.employee.findMany({
      where: { departmentId: user.departmentId },
      select: { id: true, name: true }
    });
    // FormData.toMeetWith might store either ID or Name, and might be in lowercase
    return employees.flatMap(emp => [emp.id, emp.name, emp.name.toLowerCase(), emp.id.toLowerCase()]);
  }

  if (scope === "personal") {
    // Only see own records
    const empId = user?.employeeId || user?.id; // Depends on how User schema links to Employee
    // Try to find the actual employee record to get the name too
    const employee = await prisma.employee.findFirst({
      where: { email: user?.email }
    });
    if (employee) {
      return [employee.id, employee.name, employee.name.toLowerCase(), employee.id.toLowerCase()];
    }
    return [user.name, user.name.toLowerCase()]; // Fallback
  }

  return []; // Unknown scope, restrict entirely
};
