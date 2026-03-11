import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Tool {
    id: string;
    name: string;
    slug: string;
    tier: string;
    description: string;
    iconName: string;
    category: string;
}
export interface backendInterface {
    getAllTools(): Promise<Array<Tool>>;
    getToolBySlug(slug: string): Promise<Tool>;
    getToolsByCategory(category: string): Promise<Array<Tool>>;
    getToolsByTier(tier: string): Promise<Array<Tool>>;
    getUsageStats(): Promise<Array<[string, bigint]>>;
}
