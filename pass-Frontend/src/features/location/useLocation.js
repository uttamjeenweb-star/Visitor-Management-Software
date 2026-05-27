import { useState, useEffect, useCallback } from "react";
import { getApiError } from "@/shared/services/ApiClient";
import {
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/master/apiCalling"; // Adjust path to match your API calling file location
export const useLocation = () => {
  const [location, setlocation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all locations
  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLocation();
      // Ensure data fallback to an array if API payload wraps it uniquely
      const items = Array.isArray(data) ? data : data?.location || [];
      setlocation(
        items.map((item) => ({ ...item, _id: item._id ?? item.id })),
      );
    } catch (err) {
      getApiError(err, "Failed to fetch locations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Create location and update local state instantly
  const handleCreate = async (payload) => {
    setError(null);
    try {
      const created = await createLocation(payload);
      const record = created?.location ?? created;
      setlocation((prev) => [
        { ...record, _id: record._id ?? record.id },
        ...prev,
      ]);
      return true;
    } catch (err) {
      getApiError(err, "Failed to create location record.");
      return false;
    }
  };
  // Update location profile
  const handleUpdate = async (id, payload) => {
    setError(null);
    try {
      const updated = await updateLocation(id, payload);
      const record = updated?.location ?? updated;
      setlocation((prev) =>
        prev.map((emp) =>
          emp._id === id
            ? { ...emp, ...record, _id: record._id ?? record.id ?? id }
            : emp,
        ),
      );
      return true;
    } catch (err) {
      getApiError(err, "Failed to update location details.");
      return false;
    }
  };
  // Delete location (Optimistic UI Update pattern)
  const handleDelete = async (id) => {
    setError(null);
    const originalList = [...location];
    // Remove from UI immediately for snappy user experience
    setlocation((prev) => prev.filter((emp) => emp._id !== id));
    try {
      await deleteLocation(id);
    } catch (err) {
      getApiError(
        err,
        "Failed to remove location. Reverting table configuration.",
      );
      setlocation(originalList); // Rollback on API failure
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLocation();
  }, [fetchLocation]);
  return {
    location,
    isLoading,
    error,
    refresh: fetchLocation,
    onCreate: handleCreate,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  };
};
