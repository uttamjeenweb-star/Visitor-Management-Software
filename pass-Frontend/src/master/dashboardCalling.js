import { queryGet, queryPatch } from "@/shared/services/api";

const unwrapData = (res) => res.data?.data || res.data;

//----------------------Dashboard API Calling---------------------------------------
export const getDashboardData = () => {
  return queryGet(
    "/capture/dashboard/data",
    {},
    { cache: true, tags: ["dashboard"] }
  ).then(unwrapData);
};

export const updatePassStatus = (passId, newStatus, additionalData = {}) => {
  return queryPatch(
    `/capture/${passId}/status`,
    { status: newStatus, ...additionalData },
    {},
    { invalidateTags: ["dashboard", `pass/${passId}`] }
  ).then(unwrapData);
};
