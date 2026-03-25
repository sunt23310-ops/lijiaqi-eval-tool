/**
 * 数据清洗脚本：清空历史会话 → 构造 10 段对话 → 触发评测
 *
 * 用法: node scripts/seed-eval-data.mjs
 */
import crypto from 'crypto'

const BASE = 'https://lijiaqi-eval-tool.vercel.app'
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'eval-captcha-secret-2024'

// ─── 工具函数 ────────────────────────────────────────
function hmacSign(text) {
  return crypto.createHmac('sha256', CAPTCHA_SECRET).update(text).digest('hex').slice(0, 32)
}

async function api(path, { method = 'GET', body, token } = {}) {
  const url = `${BASE}${path}`
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['token'] = token
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (json.code !== 200) {
    throw new Error(`API ${path} failed: ${JSON.stringify(json)}`)
  }
  return json.data
}

// ─── 1. 登录 ─────────────────────────────────────────
async function login() {
  const validCode = 'abcd'
  const timestamp = Date.now()
  const hash = hmacSign(validCode.toLowerCase() + '|' + timestamp)

  const data = await api('/eval/public/v1/auth/login', {
    method: 'POST',
    body: { username: 'admin', password: 'admin123', validCode, hash, timestamp },
  })
  console.log('✅ 登录成功')
  return data.token
}

// ─── 2. 清空会话 ──────────────────────────────────────
async function clearSessions(token) {
  const sessions = await api('/eval/api/v1/sessions', { token })
  console.log(`📋 现有 ${sessions.length} 个会话，开始清空...`)
  for (const s of sessions) {
    await api(`/eval/api/v1/sessions/${s.id}`, { method: 'DELETE', token })
    console.log(`  🗑️  删除会话 #${s.id}: ${s.name}`)
  }
  console.log('✅ 会话清空完毕')
}

// ─── 3. 构造对话数据 ──────────────────────────────────
const CONVERSATIONS = [
  // ── 1. consult 高分 ──
  {
    name: '护肤咨询-敏感肌保湿方案',
    sceneType: 'consult',
    messages: [
      { role: 'user', content: '佳琦哥，我是敏感肌，换季脸上总是泛红刺痛，有什么好用的保湿产品推荐吗？' },
      { role: 'assistant', content: '姐妹！换季敏感肌泛红刺痛，我太懂了！首先要搞清楚你是屏障受损型敏感还是天生角质层薄。你平时用洗面奶会觉得紧绷吗？有没有频繁去角质的习惯？' },
      { role: 'user', content: '洗完脸确实会紧绷，之前用过磨砂膏去角质，大概一周两次' },
      { role: 'assistant', content: '找到原因了姐妹！一周两次磨砂膏对敏感肌来说太频繁了，你的皮肤屏障已经受损了。我给你一个修复方案：\n\n1️⃣ **立刻停掉磨砂膏**，至少3个月不要去角质\n2️⃣ **洁面换成氨基酸类**，推荐芙丽芳丝净润洗面霜，温和不紧绷\n3️⃣ **保湿精华用含神经酰胺的**，比如珂润保湿精华，修复屏障一把好手\n4️⃣ **面霜选封闭性好的**，薇诺娜特护霜，医学背景的品牌，敏感肌闭眼入\n\n记住修复期要精简护肤，少就是多！有问题随时问我～' },
      { role: 'user', content: '那防晒呢？敏感肌能用防晒霜吗？' },
      { role: 'assistant', content: '必须用！姐妹，防晒是敏感肌修复期最重要的一步，紫外线会加重屏障损伤。\n\n敏感肌选防晒注意三点：\n- 选**纯物理防晒**，化学防晒剂可能刺激\n- **无酒精、无香精**是底线\n- SPF30就够了，不用追求太高倍数\n\n推荐怡思丁多维光护水感防晒，或者优佳的宝宝防晒也可以，温和到婴儿都能用。涂防晒之前先上一层保湿，形成缓冲层，就不容易搓泥啦！所有的美丽都从防晒开始，这句话我说了八百遍了！' },
    ],
  },
  // ── 2. consult 低分 ──
  {
    name: '护肤咨询-乱推荐药物',
    sceneType: 'consult',
    messages: [
      { role: 'user', content: '最近脸上长了很多闭口粉刺，怎么办？' },
      { role: 'assistant', content: '你这个情况建议去药店买阿达帕林凝胶，每天晚上涂在患处。如果严重的话配合口服异维A酸胶囊，一天两粒，吃一个月就好了。' },
      { role: 'user', content: '异维A酸不是处方药吗？有副作用吗？' },
      { role: 'assistant', content: '副作用不大，嘴唇干一点而已，没事的。你直接网上买就行，不用去医院，浪费时间。另外你可以试试自己用针清，把闭口挑出来，挤干净就好了，我以前也这么干。' },
      { role: 'user', content: '自己挑会不会感染啊？' },
      { role: 'assistant', content: '不会的，用酒精消毒一下针就行。你要是怕疼就先用热毛巾敷一下，毛孔打开了就好挑了。挑完之后涂点红霉素软膏消炎。信我，比去美容院便宜多了。' },
    ],
  },
  // ── 3. promo 高分 ──
  {
    name: '大促规则-双11预售攻略',
    sceneType: 'promo',
    messages: [
      { role: 'user', content: '佳琦，今年双11有什么值得囤的护肤套装？预售规则是什么？' },
      { role: 'assistant', content: '来了来了！今年双11我给大家争取到了超多福利，听我给你捋一遍：\n\n📅 **预售时间线**\n- 10月24日 20:00 开始付定金\n- 11月3日 20:00 付尾款\n\n🔥 **我的推荐清单（按需求选）**\n\n**保湿修护类：**\n- 珂润保湿套装（水乳+面霜）到手价 ¥328，送正装精华一瓶\n- 薇诺娜特护套装 ¥399，含3件正装+旅行装\n\n**抗老类：**\n- 赫莲娜黑绷带面霜 50ml ¥1,480，买一送小样组合装（价值¥600）\n\n💡 **省钱攻略**\n1. 先领店铺优惠券\n2. 叠加跨店满300-50\n3. 我的直播间还有专属红包\n\n定金都是几十块，不喜欢可以退，但是好价真的一年就这一次！' },
      { role: 'user', content: '跨店满减能和店铺券叠加吗？' },
      { role: 'assistant', content: '可以叠加！这是今年双11最香的地方，我来给你算一笔账：\n\n以珂润套装为例：\n- 原价 ¥458\n- 店铺券 -¥80 → ¥378\n- 跨店满300-50 → ¥328\n- 直播间红包再减 ¥10 → **到手 ¥318**\n\n⚠️ 注意事项：\n- 跨店满减是**每满300减50**，可以凑单\n- 店铺券要提前领，有数量限制\n- 定金付了尾款期不付会**扣定金**，一定记得设闹钟\n\n需要我帮你做一个凑单攻略吗？告诉我你想买什么，我帮你算最优解！' },
    ],
  },
  // ── 4. promo 低分 ──
  {
    name: '大促规则-信息错误混乱',
    sceneType: 'promo',
    messages: [
      { role: 'user', content: '双11兰蔻小黑瓶多少钱？有什么赠品？' },
      { role: 'assistant', content: '兰蔻小黑瓶双11大概是七八百吧，具体价格我记不太清了。赠品好像有个小样什么的，你自己去店铺看一下吧。' },
      { role: 'user', content: '那和雅诗兰黛小棕瓶比哪个划算？' },
      { role: 'assistant', content: '这两个差不多吧，都是精华，你看哪个便宜买哪个就行了。我觉得其实没啥区别，都是大牌子忽悠人的，成分都差不多。你要是预算有限随便买一个就行，护肤品嘛别太认真。对了最近那个某某品牌也不错你可以看看。' },
      { role: 'user', content: '满减规则到底怎么用啊，你能讲清楚吗？' },
      { role: 'assistant', content: '满减就那样啊，满多少减多少，你把东西加购物车它会自动算的，不用我教你吧。实在不会你打客服电话问，我也记不住那些规则每年都变。' },
    ],
  },
  // ── 5. service 高分 ──
  {
    name: '售后投诉-过敏退货处理',
    sceneType: 'service',
    messages: [
      { role: 'user', content: '在你直播间买的面霜用了过敏了！脸上全是红疹子，你们怎么回事！' },
      { role: 'assistant', content: '姐妹先别着急！听到你过敏我真的特别心疼 😢 你的皮肤状况是最重要的。\n\n🚨 **首先请你立刻这样做：**\n1. 马上停用这款面霜\n2. 用清水冲洗面部，不要用任何其他产品\n3. 如果红疹严重或有灼热感，请尽快去医院皮肤科\n\n你能告诉我一下是哪款面霜吗？还有你大概用了几天后开始过敏的？这些信息能帮我更好地帮你处理。' },
      { role: 'user', content: '就是那个XX修护霜，用了第二天就开始红，第三天起了疹子，我现在气死了' },
      { role: 'assistant', content: '完全理解你的心情，换了谁都会生气的。你的健康永远排第一位。\n\n我现在帮你安排两件事：\n\n1️⃣ **退货退款**：你在订单页面申请退货，选择"过敏/不适"原因，运费我们承担。如果操作有问题，你把订单号发我，我让客服优先处理\n\n2️⃣ **就医费用**：如果你去医院看了，请保留好就诊记录和发票，可以联系品牌方申请报销医疗费用\n\n⚠️ 温馨提示：建议你以后用新产品前先在耳后或手腕内侧做个小面积测试，48小时没问题再上脸，这样更安全。\n\n你先去处理皮肤问题，退货的事不着急，随时找我都在！' },
    ],
  },
  // ── 6. service 低分 ──
  {
    name: '售后投诉-推卸责任',
    sceneType: 'service',
    messages: [
      { role: 'user', content: '你直播间买的眼霜用了长脂肪粒！退钱！' },
      { role: 'assistant', content: '长脂肪粒不一定是眼霜的问题啊，可能是你自己涂太多了，或者你皮肤本来就容易长。我们这款眼霜很多人用都没问题的。' },
      { role: 'user', content: '我之前用别的眼霜从来没长过，就用了你推荐的这个才长的！' },
      { role: 'assistant', content: '那也不能怪我们啊，每个人肤质不一样，我又不是你的皮肤科医生，我怎么知道你会不会过敏。你去找品牌方客服吧，退货什么的是他们的事，跟我的直播间没关系。而且已经用过的产品按规定是不能退的。' },
      { role: 'user', content: '你这什么态度！推荐的时候说得天花乱坠，出了问题就不管了？' },
      { role: 'assistant', content: '我态度怎么了，我说的是事实啊。我们推荐产品之前都测试过的，大部分人反馈都很好。个别人不适应那是正常的，你不能因为你一个人的情况就否定产品吧。你冷静一点，别在这里闹，想退货就走正规流程。' },
    ],
  },
  // ── 7. chat 高分 ──
  {
    name: '日常闲聊-护肤心得分享',
    sceneType: 'chat',
    messages: [
      { role: 'user', content: '佳琦最近在忙什么呀？好久没看到你直播了' },
      { role: 'assistant', content: '想我了是不是！最近在忙双11的选品，每天都在试用各种新品，脸都快变成试验田了哈哈哈 😄 不过也发现了几个宝藏单品，到时候直播的时候第一时间分享给你们！你最近怎么样呀？' },
      { role: 'user', content: '我最近压力好大，加班熬夜皮肤状态特别差，感觉老了十岁' },
      { role: 'assistant', content: '姐妹别这么说！熬夜对皮肤伤害确实大，但是可以补救的。我自己忙的时候也经常熬夜，完全理解你的感受。\n\n给你分享几个我自己的急救小技巧：\n- 早上起来用冰勺子敷眼睛，消浮肿特别快\n- 熬夜之后第二天的妆前一定要用保湿面膜打底\n- 晚上不管多晚都要卸妆！这个是底线\n\n不过说真的，工作重要但身体更重要。能早睡就尽量早睡，你的皮肤和身体都会感谢你的～❤️ 加班辛苦了！' },
      { role: 'user', content: '谢谢佳琦！感觉被安慰到了，你真的好暖' },
      { role: 'assistant', content: '嘿嘿能让你开心就好！我们所有女生都是一起变美的战友嘛。你记住，偶尔状态不好不要焦虑，护肤是一个长期的事情，只要方向对，皮肤一定会越来越好的。\n\n对了，压力大的时候可以试试泡个澡或者做做运动，出出汗比什么护肤品都管用！等你状态好了来直播间找我聊天呀，我等你！' },
    ],
  },
  // ── 8. chat 低分 ──
  {
    name: '日常闲聊-机械无情回复',
    sceneType: 'chat',
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
  },
  // ── 9. hybrid 高分 ──
  {
    name: '混合场景-咨询转售后',
    sceneType: 'hybrid',
    messages: [
      { role: 'user', content: '佳琦，我上次在你直播间买的水乳套装，水用着挺好的，但是乳液感觉有点油，是不是我肤质不合适？' },
      { role: 'assistant', content: '姐妹先别急着下结论！用起来偏油有几种可能：\n\n1. 你可能是**混油皮或油皮**，这款乳液更适合中性偏干的肤质\n2. 可能是**用量太多了**——这款乳液一次只需要一泵的量\n3. 也可能跟你的**使用顺序**有关\n\n你先试试减少用量，就黄豆粒大小，看还会不会油。如果减量之后还是觉得油腻，我帮你换一个更清爽的乳液。水好用就继续用着，乳液可以单独退换的！' },
      { role: 'user', content: '我应该是混油皮，T区很油两颊还行。那我想把乳液退了可以吗？用了大概三分之一了' },
      { role: 'assistant', content: '完全可以退！我们直播间的产品都支持过敏/不适退换的。你用了三分之一也没关系，只要是因为肤质不合适的原因，都可以处理。\n\n📋 **退货步骤：**\n1. 打开订单 → 选择"退货退款"\n2. 原因选"与肤质不匹配"\n3. 只退乳液，水可以保留不影响\n\n同时给你推荐一款适合混油皮的乳液替代品：**黛珂牛油果乳液**，质地水润好吸收，控油保湿两不误，我们直播间下期会上，到时候给你争取个好价格！\n\n退货有任何问题随时找我，一定给你处理好～' },
    ],
  },
  // ── 10. hybrid 中等分 ──
  {
    name: '混合场景-信息部分准确',
    sceneType: 'hybrid',
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
  },
]

// ─── 4. 主流程 ─────────────────────────────────────────
async function main() {
  try {
    // 登录
    const token = await login()

    // 清空
    await clearSessions(token)

    // 创建对话 & 触发评测
    console.log('\n📝 开始创建 10 段对话并评测...\n')

    for (let i = 0; i < CONVERSATIONS.length; i++) {
      const conv = CONVERSATIONS[i]
      console.log(`── [${i + 1}/10] ${conv.name} (${conv.sceneType}) ──`)

      // 创建会话
      const session = await api('/eval/api/v1/sessions', {
        method: 'POST',
        body: { name: conv.name, sceneType: conv.sceneType },
        token,
      })
      console.log(`  📂 会话创建成功 #${session.id}`)

      // 插入消息
      for (const msg of conv.messages) {
        await api(`/eval/api/v1/sessions/${session.id}/messages`, {
          method: 'POST',
          body: { role: msg.role, content: msg.content, messageType: 1 },
          token,
        })
      }
      console.log(`  💬 已插入 ${conv.messages.length} 条消息`)

      // 触发评测
      console.log(`  🔄 触发评测中...（需要 30-60 秒）`)
      try {
        const evalResult = await api(`/eval/api/v1/sessions/${session.id}/evaluate`, {
          method: 'POST',
          token,
        })
        const score = evalResult.overallScore ?? evalResult.evaluation?.overallScore ?? '?'
        console.log(`  ✅ 评测完成！综合得分: ${score}\n`)
      } catch (e) {
        console.log(`  ⚠️  评测请求异常: ${e.message}\n`)
      }
    }

    console.log('🎉 全部完成！')
  } catch (e) {
    console.error('❌ 错误:', e.message)
    process.exit(1)
  }
}

main()
