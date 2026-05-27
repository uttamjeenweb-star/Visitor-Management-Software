import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getVisitorType,
  createVisitorType,
  updateVisitorType,
  deleteVisitorType,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const useVisitorType = () => {
  const [visitorType, setVisitortype] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all Visitor_Types
  const fetchVisitorType = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVisitorType();
      // Ensure data fallback to an array if API payload wraps it uniquely
      setVisitortype(Array.isArray(data) ? data : data.visitorTypes || []);
    } catch (err) {
      getApiError(err, "Failed to fetch Visitor_Types. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create Visitor_Type and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const newvisitorTypes = await createVisitorType(payload);
      setVisitortype((prev) => [newvisitorTypes, ...prev]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create Visitor_Type record.");
      return false;
    }
  };
  // Update Visitor_Type profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updatedRecord = await updateVisitorType(id, payload);
      setVisitortype((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, ...updatedRecord } : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update Visitor_Type details.");
      return false;
    }
  };
  // Delete Visitor_Type (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...visitorType];
    // Remove from UI immediately for snappy user experience
    setVisitortype((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteVisitorType(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove Visitor_Type. Reverting table configuration.",
      );
      setVisitortype(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVisitorType();
  }, [fetchVisitorType]);
  return {
    visitorType,
    isLoading,
    error,
    refresh: fetchVisitorType,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
