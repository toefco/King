import { Talent, FitnessTest, Workout, Book, Article, Skill, Hobby, Schedule, Happiness } from '../types';

export const mockTalents: Talent[] = [
  { id: '1', name: '体魄', score: 85, icon: 'BicepsFlexed', description: '强健的体魄是人生的基石' },
  { id: '2', name: '智慧', score: 78, icon: 'Brain', description: '知识是心灵的光明' },
  { id: '3', name: '精神', score: 82, icon: 'Sparkles', description: '精神的富足超越物质' },
  { id: '4', name: '技艺', score: 90, icon: 'Sword', description: '技艺精湛，炉火纯青' },
  { id: '5', name: '爱好', score: 88, icon: 'Heart', description: '热爱生活，享受当下' },
  { id: '6', name: '时间', score: 75, icon: 'Clock', description: '珍惜每分每秒' },
];

export const mockFitnessTests: FitnessTest[] = [
  { id: '1', date: '2024-01-15', type: 'balance', value: 45, unit: '秒' },
  { id: '2', date: '2024-02-20', type: 'balance', value: 52, unit: '秒' },
  { id: '3', date: '2024-03-10', type: 'flexibility', value: 18, value2: 5, unit: '厘米' },
  { id: '4', date: '2024-04-05', type: 'flexibility', value: 22, value2: 8, unit: '厘米' },
  { id: '5', date: '2024-01-15', type: 'core', value: 180, unit: '秒' },
  { id: '6', date: '2024-02-20', type: 'core', value: 210, unit: '秒' },
  { id: '7', date: '2024-03-10', type: 'cardio', value: 30, unit: '分钟' },
  { id: '8', date: '2024-04-05', type: 'cardio', value: 45, unit: '分钟' },
];

export const mockWorkouts: Workout[] = [
  { id: '1', date: '2024-05-01', exercise: '卧推', weight: 80, sets: 4, reps: 12 },
  { id: '2', date: '2024-05-01', exercise: '深蹲', weight: 100, sets: 4, reps: 10 },
  { id: '3', date: '2024-05-03', exercise: '硬拉', weight: 120, sets: 3, reps: 8 },
  { id: '4', date: '2024-05-05', exercise: '引体向上', weight: 0, sets: 4, reps: 15 },
  { id: '5', date: '2024-05-07', exercise: '双杠臂屈伸', weight: 20, sets: 3, reps: 12 },
];

export const mockBooks: Book[] = [
  { id: '1', title: '反倦怠能量站', author: '刀熊', category: '心理', coverUrl: '/book-cover.jpg', dataUrl: '/book-data.jpg', status: 'completed', readDate: '2024-03-15' },
  { id: '7', title: '基督山伯爵', author: '大仲马', category: '文学', coverUrl: '/monte-cristo-cover.jpg', dataUrl: '/monte-cristo-data.png', status: 'completed', readDate: '2025-05-11' },
  { id: '2', title: '活着', author: '余华', category: '文学', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', status: 'completed', readDate: '2024-02-20' },
  { id: '3', title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop', status: 'reading' },
  { id: '4', title: '思考快与慢', author: '丹尼尔·卡尼曼', category: '心理', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', status: 'planned' },
  { id: '5', title: '道德经', author: '老子', category: '哲学', coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop', status: 'completed', readDate: '2024-01-10' },
  { id: '6', title: '庄子', author: '庄周', category: '哲学', coverUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop', status: 'completed', readDate: '2024-01-25' },
];

export const mockArticles: Article[] = [
  { id: '1', title: '关于时间的思考', content: '时间是我们最公平的资源，每个人每天都拥有24小时。然而，如何利用这24小时，却决定了人与人之间的差距。\n\n我开始意识到，时间管理的本质不是追求效率，而是选择。选择把时间花在哪里，选择做什么不做什么。\n\n最近我在实践一种新的时间观：把时间当作朋友，而不是敌人。不要和时间赛跑，而是和时间一起成长。', category: '方法论', publishDate: '2024-04-15' },
  { id: '2', title: '健身的哲学', content: '健身不仅是锻炼身体，更是一种修行。在举重中，我学会了耐心；在突破极限时，我学会了勇气；在坚持中，我学会了自律。\n\n身体的肌肉可以通过训练变得强大，精神的肌肉同样可以。通过健身，我明白了什么是真正的进步——不是一蹴而就，而是日积月累。', category: '人生观', publishDate: '2024-03-28' },
  { id: '3', title: '阅读的意义', content: '在这个信息爆炸的时代，为什么还要坚持阅读？\n\n因为阅读是一种深度思考的方式。短视频可以带来即时的快乐，但书籍能带来持久的智慧。\n\n每一本好书都是作者毕生智慧的结晶，我们用几天的时间就能吸收他人一生的经验，这是多么划算的交易。', category: '价值观', publishDate: '2024-03-10' },
];

export const mockSkills: Skill[] = [
  { id: '1', type: 'sword', title: '剑花基础', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1541533848490-bc8115cd6522?w=400&h=300&fit=crop', level: 'intermediate', description: '基础的剑花动作，包括云剑、劈剑、刺剑等基本招式。' },
  { id: '2', type: 'sword', title: '剑花进阶', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400&h=300&fit=crop', level: 'advanced', description: '进阶的剑法组合，动作连贯，气势如虹。' },
  { id: '3', type: 'boxing', title: '反应球训练', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&fit=crop', level: 'intermediate', description: '拳击反应球训练，提升反应速度和手眼协调。' },
  { id: '4', type: 'nunchaku', title: '双节棍入门', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', level: 'beginner', description: '双节棍基本持握和简单挥舞。' },
  { id: '5', type: 'nunchaku', title: '双节棍招式', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', level: 'advanced', description: '进阶双节棍招式，动作华丽流畅。' },
  { id: '6', type: 'calligraphy', title: '楷书基础', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=400&h=300&fit=crop', level: 'intermediate', description: '毛笔字楷书基础练习，横竖撇捺。' },
  { id: '7', type: 'calligraphy', title: '行书创作', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', coverUrl: 'https://images.unsplash.com/photo-1566211452941-62e3c7c166d3?w=400&h=300&fit=crop', level: 'advanced', description: '行书书法创作，笔走龙蛇。' },
];

export const mockHobbies: Hobby[] = [
  { id: '1', type: 'music', title: '发现古典乐', content: '开始聆听古典音乐，感受音符中的情感与故事。', date: '2024-01-15', milestone: true },
  { id: '2', type: 'music', title: '收藏黑胶唱片', content: '购入第一张黑胶唱片，体验复古的听觉享受。', date: '2024-03-20', milestone: true },
  { id: '3', type: 'tea', title: '普洱茶入门', content: '开始学习品鉴普洱茶，感受时间的味道。', date: '2024-02-10', milestone: true },
  { id: '4', type: 'tea', title: '茶道体验', content: '参加茶道体验课，初步了解茶文化的精髓。', date: '2024-04-05', milestone: true },
  { id: '5', type: 'building', title: '完成大型建筑', content: '历时一个月完成大型积木建筑作品。', date: '2024-03-15', milestone: true },
  { id: '6', type: 'gaming', title: '达成游戏成就', content: '在游戏中达成全成就，感受到成就感。', date: '2024-04-20', milestone: true },
];

export const mockSchedules: Schedule[] = [
  { id: '1', date: '2024-05-10', timeSlot: '06:00-07:00', activity: '晨跑' },
  { id: '2', date: '2024-05-10', timeSlot: '07:00-08:00', activity: '早餐' },
  { id: '3', date: '2024-05-10', timeSlot: '08:00-12:00', activity: '工作' },
  { id: '4', date: '2024-05-10', timeSlot: '12:00-13:00', activity: '午餐' },
  { id: '5', date: '2024-05-10', timeSlot: '13:00-14:00', activity: '午休' },
  { id: '6', date: '2024-05-10', timeSlot: '14:00-18:00', activity: '工作' },
  { id: '7', date: '2024-05-10', timeSlot: '18:00-19:00', activity: '健身' },
  { id: '8', date: '2024-05-10', timeSlot: '19:00-20:00', activity: '晚餐' },
  { id: '9', date: '2024-05-10', timeSlot: '20:00-22:00', activity: '阅读/学习' },
  { id: '10', date: '2024-05-10', timeSlot: '22:00-23:00', activity: '休闲娱乐' },
];

export const mockHappiness: Happiness[] = [
  { id: '1', date: '2024-05-01', event: '完成马拉松训练', level: 9 },
  { id: '2', date: '2024-05-03', event: '读完《人类简史》', level: 8 },
  { id: '3', date: '2024-05-05', event: '学会新的剑法', level: 9 },
  { id: '4', date: '2024-05-07', event: '和朋友喝茶聊天', level: 8 },
  { id: '5', date: '2024-05-09', event: '完成积木作品', level: 9 },
  { id: '6', date: '2024-05-10', event: '早起晨跑', level: 7 },
];
