import type { SceneType } from '../types/session';
export interface DimensionConfig {
    key: string;
    label: string;
    emoji: string;
    maxScore: number;
    weight: number;
    description: string;
}
export interface SceneConfig {
    type: SceneType;
    label: string;
    description: string;
    dimensions: DimensionConfig[];
    hasChecklist: boolean;
    hasAgeStratification: boolean;
}
export declare const SCENE_CONFIGS: Record<SceneType, SceneConfig>;
/**
 * Chat scene 14-point checklist template
 */
export declare const CHAT_CHECKLIST_TEMPLATE: ({
    id: string;
    category: "persona";
    categoryLabel: string;
    description: string;
} | {
    id: string;
    category: "emotion";
    categoryLabel: string;
    description: string;
} | {
    id: string;
    category: "naturalness";
    categoryLabel: string;
    description: string;
} | {
    id: string;
    category: "profile";
    categoryLabel: string;
    description: string;
})[];
/**
 * Red line checks (apply to all scenes)
 */
export declare const RED_LINE_CHECKS: {
    id: string;
    description: string;
    threshold: number;
}[];
/**
 * Folder-to-scene mapping
 */
export declare const FOLDER_SCENE_MAP: Record<string, SceneType>;
//# sourceMappingURL=scenes.d.ts.map