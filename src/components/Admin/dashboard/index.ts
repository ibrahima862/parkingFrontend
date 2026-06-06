export {  } from "./TapBar";
export {  Topbar } from "./TopBar";
export { CountBadge } from "./CountBadge";
export { T } from "./SetCard";
export { PageBanner } from "./PageBanner";
export { DataPanel } from "./DataPanel";
export { StatsView } from "./StatView";
export type TabId = "stats" | "proprios" | "parkings" | "paiements";
export interface Tab { id: TabId; label: string; Icon: React.ElementType; badge?: number }
