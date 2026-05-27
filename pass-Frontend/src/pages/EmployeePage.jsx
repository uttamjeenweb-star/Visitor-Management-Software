import { useState, useEffect, useMemo } from "react";
import DynamicDataPage from "@/master/Dynamic";
import { useEmployees } from "@/features/employee/useEmployee";
import { useDepartment } from "@/features/department/useDepartment";
import { useLocation } from "@/features/location/useLocation";
import api from "@/shared/services/api";

export const EmployeePage = () => {
  const { employees, isLoading, error, onCreate, onUpdate, onDelete } = useEmployees();
  const { department: departments, isLoading: departmentsLoading } = useDepartment();
  const { location: locations, isLoading: locationsLoading } = useLocation();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get("/roles").then((res) => {
      setRoles(res.data.data.roles);
    }).catch(console.error);
  }, []);

  const departmentOptions = useMemo(() => {
    return departments
      .filter((d) => d.status === "active" || !d.status)
      .map((d) => ({ value: d.id || d._id, label: d.name }));
  }, [departments]);

  const locationOptions = useMemo(() => {
    return locations
      .filter((l) => l.status === "active" || !l.status)
      .map((l) => ({ value: l.id || l._id, label: l.name }));
  }, [locations]);

  const roleOptions = useMemo(() => {
    return roles.map((r) => ({ value: r.id, label: r.name }));
  }, [roles]);

  const formFields = useMemo(
    () => [
      { key: "name", label: "Full Name", required: true, placeholder: "Jane Doe" },
      { key: "email", label: "Email", type: "email", placeholder: "jane@company.com" },
      { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 000 0000" },
      { key: "password", label: "Account Password", type: "password", required: true, placeholder: "Secure password for login" },
      { key: "designation", label: "Designation", placeholder: "Senior Engineer" },
      {
        key: "departmentId",
        label: "Department",
        type: "select",
        required: true,
        options: departmentOptions,
      },
      {
        key: "roleId",
        label: "Role",
        type: "select",
        required: true,
        options: roleOptions,
      },
      {
        key: "assignedLocationId",
        label: "Location",
        type: "select",
        options: locationOptions,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["active", "blocked", "deleted"],
        defaultValue: "active",
      },
    ],
    [departmentOptions, roleOptions, locationOptions],
  );

  return (
    <DynamicDataPage
      title="Employees"
      subtitle="Manage corporate profiles, roles, and authorization vectors."
      data={employees.map(e => ({
        ...e,
        departmentName: departments.find(d => (d.id || d._id) === e.departmentId)?.name || e.department,
        roleName: roles.find(r => r.id === e.roleId)?.name || "—",
        locationName: locations.find(l => (l.id || l._id) === e.assignedLocationId)?.name || "—",
      }))}
      idKey="_id"
      columns={[
        { key: "employeeId", label: "ID / Code", type: "mono", sortable: true },
        { key: "name", label: "Full Name", sortable: true },
        { key: "departmentName", label: "Department", sortable: true },
        { key: "roleName", label: "Role", sortable: true },
        { key: "locationName", label: "Location", sortable: true },
        { key: "email", label: "Email", type: "email" },
        { key: "status", label: "Status", type: "status" },
      ]}
      isLoading={isLoading || departmentsLoading || locationsLoading}
      error={error}
      onCreate={onCreate}
      onEdit={onUpdate}
      onDelete={onDelete}
      formFields={formFields}
    />
  );
};
