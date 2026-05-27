import { useState, useEffect, useMemo } from "react";
import DynamicDataPage from "@/master/Dynamic";
import { useDepartment } from "@/features/department/useDepartment";
import { useEmployees } from "@/features/employee/useEmployee";
import api from "@/shared/services/api";

export const DepartmentPage = () => {
  const { department, isLoading, error, onCreate, onUpdate, onDelete } = useDepartment();
  const { employees, isLoading: employeesLoading } = useEmployees();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get("/roles").then((res) => {
      setRoles(res.data.data.roles);
    }).catch(console.error);
  }, []);

  const employeeOptions = useMemo(() => {
    return employees.map((emp) => {
      const role = roles.find((r) => r.id === emp.roleId)?.name || "No Role";
      return { 
        value: emp.id || emp._id, 
        label: `${emp.name} (${emp.employeeId}) - ${role}` 
      };
    });
  }, [employees, roles]);

  return (
    <DynamicDataPage
      title="Department"
      subtitle="Manage departments and assign managers for smart routing"
      data={department.map(d => ({
        ...d,
        managerName: employees.find(e => (e.id || e._id) === d.managerEmployeeId)?.name || "—"
      }))}
      idKey="_id"
      columns={[
        { key: "name", label: "Department Name", sortable: true },
        { key: "managerName", label: "Department Manager", sortable: true },
        { key: "status", label: "Status", type: "status" },
      ]}
      isLoading={isLoading || employeesLoading}
      error={error}
      onCreate={onCreate}
      onEdit={onUpdate}
      onDelete={onDelete}
      formFields={[
        {
          key: "name",
          label: "Department Name",
          required: true,
          placeholder: "Department",
        },
        {
          key: "managerEmployeeId",
          label: "Department Manager",
          type: "searchable-select",
          options: employeeOptions,
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["active", "blocked", "deleted"],
          defaultValue: "active",
        },
      ]}
    />
  );
};
