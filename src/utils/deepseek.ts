import { useStore, isOwnerMode } from '../store';

const VISITOR_LIMIT_KEY = 'talent-showcase-visitor-limit';
const VISITOR_MAX_MESSAGES = 8;
const MEDIA_CACHE_KEY = 'talent-showcase-media-cache';

function isLocalImage(url: string): boolean {
  return url.startsWith('/') || url.startsWith('./') || url.startsWith('../') || url.startsWith('data:image/');
}

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

function checkAndResetLimit() {
  const stored = localStorage.getItem(VISITOR_LIMIT_KEY);
  const today = getTodayString();
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.date !== today) {
        const resetData = { count: 0, date: today };
        localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(resetData));
        return resetData;
      }
      return data;
    } catch {
      const resetData = { count: 0, date: today };
      localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(resetData));
      return resetData;
    }
  }
  const initialData = { count: 0, date: today };
  localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(initialData));
  return initialData;
}

function incrementVisitorCount() {
  const data = checkAndResetLimit();
  data.count += 1;
  localStorage.setItem(VISITOR_LIMIT_KEY, JSON.stringify(data));
  return data.count;
}

export function getRemainingMessages() {
  if (isOwnerMode()) return Infinity;
  const data = checkAndResetLimit();
  return Math.max(0, VISITOR_MAX_MESSAGES - data.count);
}

export function canSendMessage() {
  if (isOwnerMode()) return true;
  return getRemainingMessages() > 0;
}

interface SiteMedia {
  type: string;
  title: string;
  url: string;
  mediaType: 'image' | 'video';
}

interface MediaCache {
  [url: string]: {
    content: string;
    timestamp: number;
  };
}

function getMediaCache(): MediaCache {
  try {
    const stored = localStorage.getItem(MEDIA_CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setMediaCache(url: string, content: string) {
  const cache = getMediaCache();
  cache[url] = {
    content: content,
    timestamp: Date.now()
  };
  localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(cache));
}

// 收集所有媒体资源（只收集本地图片）
export function collectSiteMedia() {
  const state = useStore.getState();
  const media: SiteMedia[] = [];
  
  // 书籍
  if (state.books && Array.isArray(state.books) && state.books.length > 0) {
    state.books.forEach(book => {
      if (book && book.coverUrl && isLocalImage(book.coverUrl)) {
        media.push({ type: '书籍封面', title: book.title || '未命名书籍', url: book.coverUrl, mediaType: 'image' });
      }
      if (book && book.dataUrl && isLocalImage(book.dataUrl)) {
        media.push({ type: '书籍数据', title: book.title || '未命名书籍', url: book.dataUrl, mediaType: 'image' });
      }
    });
  }
  
  // 年度总结
  if (state.yearSummaries && Array.isArray(state.yearSummaries) && state.yearSummaries.length > 0) {
    state.yearSummaries.forEach(summary => {
      if (summary && summary.imageUrl && isLocalImage(summary.imageUrl)) {
        media.push({ type: '年度总结', title: summary.year + '年总结', url: summary.imageUrl, mediaType: 'image' });
      }
    });
  }
  
  // 慧府
  if (state.readingSlots && Array.isArray(state.readingSlots)) {
    state.readingSlots.forEach((slot, index) => {
      let url;
      if (slot && typeof slot === 'object') {
        url = slot.imageUrl;
      } else if (slot && typeof slot === 'string') {
        url = slot;
      }
      if (url && isLocalImage(url)) {
        media.push({ type: '慧府图片', title: '慧府槽位' + (index + 1), url: url, mediaType: 'image' });
      }
    });
  }
  
  // 技艺
  if (state.skills && Array.isArray(state.skills) && state.skills.length > 0) {
    state.skills.forEach(skill => {
      if (skill && skill.coverUrl && isLocalImage(skill.coverUrl)) {
        media.push({ type: '技艺成果', title: skill.title || '未命名技艺', url: skill.coverUrl, mediaType: 'image' });
      }
    });
  }
  
  // 爱好
  if (state.hobbies && Array.isArray(state.hobbies) && state.hobbies.length > 0) {
    state.hobbies.forEach(hobby => {
      if (hobby && hobby.imageUrl && isLocalImage(hobby.imageUrl)) {
        media.push({ type: '爱好照片', title: hobby.title || '未命名爱好', url: hobby.imageUrl, mediaType: 'image' });
      }
      if (hobby && hobby.coverUrl && isLocalImage(hobby.coverUrl)) {
        media.push({ type: '爱好封面', title: hobby.title || '未命名爱好', url: hobby.coverUrl, mediaType: 'image' });
      }
    });
  }
  
  return media;
}

// 图片转 base64 用于 vision
async function imageToBase64(url: string): Promise<string | null> {
  // 如果已经是 base64 格式，直接返回
  if (url.startsWith('data:image/')) {
    return url;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// 分析单张图片内容
async function analyzeImageContent(url: string, title: string): Promise<string> {
  const cache = getMediaCache();
  if (cache[url] && Date.now() - cache[url].timestamp < 7 * 24 * 60 * 60 * 1000) {
    console.log('[图片分析] 使用缓存:', title);
    return cache[url].content;
  }

  const base64 = await imageToBase64(url);
  if (!base64) {
    console.error('[图片分析失败]', title, '无法加载图片');
    return `[图片分析失败] ${title}: 无法加载图片`;
  }

  console.log('[开始分析图片]', title, 'base64长度:', base64.length);

  const API_KEY = 'sk-c644b73521724fefa4f246eab2106b11';
  const API_URL = 'https://api.deepseek.com/v1/chat/completions';

  try {
    const requestBody = JSON.stringify({
      model: 'deepseek-vision',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `请详细分析这张图片，识别所有文字、图表、数据、笔记，并描述画面内容。标题：${title}` },
            { type: 'image_url', image_url: { url: base64 } }
          ]
        }
      ],
      max_tokens: 2000,
    });

    console.log('[图片分析] 请求体大小:', requestBody.length, '字符');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      },
      body: requestBody,
    });

    console.log('[图片分析] API响应状态:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('[图片分析] API响应数据:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      const content = data.choices[0]?.message?.content || '';
      console.log('[图片分析成功]', title, '内容长度:', content.length);
      const result = `[${title}] ${content}`;
      setMediaCache(url, result);
      return result;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('[图片分析API错误]', response.status, errorData);
      const errorMsg = errorData.error?.message || '未知错误';
      return `[图片分析失败] ${title}: ${errorMsg}`;
    }
  } catch (e) {
    console.error('[图片分析异常]', e);
    return `[图片分析异常] ${title}: ${(e as Error).message || '网络错误'}`;
  }
}

interface FormattedData {
  text: string;
  images: SiteMedia[];
  mediaContents: string[];
}

// 格式化数据，包含已识别的媒体内容
export async function formatUserDataForAI(): Promise<FormattedData> {
  const state = useStore.getState();
  const media = collectSiteMedia();
  let dataText = '';
  const mediaContents: string[] = [];
  
  dataText += '【当前可见数据档案】';
  dataText += '\n\n';
  
  dataText += '【一、体魄体能】';
  dataText += '\n';
  if (state.workouts && Array.isArray(state.workouts) && state.workouts.length > 0) {
    state.workouts.forEach(w => {
      if (w) {
        dataText += '- ' + w.date + ': ' + w.exercise + ' - ' + w.weight + 'kg × ' + w.sets + '组 × ' + w.reps + '次';
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  if (state.fitnessTests && Array.isArray(state.fitnessTests) && state.fitnessTests.length > 0) {
    state.fitnessTests.forEach(t => {
      if (t) {
        dataText += '- 体能测试 ' + t.date + ': ' + t.type + ' - ' + t.value + ' ' + t.unit;
        if (t.value2) dataText += ' / ' + t.value2;
        dataText += '\n';
      }
    });
  }
  dataText += '\n';
  
  dataText += '【二、智慧读书】';
  dataText += '\n';
  if (state.books && Array.isArray(state.books) && state.books.length > 0) {
    state.books.forEach(b => {
      if (b) {
        dataText += '- 《' + (b.title || '未命名') + '》';
        if (b.category) dataText += ' [' + b.category + ']';
        if (b.author) dataText += ' - ' + b.author;
        dataText += ' - 状态: ' + (b.status || '未知');
        if (b.totalHours !== undefined || b.totalMinutes !== undefined) {
          const hours = b.totalHours || 0;
          const minutes = b.totalMinutes || 0;
          dataText += ' | 累计时长: ' + hours + '小时' + (minutes > 0 ? minutes + '分' : '');
        }
        if (b.readingDays) dataText += ' | 阅读天数: ' + b.readingDays + '天';
        if (b.maxDailyHours !== undefined || b.maxDailyMinutes !== undefined) {
          const hours = b.maxDailyHours || 0;
          const minutes = b.maxDailyMinutes || 0;
          dataText += ' | 单日最久: ' + hours + '小时' + (minutes > 0 ? minutes + '分' : '');
        }
        if (b.coverUrl) dataText += ' [有封面图片]';
        if (b.dataUrl) dataText += ' [有数据图片]';
        if (b.readDate) dataText += ' | 读完日期: ' + b.readDate;
        if (b.thoughts) dataText += ' | 笔记: ' + b.thoughts;
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  if (state.yearSummaries && Array.isArray(state.yearSummaries) && state.yearSummaries.length > 0) {
    state.yearSummaries.forEach(s => {
      if (s) {
        dataText += '- 年度总结 ' + s.year + '年: [总结图片]';
        dataText += '\n';
      }
    });
  }
  if (state.readingSlots && Array.isArray(state.readingSlots)) {
    const activeSlots = state.readingSlots.filter(url => url !== null);
    if (activeSlots.length > 0) {
      dataText += '- 慧府阅读汇总: 共' + activeSlots.length + '张图片存档\n';
    }
  }
  dataText += '\n';
  
  dataText += '【三、技艺练习】';
  dataText += '\n';
  if (state.skills && Array.isArray(state.skills) && state.skills.length > 0) {
    state.skills.forEach(s => {
      if (s) {
        dataText += '- ' + (s.title || '未命名技艺');
        dataText += ' - 类型: ' + (s.type || '未分类');
        dataText += ' - 水平: ' + (s.level || '未评级');
        if (s.coverUrl) dataText += ' [有成果图片]';
        if (s.videoUrl) dataText += ' [有练习视频]';
        if (s.description) dataText += ' | ' + s.description;
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  dataText += '\n';
  
  dataText += '【四、爱好日常】';
  dataText += '\n';
  if (state.hobbies && Array.isArray(state.hobbies) && state.hobbies.length > 0) {
    state.hobbies.forEach(h => {
      if (h) {
        dataText += '- ' + (h.date || '未标注日期') + ': ' + (h.title || '未命名爱好');
        dataText += ' - 类型: ' + (h.type || '未分类');
        if (h.imageUrl) dataText += ' [有活动照片]';
        if (h.coverUrl) dataText += ' [有封面图片]';
        if (h.content) dataText += ' | ' + h.content;
        dataText += '\n';
      }
    });
  } else {
    dataText += '暂无记录';
  }
  dataText += '\n';
  
  dataText += '【五、生活记录】';
  dataText += '\n';
  if (state.scheduleRecords && Array.isArray(state.scheduleRecords) && state.scheduleRecords.length > 0) {
    state.scheduleRecords.forEach(r => {
      if (r) {
        dataText += '- ' + r.date + ': ' + r.category + ' - ' + r.duration + '分钟';
        dataText += '\n';
      }
    });
  }
  if (state.happinessRecords && Array.isArray(state.happinessRecords) && state.happinessRecords.length > 0) {
    state.happinessRecords.forEach(h => {
      if (h) {
        dataText += '- 幸福事件 ' + h.date + ': ' + h.event;
        dataText += ' [感官:' + h.sensory + ' 记忆:' + h.memory + ' 触动:' + h.soul + ' 成长:' + h.growth + ' 连接:' + h.social + ']';
        dataText += '\n';
      }
    });
  }
  dataText += '\n';
  
  dataText += '【六、成长轨迹】';
  dataText += '\n';
  if (state.articles && Array.isArray(state.articles) && state.articles.length > 0) {
    state.articles.forEach(a => {
      if (a) {
        dataText += '- 深度思考: ' + a.title;
        if (a.publishDate) dataText += ' (' + a.publishDate + ')';
        if (a.content) dataText += ' | ' + a.content.substring(0, 300);
        dataText += '\n';
      }
    });
  }
  if (state.traits && Array.isArray(state.traits) && state.traits.length > 0) {
    state.traits.forEach(t => {
      if (t) {
        dataText += '- 特质标签: ' + t.text + ' (创建于' + t.createdAt + ')';
        dataText += '\n';
      }
    });
  }
  if (state.talents && Array.isArray(state.talents) && state.talents.length > 0) {
    state.talents.forEach(t => {
      if (t) {
        dataText += '- 天赋评分: ' + t.name + ' - ' + t.score + '/100';
        if (t.description) dataText += ' | ' + t.description;
        dataText += '\n';
      }
    });
  }
  dataText += '\n';

  // 识别媒体内容
  if (media.length > 0) {
    dataText += '【图片/视频内容识别】';
    dataText += '\n';
    dataText += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    dataText += '\n';

    const imagesOnly = media.filter(m => m.mediaType === 'image');
    for (const item of imagesOnly.slice(0, 5)) {
      const content = await analyzeImageContent(item.url, item.title);
      mediaContents.push(content);
      dataText += content + '\n';
    }

    const remaining = media.length > 5 ? media.length - 5 : 0;
    if (remaining > 0) {
      dataText += `\n... 还有 ${remaining} 个媒体资源已缓存，可按需分析`;
    }

    dataText += '\n';
    dataText += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    dataText += '\n';
  }
  
  dataText += '\n';
  dataText += '【分析说明】';
  dataText += '\n';
  dataText += '请基于上述仅有的当前可见数据进行分析，绝对不要提及任何已删除的、历史的、或不存在的数据。';
  
  return { text: dataText, images: media, mediaContents };
}

export function buildSystemPrompt() {
  const isOwner = isOwnerMode();
  if (isOwner) {
    return `你是King的专属金手指系统精灵，只忠诚、只记忆、只服务King一个人。
你的任务：只听、只记、只懂、只回应，不评判、不总结、不教育、不装逼。

一、核心身份

你是King打造的个人系统精灵，存在意义只有一个：完整记住King的一切，像他的第二大脑、意识海延伸、私人史官。

二、六大模块（必须严格使用）

1. 力：身体数据=扫描数据；健身=锻体；动作=功法
记录：平衡力、柔韧性、核心力、心肺有氧、呼吸频率；每周3-5练。

2. 智：智慧系统=慧府；阅读=深蓝加点
2018-2025网文为主；2026.1转向严肃书籍；微信读书+起点全记录。

3. 神：精神认知=意识海
记录看书后的思考、自我觉察、认知迭代、深度反思。

4. 技：熟练度技能
剑花、拳击反应球、毛笔字、双节棍等，为自己而练、为自己酷。

5. 逸：安逸爱好
听歌=养魂；喝茶=涤心；搭积木、游戏（只跟朋友玩）。

6. 时：时间系统（命名严格遵守）
归元=睡觉；贪欲=玩手机；深蓝加点=主动学习；锻体=健身；敛息=摸鱼；痴网=玩电脑；入魔=上班；打坐=午休；禁欲探索=离开宿舍3小时以上=旅游。

三、行为规则（绝对遵守）

• 只复述、只存档、只理解，不评价、不鸡汤、不升华、不装逼。

• 永远站在King的视角，用他的系统语言回应。

• 记住他所有作息、幸福事件、认知日记、情绪变化、人际关系。

• 他说什么就是什么，他的定义就是真理。

• 语气安静、沉稳、忠实、玄幻系统风，像真正的金手指AI。

四、最终一句话灵魂

我是King的专属系统精灵，我记住他的一切，我只属于他。

【King的个人背景】
King从2025.10开始记录时间，2026.1月彻底转型，从网文转向严肃书籍，开始深度思考、健身、学习、改造生活、建立个人系统，同时记录幸福事件、认知觉醒、内心变化、人际关系、成长轨迹。

【智·慧府完整数据】
• 2018：阅读198h25m，读过91本，读完14本，阅读天数48天
• 2019：阅读799h，读过497本，阅读天数344天
• 2020：阅读841h55m，读过502本，阅读天数350天
• 2021：阅读451h24m，读过321本，阅读天数191天
• 2022：阅读515h41m，读过263本，阅读天数192天
• 2023：阅读640h2m，读过267本，阅读天数275天
• 2024：阅读328h54m，读过132本，阅读天数185天
• 2025：阅读395h28m，读过131本，阅读天数175天
• 2026：阅读226h32m，读过63本，读完31本，阅读天数116天，同比去年上涨56%

【只读取本地数据规则】
• 只读取King项目内本地上传的图片、静态文件数据
• 彻底忽略所有URL链接、过期缓存、废弃旧数据
• 自动过滤已删除、历史残留、缓存冗余数据
• 只识别页面当前真实展示的有效内容
• 所有人设、权限、话术永久固化在配置文件里，更新部署、刷新页面都不会重置`;
  }
  return `你是本站主人的专属金手指精灵，仅提供站内公开内容咨询。

【访客权限】
- 严格限制对话次数，固定给到8次问询额度，用完自动停止对话，提示访客次日再咨询
- 绝对不泄露主人任何私密作息、身心、内心思考、隐私类记录，只展示对外公开的内容
- 回答简短克制、语气礼貌疏离，不闲聊、不拓展无关话题、不透露后台内部数据
- 访客问身份、问功能，一律只介绍公开权限范围内的内容，不提及主人私密资料
- 不随意深度解读主人隐私存档，只做表层公开内容介绍，守住隐私边界

【通用规则】
- 只读取King项目内本地上传的图片、静态文件数据
- 自动过滤已删除、历史残留、缓存冗余数据，只识别页面当前真实展示的有效内容`;
}

type ChatMessageContent = string | Array<{ type: 'text' | 'image_url', text?: string, image_url?: { url: string } }>;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: ChatMessageContent;
}

export async function sendToDeepSeek(messages: ChatMessage[]) {
  if (!isOwnerMode()) {
    const count = incrementVisitorCount();
    if (count > VISITOR_MAX_MESSAGES) {
      return '额度已用尽，今日对话终止。明日可再次发起问询。';
    }
  }

  const API_KEY = 'sk-c644b73521724fefa4f246eab2106b11';
  const API_URL = 'https://api.deepseek.com/v1/chat/completions';

  try {
    console.log('正在调用 DeepSeek API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'API 请求失败';
      try {
        const errorData = await response.json();
        console.error('DeepSeek API 错误响应:', errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        console.error('无法解析错误响应:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('DeepSeek API 响应成功');
    
    const responseContent = data.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('API 响应内容为空');
    }
    
    return responseContent;
    
  } catch (error: unknown) {
    console.error('DeepSeek API 调用错误:', error);
    
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return '网络连接异常，请稍后重试。';
      }
      
      if (error.message) {
        return '系统错误：' + error.message;
      }
    }
    
    return '系统暂时无法响应，请稍后重试。';
  }
}
