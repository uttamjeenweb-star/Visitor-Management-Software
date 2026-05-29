import { queryGet } from "@/shared/services/api";

const unwrapData = (res) => res.data?.data || res.data;

//----------------------Print / Pass Query Calling---------------------------------------
export const getPassById = (id) => {
  return queryGet(
    `/capture/${id}`,
    {},
    { cache: true, tags: ["print"] }
  ).then(unwrapData);
};
