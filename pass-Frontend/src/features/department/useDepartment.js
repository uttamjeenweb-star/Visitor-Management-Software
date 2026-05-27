import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const useDepartment = () => {
  const [department, setdepartment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all departments
  const fetchdepartment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDepartment();
      // Ensure data fallback to an array if API payload wraps it uniquely
      const items = Array.isArray(data) ? data : data?.department || [];
      setdepartment(
        items.map((item) => ({ ...item, _id: item._id ?? item.id })),
      );
    } catch (err) {
      const errMsg = getApiError(err, "Failed to fetch departments. Please try again.");
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create department and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const created = await createDepartment(payload);
      const record = created?.department ?? created;
      setdepartment((prev) => [
        { ...record, _id: record._id ?? record.id },
        ...prev,
      ]);
      return true;
    } catch (err) {
      const errMsg = getApiError(err, "Failed to create department record.");
      setError(errMsg);
      return false;
    }
  };
  // Update department profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updated = await updateDepartment(id, payload);
      const record = updated?.department ?? updated;
      setdepartment((prev) =>
        prev.map((emp) =>
          emp._id === id
            ? { ...emp, ...record, _id: record._id ?? record.id ?? id }
            : emp,
        ),
      );
      return true;
    } catch (err) {
      const errMsg = getApiError(err, "Failed to update department details.");
      setError(errMsg);
      return false;
    }
  };
  // Delete department (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...department];
    // Remove from UI immediately for snappy user experience
    setdepartment((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteDepartment(id);
    } catch (err) {
      const errMsg = getApiError(
        err,
        "Failed to remove department. Reverting table configuration.",
      );
      setError(errMsg);
      setdepartment(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchdepartment();
  }, [fetchdepartment]);
  return {
    department,
    isLoading,
    error,
    refresh: fetchdepartment,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
