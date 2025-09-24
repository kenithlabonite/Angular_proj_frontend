// src/app/requests/request.model.ts

/**
 * Raw object as it comes from backend API
 */
export interface RequestDto {
  id?: number;
  type?: string;
  status?: string;
  items?: any;

  // legacy / optional mappings
  employeeId?: string;
  employeeCode?: string;

  Account?: {
    id?: number;            // 👈 add this (backend sends it)
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

/**
 * Normalized object for frontend display
 */
export interface RequestView {
  id?: number;
  type?: string;
  status?: string;

  employeeId?: string;
  employeeDisplay: string;
  itemsDisplay: Array<{ name?: string; quantity?: number }>;
}
