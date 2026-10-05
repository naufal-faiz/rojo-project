import { StatusTemanK3 } from "@/lib/generated/prisma/enums";

/** Peta label status TemanK3 untuk tampilan UI */
export const statusTemanK3Labels: Record<StatusTemanK3, string> = {
  [StatusTemanK3.SUDAH_UPLOAD]: "Sudah Upload",
  [StatusTemanK3.FU_LPS]: "FU LPS",
  [StatusTemanK3.CANCEL]: "Cancel",
};

export type BadgeColorName =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

/** Peta warna Badge untuk tiap status TemanK3 */
export const statusTemanK3Colors: Record<StatusTemanK3, BadgeColorName> = {
  [StatusTemanK3.SUDAH_UPLOAD]: "success",
  [StatusTemanK3.FU_LPS]: "info",
  [StatusTemanK3.CANCEL]: "error",
};
