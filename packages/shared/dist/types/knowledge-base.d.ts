/**
 * Knowledge Base (商品知识库) types
 */
export interface KnowledgeFile {
    id: number;
    name: string;
    format: string;
    quality: string;
    validUntil: string;
    source: string;
    sizeBytes: number | null;
    filePath: string | null;
    mimeType: string | null;
    content?: string | null;
    sortOrder: number;
    uploadedAt: string;
}
//# sourceMappingURL=knowledge-base.d.ts.map