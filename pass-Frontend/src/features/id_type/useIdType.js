import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getIdType,
  createIdType,
  updateIdType,
  deleteIdType,
} from "@/master/apiCalling"; // Adjust path to match your API calling file idType
export const useIdType = () => {
  const [idType, setidType] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all idTypes
  const fetchidType = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getIdType();
      // Ensure data fallback to an array if API payload wraps it uniquely
      const items = Array.isArray(data) ? data : data?.idType || [];
      setidType(
        items.map((item) => ({ ...item, _id: item._id ?? item.id })),
      );
    } catch (err) {
      getApiError(err, "Failed to fetch idTypes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create idType and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const created = await createIdType(payload);
      const record = created?.idType ?? created;
      setidType((prev) => [
        { ...record, _id: record._id ?? record.id },
        ...prev,
      ]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create idType record.");
      return false;
    }
  };
  // Update idType profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updated = await updateIdType(id, payload);
      const record = updated?.idType ?? updated;
      setidType((prev) =>
        prev.map((emp) =>
          emp._id === id
            ? { ...emp, ...record, _id: record._id ?? record.id ?? id }
            : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update idType details.");
      return false;
    }
  };
  // Delete idType (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...idType];
    // Remove from UI immediately for snappy user experience
    setidType((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteIdType(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove idType. Reverting table configuration.",
      );
      setidType(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchidType();
  }, [fetchidType]);
  return {
    idType,
    isLoading,
    error,
    refresh: fetchidType,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
