// src/app/requests/request.model.ts

/**
 * Raw object as it comes from backend API
 */
export interface RequestDto {
  id?: number;
  type?: string;
  status?: string;
  items?: any;

  // ✅ Make these available so TS stops complaining
  employeeId?: string;
  employeeCode?: string;

  Account?: {
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
