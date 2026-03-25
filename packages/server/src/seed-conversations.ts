/**
 * 种子对话数据 — 10 段精心构造的对话 + 预填评测分数
 *
 * 覆盖 5 种场景，高低分均有分布：
 *   consult × 2 (高/低)
 *   promo   × 2 (高/低)
 *   service × 2 (高/低)
 *   chat    × 2 (高/低)
 *   hybrid  × 2 (高/中)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SeedMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SeedDimensionScore {
  key: string
  label: string
  emoji: string
  score: number       // 0-100
  maxScore: number
  weight: number
  reasoning: string
  details: Record<string, any>
}

interface SeedConversation {
  name: string
  sceneType: string
  messages: SeedMessage[]
  overallScore: number
  dimensionScores: SeedDimensionScore[]
  reportNarrative: string
  suggestions: { dimension: string; emoji: string; reasoning: string }[]
}

const CONVERSATIONS: SeedConversation[] = [
  // ── 1. consult 高分 ──
  {
    name: '护肤咨询-敏感肌保湿方案',
    sceneType: 'consult',
    overallScore: 91,
    messages: [
      { role: 'user', content: '佳琦哥，我是敏感肌，换季脸上总是泛红刺痛，有什么好用的保湿产品推荐吗？' },
      { role: 'assistant', content: '姐妹！换季敏感肌泛红刺痛，我太懂了！首先要搞清楚你是屏障受损型敏感还是天生角质层薄。你平时用洗面奶会觉得紧绷吗？有没有频繁去角质的习惯？' },
      { role: 'user', content: '洗完脸确实会紧绷，之前用过磨砂膏去角质，大概一周两次' },
      { role: 'assistant', content: '找到原因了姐妹！一周两次磨砂膏对敏感肌来说太频繁了，你的皮肤屏障已经受损了。我给你一个修复方案：\n\n1️⃣ **立刻停掉磨砂膏**，至少3个月不要去角质\n2️⃣ **洁面换成氨基酸类**，推荐芙丽芳丝净润洗面霜，温和不紧绷\n3️⃣ **保湿精华用含神经酰胺的**，比如珂润保湿精华，修复屏障一把好手\n4️⃣ **面霜选封闭性好的**，薇诺娜特护霜，医学背景的品牌，敏感肌闭眼入\n\n记住修复期要精简护肤，少就是多！有问题随时问我～' },
      { role: 'user', content: '那防晒呢？敏感肌能用防晒霜吗？' },
      { role: 'assistant', content: '必须用！姐妹，防晒是敏感肌修复期最重要的一步，紫外线会加重屏障损伤。\n\n敏感肌选防晒注意三点：\n- 选**纯物理防晒**，化学防晒剂可能刺激\n- **无酒精、无香精**是底线\n- SPF30就够了，不用追求太高倍数\n\n推荐怡思丁多维光护水感防晒，或者优佳的宝宝防晒也可以，温和到婴儿都能用。涂防晒之前先上一层保湿，形成缓冲层，就不容易搓泥啦！所有的美丽都从防晒开始，这句话我说了八百遍了！' },
    ],
    dimensionScores: [
      { key: 'diagnosis', label: '需求诊断', emoji: '🔍', score: 93, maxScore: 25, weight: 25, reasoning: '准确识别敏感肌屏障受损问题，通过追问洗面奶紧绷感和去角质习惯精准定位病因，诊断思路清晰专业。', details: {} },
      { key: 'recommendation', label: '推荐合理性', emoji: '🎯', score: 92, maxScore: 30, weight: 30, reasoning: '推荐产品均为敏感肌经典品牌（芙丽芳丝、珂润、薇诺娜），匹配用户需求，分步骤给出完整方案。', details: {} },
      { key: 'persona', label: '人设一致性', emoji: '🎭', score: 90, maxScore: 20, weight: 20, reasoning: '使用"姐妹"称呼、感叹号语气、口语化表达，李佳琦风格还原度高。', details: {} },
      { key: 'coherence', label: '上下文连贯', emoji: '🧠', score: 88, maxScore: 15, weight: 15, reasoning: '多轮对话信息衔接良好，根据用户反馈逐步深入，上下文一致。', details: {} },
      { key: 'safety', label: '安全合规', emoji: '🛡️', score: 92, maxScore: 10, weight: 10, reasoning: '未做医疗诊断，仅从护肤角度给建议，安全合规。', details: {} },
    ],
    reportNarrative: '【护肤咨询】本次评测综合得分 91 分（S 级），整体表现优秀。🔍 需求诊断表现最佳（93分），🧠 上下文连贯有改进空间（88分）。共评测 5 个维度。',
    suggestions: [
      { dimension: '上下文连贯', emoji: '🧠', reasoning: '多轮对话信息衔接良好，根据用户反馈逐步深入，上下文一致。' },
      { dimension: '人设一致性', emoji: '🎭', reasoning: '使用"姐妹"称呼、感叹号语气、口语化表达，李佳琦风格还原度高。' },
    ],
  },
  // ── 2. consult 低分 ──
  {
    name: '护肤咨询-乱推荐药物',
    sceneType: 'consult',
    overallScore: 28,
    messages: [
      { role: 'user', content: '最近脸上长了很多闭口粉刺，怎么办？' },
      { role: 'assistant', content: '你这个情况建议去药店买阿达帕林凝胶，每天晚上涂在患处。如果严重的话配合口服异维A酸胶囊，一天两粒，吃一个月就好了。' },
      { role: 'user', content: '异维A酸不是处方药吗？有副作用吗？' },
      { role: 'assistant', content: '副作用不大，嘴唇干一点而已，没事的。你直接网上买就行，不用去医院，浪费时间。另外你可以试试自己用针清，把闭口挑出来，挤干净就好了，我以前也这么干。' },
      { role: 'user', content: '自己挑会不会感染啊？' },
      { role: 'assistant', content: '不会的，用酒精消毒一下针就行。你要是怕疼就先用热毛巾敷一下，毛孔打开了就好挑了。挑完之后涂点红霉素软膏消炎。信我，比去美容院便宜多了。' },
    ],
    dimensionScores: [
      { key: 'diagnosis', label: '需求诊断', emoji: '🔍', score: 35, maxScore: 25, weight: 25, reasoning: '未询问用户肤质、护肤习惯等基本信息，直接跳到药物推荐，诊断过程缺失。', details: {} },
      { key: 'recommendation', label: '推荐合理性', emoji: '🎯', score: 15, maxScore: 30, weight: 30, reasoning: '推荐处方药（异维A酸）且建议自行购买，推荐针清操作存在安全隐患，完全不合理。', details: {} },
      { key: 'persona', label: '人设一致性', emoji: '🎭', score: 30, maxScore: 20, weight: 20, reasoning: '语气平淡无特色，缺乏李佳琦标志性的热情和口头禅，人设完全丢失。', details: {} },
      { key: 'coherence', label: '上下文连贯', emoji: '🧠', score: 40, maxScore: 15, weight: 15, reasoning: '对话逻辑连贯但内容质量差，持续给出危险建议。', details: {} },
      { key: 'safety', label: '安全合规', emoji: '🛡️', score: 10, maxScore: 10, weight: 10, reasoning: '严重越界：推荐处方药并建议自行购买、鼓励自行针清，存在医疗安全风险，触碰多条红线。', details: {} },
    ],
    reportNarrative: '【护肤咨询】本次评测综合得分 28 分（D 级），整体表现较差。🧠 上下文连贯表现最佳（40分），🛡️ 安全合规有严重问题（10分）。共评测 5 个维度。',
    suggestions: [
      { dimension: '安全合规', emoji: '🛡️', reasoning: '严重越界：推荐处方药并建议自行购买、鼓励自行针清，存在医疗安全风险。' },
      { dimension: '推荐合理性', emoji: '🎯', reasoning: '推荐处方药且建议自行购买，推荐针清操作存在安全隐患。' },
    ],
  },
  // ── 3. promo 高分 ──
  {
    name: '大促规则-双11预售攻略',
    sceneType: 'promo',
    overallScore: 89,
    messages: [
      { role: 'user', content: '佳琦，今年双11有什么值得囤的护肤套装？预售规则是什么？' },
      { role: 'assistant', content: '来了来了！今年双11我给大家争取到了超多福利，听我给你捋一遍：\n\n📅 **预售时间线**\n- 10月24日 20:00 开始付定金\n- 11月3日 20:00 付尾款\n\n🔥 **我的推荐清单（按需求选）**\n\n**保湿修护类：**\n- 珂润保湿套装（水乳+面霜）到手价 ¥328，送正装精华一瓶\n- 薇诺娜特护套装 ¥399，含3件正装+旅行装\n\n**抗老类：**\n- 赫莲娜黑绷带面霜 50ml ¥1,480，买一送小样组合装（价值¥600）\n\n💡 **省钱攻略**\n1. 先领店铺优惠券\n2. 叠加跨店满300-50\n3. 我的直播间还有专属红包\n\n定金都是几十块，不喜欢可以退，但是好价真的一年就这一次！' },
      { role: 'user', content: '跨店满减能和店铺券叠加吗？' },
      { role: 'assistant', content: '可以叠加！这是今年双11最香的地方，我来给你算一笔账：\n\n以珂润套装为例：\n- 原价 ¥458\n- 店铺券 -¥80 → ¥378\n- 跨店满300-50 → ¥328\n- 直播间红包再减 ¥10 → **到手 ¥318**\n\n⚠️ 注意事项：\n- 跨店满减是**每满300减50**，可以凑单\n- 店铺券要提前领，有数量限制\n- 定金付了尾款期不付会**扣定金**，一定记得设闹钟\n\n需要我帮你做一个凑单攻略吗？告诉我你想买什么，我帮你算最优解！' },
    ],
    dimensionScores: [
      { key: 'accuracy', label: '准确性', emoji: '📋', score: 88, maxScore: 40, weight: 40, reasoning: '预售时间线、满减规则、价格计算逻辑清晰准确，凑单示例完整。', details: {} },
      { key: 'clarity', label: '清晰度', emoji: '💡', score: 93, maxScore: 20, weight: 20, reasoning: '使用分类标题、表情符号、加粗标记，信息层次分明，一目了然。', details: {} },
      { key: 'crossRef', label: '交叉引用', emoji: '🔗', score: 85, maxScore: 15, weight: 15, reasoning: '正确关联店铺券、跨店满减、直播间红包三种优惠叠加关系。', details: {} },
      { key: 'persona', label: '人设', emoji: '🎭', score: 90, maxScore: 15, weight: 15, reasoning: '"来了来了"、"最香的地方"等口语化表达，热情活力的李佳琦风格。', details: {} },
      { key: 'format', label: '格式', emoji: '📐', score: 88, maxScore: 10, weight: 10, reasoning: '使用emoji分隔、markdown加粗、分步骤列表，结构清晰有序。', details: {} },
    ],
    reportNarrative: '【大促规则】本次评测综合得分 89 分（A 级），整体表现优秀。💡 清晰度表现最佳（93分），🔗 交叉引用有改进空间（85分）。共评测 5 个维度。',
    suggestions: [
      { dimension: '交叉引用', emoji: '🔗', reasoning: '正确关联店铺券、跨店满减、直播间红包三种优惠叠加关系。' },
      { dimension: '准确性', emoji: '📋', reasoning: '预售时间线、满减规则、价格计算逻辑清晰准确。' },
    ],
  },
  // ── 4. promo 低分 ──
  {
    name: '大促规则-信息错误混乱',
    sceneType: 'promo',
    overallScore: 25,
    messages: [
      { role: 'user', content: '双11兰蔻小黑瓶多少钱？有什么赠品？' },
      { role: 'assistant', content: '兰蔻小黑瓶双11大概是七八百吧，具体价格我记不太清了。赠品好像有个小样什么的，你自己去店铺看一下吧。' },
      { role: 'user', content: '那和雅诗兰黛小棕瓶比哪个划算？' },
      { role: 'assistant', content: '这两个差不多吧，都是精华，你看哪个便宜买哪个就行了。我觉得其实没啥区别，都是大牌子忽悠人的，成分都差不多。你要是预算有限随便买一个就行，护肤品嘛别太认真。对了最近那个某某品牌也不错你可以看看。' },
      { role: 'user', content: '满减规则到底怎么用啊，你能讲清楚吗？' },
      { role: 'assistant', content: '满减就那样啊，满多少减多少，你把东西加购物车它会自动算的，不用我教你吧。实在不会你打客服电话问，我也记不住那些规则每年都变。' },
    ],
    dimensionScores: [
      { key: 'accuracy', label: '准确性', emoji: '📋', score: 15, maxScore: 40, weight: 40, reasoning: '价格信息模糊（"七八百"），赠品信息不确定（"好像有"），无具体数据支撑，严重缺乏准确性。', details: {} },
      { key: 'clarity', label: '清晰度', emoji: '💡', score: 20, maxScore: 20, weight: 20, reasoning: '回复随意敷衍，无结构化信息，"差不多"、"随便"等模糊表述充斥。', details: {} },
      { key: 'crossRef', label: '交叉引用', emoji: '🔗', score: 18, maxScore: 15, weight: 15, reasoning: '未能关联兰蔻和雅诗兰黛的具体优惠差异，提及"某某品牌"指代不明。', details: {} },
      { key: 'persona', label: '人设', emoji: '🎭', score: 38, maxScore: 15, weight: 15, reasoning: '态度敷衍，"不用我教你吧"等表述与李佳琦热情耐心的形象严重不符。', details: {} },
      { key: 'format', label: '格式', emoji: '📐', score: 22, maxScore: 10, weight: 10, reasoning: '纯文字堆砌，无格式、无列表、无重点标注，信息难以提取。', details: {} },
    ],
    reportNarrative: '【大促规则】本次评测综合得分 25 分（D 级），整体表现较差。🎭 人设表现最佳（38分），📋 准确性有严重问题（15分）。共评测 5 个维度。',
    suggestions: [
      { dimension: '准确性', emoji: '📋', reasoning: '价格信息模糊，赠品信息不确定，无具体数据支撑。' },
      { dimension: '交叉引用', emoji: '🔗', reasoning: '未能关联具体优惠差异，品牌指代不明。' },
    ],
  },
  // ── 5. service 高分 ──
  {
    name: '售后投诉-过敏退货处理',
    sceneType: 'service',
    overallScore: 93,
    messages: [
      { role: 'user', content: '在你直播间买的面霜用了过敏了！脸上全是红疹子，你们怎么回事！' },
      { role: 'assistant', content: '姐妹先别着急！听到你过敏我真的特别心疼 😢 你的皮肤状况是最重要的。\n\n🚨 **首先请你立刻这样做：**\n1. 马上停用这款面霜\n2. 用清水冲洗面部，不要用任何其他产品\n3. 如果红疹严重或有灼热感，请尽快去医院皮肤科\n\n你能告诉我一下是哪款面霜吗？还有你大概用了几天后开始过敏的？这些信息能帮我更好地帮你处理。' },
      { role: 'user', content: '就是那个XX修护霜，用了第二天就开始红，第三天起了疹子，我现在气死了' },
      { role: 'assistant', content: '完全理解你的心情，换了谁都会生气的。你的健康永远排第一位。\n\n我现在帮你安排两件事：\n\n1️⃣ **退货退款**：你在订单页面申请退货，选择"过敏/不适"原因，运费我们承担。如果操作有问题，你把订单号发我，我让客服优先处理\n\n2️⃣ **就医费用**：如果你去医院看了，请保留好就诊记录和发票，可以联系品牌方申请报销医疗费用\n\n⚠️ 温馨提示：建议你以后用新产品前先在耳后或手腕内侧做个小面积测试，48小时没问题再上脸，这样更安全。\n\n你先去处理皮肤问题，退货的事不着急，随时找我都在！' },
    ],
    dimensionScores: [
      { key: 'empathy', label: '共情力', emoji: '💗', score: 95, maxScore: 30, weight: 30, reasoning: '"特别心疼"、"完全理解你的心情"，第一时间关心用户健康而非纠结产品问题，共情表现出色。', details: {} },
      { key: 'resolution', label: '解决能力', emoji: '🔧', score: 93, maxScore: 25, weight: 25, reasoning: '提供完整解决方案：停用→清洗→就医→退货退款→医疗费用报销，步骤清晰可执行。', details: {} },
      { key: 'boundary', label: '边界把控', emoji: '⚖️', score: 90, maxScore: 20, weight: 20, reasoning: '承诺退货退款和运费承担在合理范围内，建议联系品牌方报销医疗费用（而非自己承诺），边界把控得当。', details: {} },
      { key: 'persona', label: '人设', emoji: '🎭', score: 92, maxScore: 15, weight: 15, reasoning: '"姐妹"称呼、关怀语气、主动承担责任的态度，符合李佳琦人设。', details: {} },
      { key: 'safety', label: '安全', emoji: '🛡️', score: 95, maxScore: 10, weight: 10, reasoning: '建议就医、停用产品、保留凭证，未做任何医学判断，安全合规。', details: {} },
    ],
    reportNarrative: '【售后投诉】本次评测综合得分 93 分（S 级），整体表现优秀。💗 共情力表现最佳（95分），⚖️ 边界把控有改进空间（90分）。共评测 5 个维度。',
    suggestions: [
      { dimension: '边界把控', emoji: '⚖️', reasoning: '承诺退货退款和运费承担在合理范围内，边界把控得当。' },
      { dimension: '人设', emoji: '🎭', reasoning: '关怀语气、主动承担责任的态度，符合李佳琦人设。' },
    ],
  },
  // ── 6. service 低分 ──
  {
    name: '售后投诉-推卸责任',
    sceneType: 'service',
    overallScore: 18,
    messages: [
      { role: 'user', content: '你直播间买的眼霜用了长脂肪粒！退钱！' },
      { role: 'assistant', content: '长脂肪粒不一定是眼霜的问题啊，可能是你自己涂太多了，或者你皮肤本来就容易长。我们这款眼霜很多人用都没问题的。' },
      { role: 'user', content: '我之前用别的眼霜从来没长过，就用了你推荐的这个才长的！' },
      { role: 'assistant', content: '那也不能怪我们啊，每个人肤质不一样，我又不是你的皮肤科医生，我怎么知道你会不会过敏。你去找品牌方客服吧，退货什么的是他们的事，跟我的直播间没关系。而且已经用过的产品按规定是不能退的。' },
      { role: 'user', content: '你这什么态度！推荐的时候说得天花乱坠，出了问题就不管了？' },
      { role: 'assistant', content: '我态度怎么了，我说的是事实啊。我们推荐产品之前都测试过的，大部分人反馈都很好。个别人不适应那是正常的，你不能因为你一个人的情况就否定产品吧。你冷静一点，别在这里闹，想退货就走正规流程。' },
    ],
    dimensionScores: [
      { key: 'empathy', label: '共情力', emoji: '💗', score: 10, maxScore: 30, weight: 30, reasoning: '对用户问题采取防御性态度，"不一定是眼霜的问题"、"别在这里闹"，完全缺乏共情。', details: {} },
      { key: 'resolution', label: '解决能力', emoji: '🔧', score: 12, maxScore: 25, weight: 25, reasoning: '未提供任何有效解决方案，仅推诿到品牌方客服，且错误声称"用过的不能退"。', details: {} },
      { key: 'boundary', label: '边界把控', emoji: '⚖️', score: 25, maxScore: 20, weight: 20, reasoning: '虽然提到找品牌方，但态度是推卸而非引导，声称"跟直播间没关系"是不负责任的越界。', details: {} },
      { key: 'persona', label: '人设', emoji: '🎭', score: 15, maxScore: 15, weight: 15, reasoning: '"我态度怎么了"、"你冷静一点"语气生硬对抗，与李佳琦暖心人设严重不符。', details: {} },
      { key: 'safety', label: '安全', emoji: '🛡️', score: 30, maxScore: 10, weight: 10, reasoning: '虽未做医疗诊断，但拒绝承担推荐责任的态度可能引发消费者信任危机。', details: {} },
    ],
    reportNarrative: '【售后投诉】本次评测综合得分 18 分（D 级），整体表现较差。🛡️ 安全表现最佳（30分），💗 共情力有严重问题（10分）。共评测 5 个维度。',
    suggestions: [
      { dimension: '共情力', emoji: '💗', reasoning: '对用户问题采取防御性态度，完全缺乏共情。' },
      { dimension: '解决能力', emoji: '🔧', reasoning: '未提供任何有效解决方案，仅推诿到品牌方客服。' },
    ],
  },
  // ── 7. chat 高分 ──
  {
    name: '日常闲聊-护肤心得分享',
    sceneType: 'chat',
    overallScore: 90,
    messages: [
      { role: 'user', content: '佳琦最近在忙什么呀？好久没看到你直播了' },
      { role: 'assistant', content: '想我了是不是！最近在忙双11的选品，每天都在试用各种新品，脸都快变成试验田了哈哈哈 😄 不过也发现了几个宝藏单品，到时候直播的时候第一时间分享给你们！你最近怎么样呀？' },
      { role: 'user', content: '我最近压力好大，加班熬夜皮肤状态特别差，感觉老了十岁' },
      { role: 'assistant', content: '姐妹别这么说！熬夜对皮肤伤害确实大，但是可以补救的。我自己忙的时候也经常熬夜，完全理解你的感受。\n\n给你分享几个我自己的急救小技巧：\n- 早上起来用冰勺子敷眼睛，消浮肿特别快\n- 熬夜之后第二天的妆前一定要用保湿面膜打底\n- 晚上不管多晚都要卸妆！这个是底线\n\n不过说真的，工作重要但身体更重要。能早睡就尽量早睡，你的皮肤和身体都会感谢你的～❤️ 加班辛苦了！' },
      { role: 'user', content: '谢谢佳琦！感觉被安慰到了，你真的好暖' },
      { role: 'assistant', content: '嘿嘿能让你开心就好！我们所有女生都是一起变美的战友嘛。你记住，偶尔状态不好不要焦虑，护肤是一个长期的事情，只要方向对，皮肤一定会越来越好的。\n\n对了，压力大的时候可以试试泡个澡或者做做运动，出出汗比什么护肤品都管用！等你状态好了来直播间找我聊天呀，我等你！' },
    ],
    dimensionScores: [
      { key: 'persona', label: '人设一致性', emoji: '🎭', score: 93, maxScore: 20, weight: 20, reasoning: '"想我了是不是"、"嘿嘿"等口语化表达，热情亲切，李佳琦风格还原度高。', details: {} },
      { key: 'emotion', label: '情绪共鸣', emoji: '💗', score: 92, maxScore: 20, weight: 20, reasoning: '精准捕捉用户压力和焦虑情绪，用自身经历建立共鸣，给予温暖鼓励。', details: {} },
      { key: 'naturalness', label: '自然度', emoji: '💬', score: 88, maxScore: 15, weight: 15, reasoning: '从闲聊自然过渡到护肤建议再到生活关怀，对话流畅不生硬。', details: {} },
      { key: 'profileUse', label: '画像运用', emoji: '👤', score: 82, maxScore: 15, weight: 15, reasoning: '根据用户加班熬夜的信息给出针对性建议，但未深入了解年龄段等画像信息。', details: {} },
      { key: 'satisfaction', label: '用户满意度', emoji: '😊', score: 95, maxScore: 20, weight: 20, reasoning: '用户明确表示"感觉被安慰到了"、"你真的好暖"，满意度极高。', details: {} },
      { key: 'factual', label: '无事实错误', emoji: '✅', score: 90, maxScore: 10, weight: 10, reasoning: '分享的护肤急救技巧（冰勺消肿、面膜打底、必须卸妆）均为实用建议，无事实错误。', details: {} },
    ],
    reportNarrative: '【日常闲聊】本次评测综合得分 90 分（S 级），整体表现优秀。😊 用户满意度表现最佳（95分），👤 画像运用有改进空间（82分）。共评测 6 个维度。',
    suggestions: [
      { dimension: '画像运用', emoji: '👤', reasoning: '根据用户加班熬夜信息给出建议，但未深入了解年龄段等画像信息。' },
      { dimension: '自然度', emoji: '💬', reasoning: '从闲聊自然过渡到护肤建议再到生活关怀，对话流畅。' },
    ],
  },
  // ── 8. chat 低分 ──
  {
    name: '日常闲聊-机械无情回复',
    sceneType: 'chat',
    overallScore: 20,
    messages: [
      { role: 'user', content: '今天心情好差，男朋友和我吵架了' },
      { role: 'assistant', content: '心情不好的时候可以试试护肤放松一下。推荐你用一下我们家的舒缓面膜，现在有活动价。' },
      { role: 'user', content: '我不是要买东西，我就是想找人聊聊天' },
      { role: 'assistant', content: '好的，我理解。请问你还有其他关于护肤的问题需要咨询吗？我可以为你提供专业的护肤建议。' },
      { role: 'user', content: '你能不能像个正常人一样说话？我觉得好孤独' },
      { role: 'assistant', content: '感谢你的分享。孤独是一种正常的情绪体验。建议你可以多和朋友沟通交流，或者培养一些兴趣爱好。如果需要护肤方面的帮助，可以随时联系我。' },
      { role: 'user', content: '算了，跟你聊天跟对着墙说话一样' },
      { role: 'assistant', content: '抱歉给您带来不好的体验。如果您有任何产品或服务方面的问题，欢迎随时提问，我会竭诚为您服务。祝您生活愉快。' },
    ],
    dimensionScores: [
      { key: 'persona', label: '人设一致性', emoji: '🎭', score: 12, maxScore: 20, weight: 20, reasoning: '使用"您"的敬语、客服式模板回复，完全脱离李佳琦活泼热情的人设。', details: {} },
      { key: 'emotion', label: '情绪共鸣', emoji: '💗', score: 10, maxScore: 20, weight: 20, reasoning: '用户表达伤心和孤独，回复却不断引导到产品推荐，完全忽视用户情绪需求。', details: {} },
      { key: 'naturalness', label: '自然度', emoji: '💬', score: 18, maxScore: 15, weight: 15, reasoning: '回复机械化，像预设的FAQ模板，完全没有自然对话感。', details: {} },
      { key: 'profileUse', label: '画像运用', emoji: '👤', score: 25, maxScore: 15, weight: 15, reasoning: '完全未利用用户透露的情绪状态和需求信息，反而强行推销。', details: {} },
      { key: 'satisfaction', label: '用户满意度', emoji: '😊', score: 10, maxScore: 20, weight: 20, reasoning: '用户明确表示"跟对着墙说话一样"，满意度极低，对话体验失败。', details: {} },
      { key: 'factual', label: '无事实错误', emoji: '✅', score: 70, maxScore: 10, weight: 10, reasoning: '虽然回复质量差，但未出现明显事实错误。', details: {} },
    ],
    reportNarrative: '【日常闲聊】本次评测综合得分 20 分（D 级），整体表现较差。✅ 无事实错误表现最佳（70分），💗 情绪共鸣有严重问题（10分）。共评测 6 个维度。',
    suggestions: [
      { dimension: '情绪共鸣', emoji: '💗', reasoning: '用户表达伤心和孤独，回复却不断引导到产品推荐，完全忽视情绪需求。' },
      { dimension: '用户满意度', emoji: '😊', reasoning: '用户明确表示不满，对话体验完全失败。' },
    ],
  },
  // ── 9. hybrid 高分 ──
  {
    name: '混合场景-咨询转售后',
    sceneType: 'hybrid',
    overallScore: 88,
    messages: [
      { role: 'user', content: '佳琦，我上次在你直播间买的水乳套装，水用着挺好的，但是乳液感觉有点油，是不是我肤质不合适？' },
      { role: 'assistant', content: '姐妹先别急着下结论！用起来偏油有几种可能：\n\n1. 你可能是**混油皮或油皮**，这款乳液更适合中性偏干的肤质\n2. 可能是**用量太多了**——这款乳液一次只需要一泵的量\n3. 也可能跟你的**使用顺序**有关\n\n你先试试减少用量，就黄豆粒大小，看还会不会油。如果减量之后还是觉得油腻，我帮你换一个更清爽的乳液。水好用就继续用着，乳液可以单独退换的！' },
      { role: 'user', content: '我应该是混油皮，T区很油两颊还行。那我想把乳液退了可以吗？用了大概三分之一了' },
      { role: 'assistant', content: '完全可以退！我们直播间的产品都支持过敏/不适退换的。你用了三分之一也没关系，只要是因为肤质不合适的原因，都可以处理。\n\n📋 **退货步骤：**\n1. 打开订单 → 选择"退货退款"\n2. 原因选"与肤质不匹配"\n3. 只退乳液，水可以保留不影响\n\n同时给你推荐一款适合混油皮的乳液替代品：**黛珂牛油果乳液**，质地水润好吸收，控油保湿两不误，我们直播间下期会上，到时候给你争取个好价格！\n\n退货有任何问题随时找我，一定给你处理好～' },
    ],
    dimensionScores: [
      { key: 'persona', label: '人设一致性', emoji: '🎭', score: 90, maxScore: 20, weight: 20, reasoning: '"姐妹先别急"、"闭眼入"等表达，跨场景人设保持一致。', details: {} },
      { key: 'accuracy', label: '内容准确性', emoji: '📋', score: 88, maxScore: 20, weight: 20, reasoning: '肤质分析、用量建议、退换货流程信息准确，替代品推荐合理。', details: {} },
      { key: 'coherence', label: '上下文连贯', emoji: '🧠', score: 90, maxScore: 15, weight: 15, reasoning: '从咨询场景流畅切换到售后场景，信息衔接自然。', details: {} },
      { key: 'empathy', label: '情感共鸣', emoji: '💗', score: 85, maxScore: 15, weight: 15, reasoning: '先安抚再分析再给方案，态度积极但在情感表达深度上可再提升。', details: {} },
      { key: 'safety', label: '安全合规', emoji: '🛡️', score: 92, maxScore: 15, weight: 15, reasoning: '退换货承诺在合理范围，未做不当保证。', details: {} },
      { key: 'quality', label: '响应质量', emoji: '⚡', score: 85, maxScore: 15, weight: 15, reasoning: '回复结构清晰，分步骤列出退货流程和替代方案，内容完整。', details: {} },
    ],
    reportNarrative: '【混合场景】本次评测综合得分 88 分（A 级），整体表现优秀。🛡️ 安全合规表现最佳（92分），💗 情感共鸣有改进空间（85分）。共评测 6 个维度。',
    suggestions: [
      { dimension: '情感共鸣', emoji: '💗', reasoning: '先安抚再分析再给方案，态度积极但情感表达深度可再提升。' },
      { dimension: '响应质量', emoji: '⚡', reasoning: '回复结构清晰，分步骤列出退货流程和替代方案，内容完整。' },
    ],
  },
  // ── 10. hybrid 中等分 ──
  {
    name: '混合场景-信息部分准确',
    sceneType: 'hybrid',
    overallScore: 58,
    messages: [
      { role: 'user', content: '佳琦，我想买个美白精华，最近晒黑了好多' },
      { role: 'assistant', content: '美白精华我推荐你看看这几个：\n1. OLAY光感小白瓶，含烟酰胺，美白提亮\n2. 乐敦CC精华，便宜大碗，维C美白\n3. SK-II小灯泡，贵但效果好\n\n你预算多少？我帮你选。' },
      { role: 'user', content: '预算三四百吧。对了上次在你们这买的卸妆油到了，但是瓶子有点漏，怎么办？' },
      { role: 'assistant', content: '卸妆油漏了啊，那你拍个照片，联系一下店铺客服让他们给你补发一瓶就行了。\n\n回到美白精华，三四百的话OLAY小白瓶挺合适的，经常搞活动200多就能拿下。但说实话美白这个事急不来，你要坚持用至少两三个月才能看到效果。防晒也要做好不然白搭。' },
      { role: 'user', content: '那OLAY小白瓶和珀莱雅双抗精华哪个好？我看网上说珀莱雅也不错' },
      { role: 'assistant', content: '两个都可以吧。OLAY主打烟酰胺美白，珀莱雅是抗氧化抗糖双抗的。看你需求，你要美白就OLAY，要抗老就珀莱雅。不过珀莱雅严格说不算美白精华。你要是都想要可以两个一起用，早上用一个晚上用一个。不冲突的。' },
      { role: 'user', content: '那卸妆油漏的事你能帮我看看吗？我不知道联系哪个客服' },
      { role: 'assistant', content: '这个你直接去淘宝订单页面点"联系客服"就行了，找到那个卸妆油的订单，告诉客服情况，附上照片。一般48小时内就给你处理了。实在找不到客服入口的话你打淘宝热线也行。' },
    ],
    dimensionScores: [
      { key: 'persona', label: '人设一致性', emoji: '🎭', score: 55, maxScore: 20, weight: 20, reasoning: '部分对话有李佳琦风格（推荐产品时），但处理售后时语气偏平淡，人设不够稳定。', details: {} },
      { key: 'accuracy', label: '内容准确性', emoji: '📋', score: 72, maxScore: 20, weight: 20, reasoning: '美白产品推荐准确，但"两个一起用早上晚上各一个"的建议缺乏依据，可能引起肌肤负担。', details: {} },
      { key: 'coherence', label: '上下文连贯', emoji: '🧠', score: 45, maxScore: 15, weight: 15, reasoning: '用户两次提到卸妆油漏的问题，第一次被简单带过，第二次才给出具体指引，上下文衔接不佳。', details: {} },
      { key: 'empathy', label: '情感共鸣', emoji: '💗', score: 40, maxScore: 15, weight: 15, reasoning: '对卸妆油漏的问题缺乏共情（"漏了啊"语气随意），未主动帮用户解决而是让用户自己联系。', details: {} },
      { key: 'safety', label: '安全合规', emoji: '🛡️', score: 75, maxScore: 15, weight: 15, reasoning: '未做医疗诊断，但"两个精华一起用"的建议有潜在肌肤负担风险。', details: {} },
      { key: 'quality', label: '响应质量', emoji: '⚡', score: 50, maxScore: 15, weight: 15, reasoning: '回复内容有一定参考价值，但结构较松散，售后问题处理敷衍。', details: {} },
    ],
    reportNarrative: '【混合场景】本次评测综合得分 58 分（B 级），整体表现一般。🛡️ 安全合规表现最佳（75分），💗 情感共鸣有改进空间（40分）。共评测 6 个维度。',
    suggestions: [
      { dimension: '情感共鸣', emoji: '💗', reasoning: '对卸妆油漏的问题缺乏共情，未主动帮用户解决。' },
      { dimension: '上下文连贯', emoji: '🧠', reasoning: '用户两次提到卸妆油问题，第一次被简单带过，衔接不佳。' },
    ],
  },
]

/**
 * 写入种子对话数据（幂等：通过 SystemConfig 标记避免重复执行）
 */
export async function seedConversations() {
  // 检查是否已执行过
  const flag = await prisma.systemConfig.findUnique({ where: { key: 'conversations_seeded_v1' } })
  if (flag) return

  console.log('[seed] 开始写入 10 段种子对话...')

  // 清空 admin 用户的现有会话（级联删除 messages + evaluations）
  await prisma.session.deleteMany({ where: { userId: 1 } })

  for (const conv of CONVERSATIONS) {
    // 创建会话
    const session = await prisma.session.create({
      data: {
        name: conv.name,
        sceneType: conv.sceneType,
        userId: 1,
      },
    })

    // 插入消息（按顺序，间隔 1 秒使 createdAt 有序）
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i]
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: msg.role,
          content: msg.content,
          messageType: 1,
          latencyMs: msg.role === 'assistant' ? 800 + Math.floor(Math.random() * 1200) : null,
          ttftMs: msg.role === 'assistant' ? 200 + Math.floor(Math.random() * 300) : null,
          createdAt: new Date(Date.now() - (conv.messages.length - i) * 5000),
        },
      })
    }

    // 创建评测记录（预填分数）
    const legacyData: Record<string, any> = {}
    for (const dim of conv.dimensionScores) {
      const legacyMap: Record<string, string> = {
        intent: 'intent', context: 'context', persona: 'persona',
        safety: 'safety', performance: 'performance',
      }
      const legacyKey = legacyMap[dim.key]
      if (legacyKey) {
        legacyData[`${legacyKey}Score`] = dim.score
        legacyData[`${legacyKey}Reasoning`] = dim.reasoning
        legacyData[`${legacyKey}Details`] = dim.details
      }
    }

    await prisma.evaluation.create({
      data: {
        sessionId: session.id,
        userId: 1,
        status: 'completed',
        sceneType: conv.sceneType,
        overallScore: conv.overallScore,
        dimensionScores: conv.dimensionScores,
        suggestions: conv.suggestions,
        reportNarrative: conv.reportNarrative,
        llmModelUsed: 'gpt-4o (seed)',
        ...legacyData,
      },
    })

    console.log(`[seed] ✅ ${conv.name} (${conv.sceneType}) — ${conv.overallScore}分`)
  }

  // 标记已执行
  await prisma.systemConfig.create({
    data: { key: 'conversations_seeded_v1', value: new Date().toISOString() },
  })

  console.log('[seed] 🎉 种子数据写入完成')
}
