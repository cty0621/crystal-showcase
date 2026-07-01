// Crystal Weave — TypeScript type definitions

/** A crystal category in the master list sidebar */
export interface CrystalCategory {
  name: string;
  img: string; // e.g., "prod_052.webp"
  active?: boolean;
}

/** A bead variant (specific size/price combination) */
export interface BeadVariant {
  name: string;
  size: string; // e.g., "6mm", "8×10mm"
  price: string; // e.g., "¥3"
  img: string;
  unavailable?: boolean;
}

/** A bead currently placed on the bracelet */
export interface BraceletBead {
  id: string;
  name: string;
  size: string;
  price: string;
  img: string;
  position: number; // angle in radians on the bracelet circle
}

/** Wrist size category */
export type WristSizeCategory = "偏小" | "合适" | "偏大";

/** Info badge data */
export interface InfoBadge {
  type: "wrist" | "price";
  icon: string;
  label: string;
  value: string;
}

/** Design data for gallery/sharing */
export interface Design {
  id: string;
  name: string;
  designer: string;
  price: number;
  beads: BraceletBead[];
  crystalTypes: number;
  beadCount: number;
  createdAt: string;
}

/** Gallery page state */
export interface GalleryState {
  designs: Design[];
  currentPage: number;
  totalPages: number;
  loading: boolean;
}

/** Modal visibility state */
export type ModalType =
  | "preview"
  | "instructions"
  | "finish"
  | "share"
  | "order"
  | "designDetail"
  | null;

/** App view state */
export type AppView = "main" | "gallery" | "designDetail";

/** Size limit toast state */
export interface ToastState {
  visible: boolean;
  message: string;
}
