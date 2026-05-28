import appError_1 from "../../utils/appError.js";
import { prisma } from "../../config/db.js";
import * as bcrypt from "bcryptjs";

import { applyDataScope } from "../../utils/scope.js";

export const getEmployeeService = async (user) => {
  const baseQuery = { status: { not: "deleted" } };
  
  // Employees have 'departmentId' and their own 'id'
  // When 'personal' scope is applied, hostField="id" ensures they only see themselves
  const query = applyDataScope(user, baseQuery, "id");
  
  const employees = await prisma.employee.findMany({
    where: query,
    include: {
      departmentRef: true
    }
  });

  // Overwrite the legacy string with the actual referenced name so frontend displays it correctly
  return employees.map(emp => {
    if (emp.departmentRef?.name) {
      emp.department = emp.departmentRef.name;
    }
    // Remove the reference object to keep the response clean, optional but good practice
    delete emp.departmentRef;
    return emp;
  });
};

export const createEmployeeService = async (data) => {
  const { password, ...employeeData } = data;

  if (!password) {
    throw new appError_1("Password is required to create an employee user account", 400, "BAD_REQUEST");
  }

  // Fallback for legacy required string field
  if (!employeeData.department) {
    employeeData.department = "Managed via Department ID";
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate dynamic employeeId based on Department
  let deptNamePrefix = "EMP";
  if (employeeData.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: employeeData.departmentId } });
    if (dept && dept.name) {
      deptNamePrefix = dept.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    }
  } else if (employeeData.department) {
    deptNamePrefix = employeeData.department.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  }
  if (deptNamePrefix.length < 2) deptNamePrefix = "EMP";

  const prefixCount = await prisma.employee.count({
    where: { employeeId: { startsWith: deptNamePrefix } }
  });
  const nextNum = (prefixCount + 1).toString().padStart(3, '0');
  employeeData.employeeId = `${deptNamePrefix}${nextNum}`;

  // Use a transaction to ensure both Employee and User are created
  return await prisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({
      data: {
        ...employeeData,
        status: "active"
      }
    });

    // Check if user with same email exists
    if (employee.email) {
      const existingUser = await tx.user.findUnique({ where: { email: employee.email } });
      if (existingUser) {
        throw new appError_1("A user with this email already exists", 400, "CONFLICT");
      }

      await tx.user.create({
        data: {
          name: employee.name,
          email: employee.email,
          password: hashedPassword,
          systemPassword: password,
          roleId: employee.roleId,
          departmentId: employee.departmentId,
          assignedLocationId: employee.assignedLocationId,
          active: true,
        }
      });
    }

    return employee;
  });
};

export const updateEmployeeService = async (employeeId, data) => {
  const exist = await prisma.employee.findUnique({
    where: {
      id: employeeId
    }
  });
  if (!exist) throw new appError_1("Employee not found", 404, "NOT_FOUND");

  const { password, ...updateData } = data;

  if (updateData.departmentId && !updateData.department) {
    updateData.department = "Managed via Department ID";
  }

  // Regenerate employeeId ONLY if department changed
  if (updateData.departmentId && updateData.departmentId !== exist.departmentId) {
    let deptNamePrefix = "EMP";
    const dept = await prisma.department.findUnique({ where: { id: updateData.departmentId } });
    if (dept && dept.name) {
      deptNamePrefix = dept.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    }
    if (deptNamePrefix.length < 2) deptNamePrefix = "EMP";

    const prefixCount = await prisma.employee.count({
      where: { employeeId: { startsWith: deptNamePrefix } }
    });
    const nextNum = (prefixCount + 1).toString().padStart(3, '0');
    updateData.employeeId = `${deptNamePrefix}${nextNum}`;
  }

  const employee = await prisma.employee.update({
    where: {
      id: employeeId
    },
    data: updateData
  });

  // Attempt to sync the User model if an email exists
  if (employee.email) {
    const userUpdateData = {
      name: updateData.name,
      roleId: updateData.roleId,
      departmentId: updateData.departmentId,
      assignedLocationId: updateData.assignedLocationId
    };

    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
      userUpdateData.systemPassword = password;
    }

    await prisma.user.updateMany({
      where: { email: employee.email },
      data: userUpdateData
    });
  }

  return employee;
};

export const deleteEmployeeService = async (employeeId) => {
  const exist = await prisma.employee.findUnique({
    where: {
      id: employeeId
    }
  });
  if (!exist) throw new appError_1("Employee not found", 404, "NOT_FOUND");
  if (exist.status === "deleted") throw new appError_1("Employee is already deleted", 409, "CONFLICT");
  return await prisma.employee.delete({
    where: {
      id: employeeId
    }
  });
};
