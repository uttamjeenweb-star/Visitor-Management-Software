import { queryGet } from "@/shared/services/api";

const unwrapData = (res) => res.data?.data || res.data;

//----------------------Report API Calling---------------------------------------
export const getReportData = (queryString = "") => {
  return queryGet(
    `/report${queryString}`,
    {},
    { cache: true, tags: ["report"] }
  ).then(unwrapData);
};
