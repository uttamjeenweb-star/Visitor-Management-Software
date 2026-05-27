import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getVisitingArea,
  createVisitingArea,
  updateVisitingArea,
  deleteVisitingArea,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const useVisitorArea = () => {
  const [visitorArea, setVisitorArea] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all Visitor_Areas
  const fetchVisitorArea = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getVisitingArea();
      // Ensure data fallback to an array if API payload wraps it uniquely
      setVisitorArea(Array.isArray(data) ? data : data.visitingAreas || []);
    } catch (err) {
      getApiError(err, "Failed to fetch Visitor_Areas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create Visitor_Area and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const newvisitingAreas = await createVisitingArea(payload);
      setVisitorArea((prev) => [newvisitingAreas, ...prev]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create Visitor_Area record.");
      return false;
    }
  };
  // Update Visitor_Area profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updatedRecord = await updateVisitingArea(id, payload);
      setVisitorArea((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, ...updatedRecord } : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update Visitor_Area details.");
      return false;
    }
  };
  // Delete Visitor_Area (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...visitorArea];
    // Remove from UI immediately for snappy user experience
    setVisitorArea((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteVisitingArea(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove Visitor_Area. Reverting table configuration.",
      );
      setVisitorArea(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVisitorArea();
  }, [fetchVisitorArea]);
  return {
    visitorArea,
    isLoading,
    error,
    refresh: visitorArea,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
