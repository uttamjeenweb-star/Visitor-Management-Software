import { catchAsync } from "../../utils/catchAsync.js";
import * as roleService from "./role.service.js";

export const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  
  res.status(201).json({
    status: "success",
    data: { role },
  });
});

export const getRoles = catchAsync(async (req, res) => {
  const roles = await roleService.getRoles();
  
  res.status(200).json({
    status: "success",
    results: roles.length,
    data: { roles },
  });
});

export const getRoleById = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  
  res.status(200).json({
    status: "success",
    data: { role },
  });
});

export const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  
  res.status(200).json({
    status: "success",
    data: { role },
  });
});

export const deleteRole = catchAsync(async (req, res) => {
  await roleService.deleteRole(req.params.id);
  
  res.status(204).json({
    status: "success",
    data: null,
  });
});
