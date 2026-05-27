import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEmployee();
      // Ensure data fallback to an array if API payload wraps it uniquely
      const items = Array.isArray(data) ? data : data?.employees || [];
      setEmployees(
        items.map((item) => ({ ...item, _id: item._id ?? item.id })),
      );
    } catch (err) {
      getApiError(err, "Failed to fetch employees. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create employee and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const created = await createEmployee(payload);
      const record = created?.employee ?? created;
      setEmployees((prev) => [
        { ...record, _id: record._id ?? record.id },
        ...prev,
      ]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create employee record.");
      return false;
    }
  };
  // Update employee profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updated = await updateEmployee(id, payload);
      const record = updated?.employee ?? updated;
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === id
            ? { ...emp, ...record, _id: record._id ?? record.id ?? id }
            : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update employee details.");
      return false;
    }
  };
  // Delete employee (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...employees];
    // Remove from UI immediately for snappy user experience
    setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteEmployee(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove employee. Reverting table configuration.",
      );
      setEmployees(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  }, [fetchEmployees]);
  return {
    employees,
    isLoading,
    error,
    refresh: fetchEmployees,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
