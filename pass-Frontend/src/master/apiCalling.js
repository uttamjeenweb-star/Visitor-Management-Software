import {
  queryGet,
  queryPost,
  queryPut,
  queryDelete,
} from "@/shared/services/api";
import { API_ENDPOINTS } from "@/shared/const/api";
const unwrapData = (res) => res.data?.data || res.data;
//----------------------Employee CRUD Calling---------------------------------------
export const getEmployee = () => {
  return queryGet(
    API_ENDPOINTS.EMPLOYEE,
    {},
    { cache: true, tags: ["employee"] },
  ).then((res) => unwrapData(res).employee || unwrapData(res));
};
export const createEmployee = (payload) => {
  return queryPost(
    API_ENDPOINTS.EMPLOYEE,
    payload,
    {},
    { invalidateTags: ["employee"] },
  ).then(unwrapData);
};
export const updateEmployee = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.EMPLOYEE}/${id}`,
    payload,
    {},
    { invalidateTags: ["employee", `employee/${id}`] },
  ).then(unwrapData);
};
export const deleteEmployee = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.EMPLOYEE}/${id}`,
    {},
    { invalidateTags: ["employee", `employee/${id}`] },
  ).then(unwrapData);
};
//-----------------------Purposse CRUD Calling-------------------------------------
export const getPurpose = () => {
  return queryGet(
    API_ENDPOINTS.PURPOSE,
    {},
    { cache: true, tags: ["purpose"] },
  ).then((res) => unwrapData(res).purpose || unwrapData(res));
};
export const createpurpose = (payload) => {
  return queryPost(
    API_ENDPOINTS.PURPOSE,
    payload,
    {},
    { invalidateTags: ["purpose"] },
  ).then(unwrapData);
};
export const updatePurpose = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.PURPOSE}/${id}`,
    payload,
    {},
    { invalidateTags: ["purpose", `purpose/${id}`] },
  ).then(unwrapData);
};
export const deletePurpose = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.PURPOSE}/${id}`,
    {},
    { invalidateTags: ["purpose", `purpose/${id}`] },
  ).then(unwrapData);
};
//----------------------Visiting Area CRUD Calling--------------------------------
export const getVisitingArea = () => {
  return queryGet(
    API_ENDPOINTS.VISITING_AREA,
    {},
    { cache: true, tags: ["area"] },
  ).then((res) => unwrapData(res).visitingAreas || unwrapData(res));
};
export const createVisitingArea = (payload) => {
  return queryPost(
    API_ENDPOINTS.VISITING_AREA,
    payload,
    {},
    { invalidateTags: ["area"] },
  ).then(unwrapData);
};
export const updateVisitingArea = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.VISITING_AREA}/${id}`,
    payload,
    {},
    { invalidateTags: ["area", `area/${id}`] },
  ).then(unwrapData);
};
export const deleteVisitingArea = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.VISITING_AREA}/${id}`,
    {},
    { invalidateTags: ["area", `area/${id}`] },
  ).then(unwrapData);
};
//-----------------Visitor Type CRUD Calling---------------------------------------
export const getVisitorType = () => {
  return queryGet(
    API_ENDPOINTS.VISITOR_TYPE,
    {},
    { cache: true, tags: ["visitorType"] },
  ).then((res) => unwrapData(res).visitorTypes || unwrapData(res));
};
export const createVisitorType = (payload) => {
  return queryPost(
    API_ENDPOINTS.VISITOR_TYPE,
    payload,
    {},
    { invalidateTags: ["visitorType"] },
  ).then(unwrapData);
};
export const updateVisitorType = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.VISITOR_TYPE}/${id}`,
    payload,
    {},
    { invalidateTags: ["visitorType", `visitorType/${id}`] },
  ).then(unwrapData);
};
export const deleteVisitorType = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.VISITOR_TYPE}/${id}`,
    {},
    { invalidateTags: ["visitorType", `visitorType/${id}`] },
  ).then(unwrapData);
};
//---------------------Carry With CRUD calling--------------------------------
export const getCarryWith = () => {
  return queryGet(
    API_ENDPOINTS.CARRY_WITH,
    {},
    { cache: true, tags: ["carryWith"] },
  ).then((res) => unwrapData(res).carryWithItems || unwrapData(res));
};
export const createCarryWith = (payload) => {
  return queryPost(
    API_ENDPOINTS.CARRY_WITH,
    payload,
    {},
    { invalidateTags: ["carryWith"] },
  ).then(unwrapData);
};
export const updateCarryWith = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.CARRY_WITH}/${id}`,
    payload,
    {},
    { invalidateTags: ["carryWith", `carryWith/${id}`] },
  ).then(unwrapData);
};
export const deleteCarryWith = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.CARRY_WITH}/${id}`,
    {},
    { invalidateTags: ["carryWith", `carryWith/${id}`] },
  ).then(unwrapData);
};

//----------------------Department CRUD Calling---------------------------------------
export const getDepartment = () => {
  return queryGet(
    API_ENDPOINTS.DEPARTMENT,
    {},
    { cache: true, tags: ["department"] },
  ).then((res) => unwrapData(res).department || unwrapData(res));
};
export const createDepartment = (payload) => {
  return queryPost(
    API_ENDPOINTS.DEPARTMENT,
    payload,
    {},
    { invalidateTags: ["department"] },
  ).then(unwrapData);
};
export const updateDepartment = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.DEPARTMENT}/${id}`,
    payload,
    {},
    { invalidateTags: ["department", `department/${id}`] },
  ).then(unwrapData);
};
export const deleteDepartment = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.DEPARTMENT}/${id}`,
    {},
    { invalidateTags: ["department", `department/${id}`] },
  ).then(unwrapData);
};
//----------------------Location CRUD Calling---------------------------------------
export const getLocation = () => {
  return queryGet(
    API_ENDPOINTS.LOCATION,
    {},
    { cache: true, tags: ["location"] },
  ).then((res) => unwrapData(res).location || unwrapData(res));
};
export const createLocation = (payload) => {
  return queryPost(
    API_ENDPOINTS.LOCATION,
    payload,
    {},
    { invalidateTags: ["location"] },
  ).then(unwrapData);
};
export const updateLocation = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.LOCATION}/${id}`,
    payload,
    {},
    { invalidateTags: ["location", `location/${id}`] },
  ).then(unwrapData);
};
export const deleteLocation = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.LOCATION}/${id}`,
    {},
    { invalidateTags: ["location", `location/${id}`] },
  ).then(unwrapData);
};

//----------------------ID Type CRUD Calling---------------------------------------
export const getIdType = () => {
  return queryGet(
    API_ENDPOINTS.ID_TYPE,
    {},
    { cache: true, tags: ["idType"] },
  ).then((res) => unwrapData(res).idType || unwrapData(res));
};
export const createIdType = (payload) => {
  return queryPost(
    API_ENDPOINTS.ID_TYPE,
    payload,
    {},
    { invalidateTags: ["idType"] },
  ).then(unwrapData);
};
export const updateIdType = (id, payload) => {
  return queryPut(
    `${API_ENDPOINTS.ID_TYPE}/${id}`,
    payload,
    {},
    { invalidateTags: ["idType", `idType/${id}`] },
  ).then(unwrapData);
};
export const deleteIdType = (id) => {
  return queryDelete(
    `${API_ENDPOINTS.ID_TYPE}/${id}`,
    {},
    { invalidateTags: ["idType", `idType/${id}`] },
  ).then(unwrapData);
};


//----------------------Company Register (singleton, update only)-------------------
export const getCompanyRegister = () => {
  return queryGet(
    API_ENDPOINTS.COMPANY_REGISTER,
    {},
    { cache: true, tags: ["companyRegister"] },
  ).then((res) => unwrapData(res).companyRegister ?? null);
};

export const updateCompanyRegister = (formData) => {
  return queryPut(API_ENDPOINTS.COMPANY_REGISTER, formData, {}, {
    invalidateTags: ["companyRegister"],
  }).then((res) => unwrapData(res).companyRegister ?? unwrapData(res));
};