import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getCarryWith,
  createCarryWith,
  updateCarryWith,
  deleteCarryWith,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const useCarryWith = () => {
  const [carryWith, setCarryWith] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all CarryWiths
  const fetchCarryWith = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCarryWith();
      // Ensure data fallback to an array if API payload wraps it uniquely
      setCarryWith(Array.isArray(data) ? data : data.carryWithItems || []);
    } catch (err) {
      getApiError(err, "Failed to fetch CarryWiths. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create CarryWith and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const newcarryWithItems = await createCarryWith(payload);
      setCarryWith((prev) => [newcarryWithItems, ...prev]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create CarryWith record.");
      return false;
    }
  };
  // Update CarryWith profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updatedRecord = await updateCarryWith(id, payload);
      setCarryWith((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, ...updatedRecord } : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update CarryWith details.");
      return false;
    }
  };
  // Delete CarryWith (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...carryWith];
    // Remove from UI immediately for snappy user experience
    setCarryWith((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteCarryWith(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove CarryWith. Reverting table configuration.",
      );
      setCarryWith(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCarryWith();
  }, [fetchCarryWith]);
  return {
    carryWith,
    isLoading,
    error,
    refresh: fetchCarryWith,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
