import type { SceneType } from './session';
/**
 * QA Database types
 */
export interface QAFolder {
    id: number;
    name: string;
    sceneType: SceneType;
    fileCount: number;
    sortOrder: number;
    createdAt: string;
}
export interface QAFile {
    id: number;
    folderId: number;
    name: string;
    format: string;
    sizeBytes: number;
    qaCount: number;
    metadata?: QAFileMetadata;
    uploadedAt: string;
}
export interface QAFileMetadata {
    sourceDoc?: string;
    category?: string;
    userProfile?: string;
    primaryNeed?: string;
    rounds?: number;
}
export interface QAEntry {
    id: number;
    fileId: number;
    question: string;
    answer: string;
    category?: string;
    tags?: string[];
}
//# sourceMappingURL=qa-database.d.ts.map