import {
  queryGet,
  queryPost,
  queryPatch, // Using queryPatch as in RoleManagement (wait, does queryPatch exist? let's use queryPut if queryPatch doesn't, but let's check what's used in apiCalling.js. Actually api is imported directly in RoleManagement. Let's use api directly or query methods.)
  queryDelete
} from "@/shared/services/api";

const unwrapData = (res) => res.data?.data || res.data;

//----------------------Role & Permission API Calling---------------------------------------
export const getRoles = () => {
  return queryGet(
    "/roles",
    {},
    { cache: true, tags: ["roles"] }
  ).then(res => unwrapData(res).roles || unwrapData(res));
};

export const createRole = (payload) => {
  return queryPost(
    "/roles",
    payload,
    {},
    { invalidateTags: ["roles"] }
  ).then(unwrapData);
};

export const updateRole = (id, payload) => {
  // Using queryPatch or queryPut based on backend. The original used api.patch. We will use queryPatch if it exists, otherwise api.patch wrapper.
  // Wait, queryPatch is used in Dashboard. So it exists.
  return queryPatch(
    `/roles/${id}`,
    payload,
    {},
    { invalidateTags: ["roles"] }
  ).then(unwrapData);
};

export const deleteRole = (id) => {
  return queryDelete(
    `/roles/${id}`,
    {},
    { invalidateTags: ["roles"] }
  ).then(unwrapData);
};
