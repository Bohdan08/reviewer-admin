/* Shared values */

export const CLIENTS_API = "/admin/clients";
export const PATIENTS_API = "/admin/logs";

export const API_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
  SUCCESS: "success",
};

export const CLINIC_NAME_BY_UNAME = {
  accuro: "Wilderman Medical Clinic",
  cosmetic: "Wilderman Cosmetic Clinic",
};

export const NAV_ITEMS = [
  {
    key: "uploadForm",
    name: "Upload a File",
    link: "/",
  },
  {
    key: "customerTable",
    name: "Clients",
    link: "/clients",
  },
  {
    key: "testPatient",
    name: "Test a Patient",
    link: "/test-patient",
  },
];
