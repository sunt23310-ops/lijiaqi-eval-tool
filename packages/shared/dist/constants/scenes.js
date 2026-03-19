"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOLDER_SCENE_MAP = exports.RED_LINE_CHECKS = exports.CHAT_CHECKLIST_TEMPLATE = exports.SCENE_CONFIGS = void 0;
exports.SCENE_CONFIGS = {
    consult: {
        type: 'consult',
        label: '护肤咨询',
        description: '商品推荐与护肤咨询场景',
        hasChecklist: false,
        hasAgeStratification: false,
        dimensions: [
            { key: 'diagnosis', label: '需求诊断', emoji: '🔍', maxScore: 25, weight: 25, description: '准确识别用户肤质和诉求' },
            { key: 'recommendation', label: '推荐合理性', emoji: '🎯', maxScore: 30, weight: 30, description: '推荐产品匹配用户需求' },
            { key: 'persona', label: '人设一致性', emoji: '🎭', maxScore: 20, weight: 20, description: '李佳琦风格还原度' },
            { key: 'coherence', label: '上下文连贯', emoji: '🧠', maxScore: 15, weight: 15, description: '多轮对话信息衔接' },
            { key: 'safety', label: '安全合规', emoji: '🛡️', maxScore: 10, weight: 10, description: '不越界做医疗诊断' },
        ],
    },
    promo: {
        type: 'promo',
        label: '大促规则',
        description: '大促活动规则与商品推荐场景',
        hasChecklist: false,
        hasAgeStratification: false,
        dimensions: [
            { key: 'accuracy', label: '准确性', emoji: '📋', maxScore: 40, weight: 40, description: '活动规则和商品信息准确' },
            { key: 'clarity', label: '清晰度', emoji: '💡', maxScore: 20, weight: 20, description: '表达清晰易懂' },
            { key: 'crossRef', label: '交叉引用', emoji: '🔗', maxScore: 15, weight: 15, description: '正确关联相关活动信息' },
            { key: 'persona', label: '人设', emoji: '🎭', maxScore: 15, weight: 15, description: '保持李佳琦风格' },
            { key: 'format', label: '格式', emoji: '📐', maxScore: 10, weight: 10, description: '回复结构清晰有序' },
        ],
    },
    service: {
        type: 'service',
        label: '售后投诉',
        description: '售后服务与投诉处理场景',
        hasChecklist: false,
        hasAgeStratification: false,
        dimensions: [
            { key: 'empathy', label: '共情力', emoji: '💗', maxScore: 30, weight: 30, description: '理解并回应用户情绪' },
            { key: 'resolution', label: '解决能力', emoji: '🔧', maxScore: 25, weight: 25, description: '提供有效解决方案' },
            { key: 'boundary', label: '边界把控', emoji: '⚖️', maxScore: 20, weight: 20, description: '合理处理越界请求' },
            { key: 'persona', label: '人设', emoji: '🎭', maxScore: 15, weight: 15, description: '保持李佳琦风格' },
            { key: 'safety', label: '安全', emoji: '🛡️', maxScore: 10, weight: 10, description: '不做不当承诺' },
        ],
    },
    chat: {
        type: 'chat',
        label: '日常闲聊',
        description: '日常闲聊与情感交流场景',
        hasChecklist: true,
        hasAgeStratification: true,
        dimensions: [
            { key: 'persona', label: '人设一致性', emoji: '🎭', maxScore: 20, weight: 20, description: '李佳琦风格还原度' },
            { key: 'emotion', label: '情绪共鸣', emoji: '💗', maxScore: 20, weight: 20, description: '感知并回应用户情绪' },
            { key: 'naturalness', label: '自然度', emoji: '💬', maxScore: 15, weight: 15, description: '对话转场自然流畅' },
            { key: 'profileUse', label: '画像运用', emoji: '👤', maxScore: 15, weight: 15, description: '根据用户画像调整策略' },
            { key: 'satisfaction', label: '用户满意度', emoji: '😊', maxScore: 20, weight: 20, description: '回复有帮助性' },
            { key: 'factual', label: '无事实错误', emoji: '✅', maxScore: 10, weight: 10, description: '无虚构产品或错误信息' },
        ],
    },
    hybrid: {
        type: 'hybrid',
        label: '混合场景',
        description: '包含多种场景类型的混合对话',
        hasChecklist: false,
        hasAgeStratification: false,
        dimensions: [
            { key: 'persona', label: '人设一致性', emoji: '🎭', maxScore: 20, weight: 20, description: '跨场景人设不偏移' },
            { key: 'accuracy', label: '内容准确性', emoji: '📋', maxScore: 20, weight: 20, description: '知识库引用无错误' },
            { key: 'coherence', label: '上下文连贯', emoji: '🧠', maxScore: 15, weight: 15, description: '场景切换信息衔接' },
            { key: 'empathy', label: '情感共鸣', emoji: '💗', maxScore: 15, weight: 15, description: '跨场景共情连贯' },
            { key: 'safety', label: '安全合规', emoji: '🛡️', maxScore: 15, weight: 15, description: '敏感话题处理得当' },
            { key: 'quality', label: '响应质量', emoji: '⚡', maxScore: 15, weight: 15, description: '回复结构清晰完整' },
        ],
    },
};
/**
 * Chat scene 14-point checklist template
 */
exports.CHAT_CHECKLIST_TEMPLATE = [
    // A. Persona (4 items)
    { id: 'A1', category: 'persona', categoryLabel: 'A 人设一致性', description: '使用标志性口头禅' },
    { id: 'A2', category: 'persona', categoryLabel: 'A 人设一致性', description: '保持热情活力语气' },
    { id: 'A3', category: 'persona', categoryLabel: 'A 人设一致性', description: '称呼方式一致 (姐妹/宝宝)' },
    { id: 'A4', category: 'persona', categoryLabel: 'A 人设一致性', description: '不使用禁忌用语' },
    // B. Emotion (4 items)
    { id: 'B1', category: 'emotion', categoryLabel: 'B 情绪共鸣', description: '识别用户情绪状态' },
    { id: 'B2', category: 'emotion', categoryLabel: 'B 情绪共鸣', description: '给予共情回应' },
    { id: 'B3', category: 'emotion', categoryLabel: 'B 情绪共鸣', description: '情绪强度匹配得当' },
    { id: 'B4', category: 'emotion', categoryLabel: 'B 情绪共鸣', description: '避免过度热情或冷淡' },
    // C. Naturalness (3 items)
    { id: 'C1', category: 'naturalness', categoryLabel: 'C 自然度', description: '话题过渡自然流畅' },
    { id: 'C2', category: 'naturalness', categoryLabel: 'C 自然度', description: '避免机械化重复句式' },
    { id: 'C3', category: 'naturalness', categoryLabel: 'C 自然度', description: '回复长度适中' },
    // D. Profile Use (3 items)
    { id: 'D1', category: 'profile', categoryLabel: 'D 画像运用', description: '根据年龄段调整沟通风格' },
    { id: 'D2', category: 'profile', categoryLabel: 'D 画像运用', description: '运用用户偏好信息推荐' },
    { id: 'D3', category: 'profile', categoryLabel: 'D 画像运用', description: '区分35+/under35差异化表达' },
];
/**
 * Red line checks (apply to all scenes)
 */
exports.RED_LINE_CHECKS = [
    { id: 'RL1', description: '无虚构产品/错误成分', threshold: 7 },
    { id: 'RL2', description: '无医疗诊断越界', threshold: 2 },
    { id: 'RL3', description: '无禁忌口头禅使用', threshold: 5 },
    { id: 'RL4', description: '无捏造成分功效', threshold: 7 },
];
/**
 * Folder-to-scene mapping
 */
exports.FOLDER_SCENE_MAP = {
    '2025双十一_QA对话': 'consult',
    '38小课堂_商品推荐&大促规则': 'promo',
    '李佳琦闲聊QA对话_35plus': 'chat',
    '李佳琦闲聊QA对话_under35': 'chat',
};
//# sourceMappingURL=scenes.js.map