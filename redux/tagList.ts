export enum tagTypes {
  AUTH = "auth",
  JOBS = "jobs",
}

// Automatically derive the list from the enum
export const tagTypeList = Object.values(tagTypes);
