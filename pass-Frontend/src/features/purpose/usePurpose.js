import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getPurpose,
  createpurpose,
  updatePurpose,
  deletePurpose,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const usePurpose = () => {
  const [purposes, setPurposes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all Purposess
  const fetchPurpose = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPurpose();
      // Ensure data fallback to an array if API payload wraps it uniquely
      setPurposes(Array.isArray(data) ? data : data.purposes || []);
    } catch (err) {
      getApiError(err, "Failed to fetch Purposess. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create Purposes and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const newpurposes = await createpurpose(payload);
      setPurposes((prev) => [newpurposes, ...prev]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create Purposes record.");
      return false;
    }
  };
  // Update Purposes profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updatedRecord = await updatePurpose(id, payload);
      setPurposes((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, ...updatedRecord } : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update Purposes details.");
      return false;
    }
  };
  // Delete Purposes (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...purposes];
    // Remove from UI immediately for snappy user experience
    setPurposes((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deletePurpose(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove Purposes. Reverting table configuration.",
      );
      setPurposes(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPurpose();
  }, [fetchPurpose]);
  return {
    purposes,
    isLoading,
    error,
    refresh: fetchPurpose,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
