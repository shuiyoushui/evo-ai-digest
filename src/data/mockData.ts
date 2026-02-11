export interface Product {
  id: string;
  rank: number;
  name: string;
  slogan: string;
  description: string;
  logo: string;
  tags: string[];
  category: string;
  upvotes: number;
  views: number;
  comments: number;
  website: string;
  videoUrl?: string;
  verified: boolean;
  featured: boolean;
  maker: { name: string; avatar: string; title: string };
  company: { name: string; founded: string; location: string; funding?: string };
  benefits: string[];
  launchDate: string;
}

export const categories = [
  { id: "agents", label: "AI Agents", icon: "🤖", count: 128 },
  { id: "productivity", label: "效率工具", icon: "⚡", count: 95 },
  { id: "imagegen", label: "图像生成", icon: "🎨", count: 87 },
  { id: "devtools", label: "开发者工具", icon: "🛠️", count: 76 },
  { id: "writing", label: "写作", icon: "✍️", count: 63 },
  { id: "marketing", label: "营销", icon: "📈", count: 41 },
];

export const products: Product[] = [
  {
    id: "1", rank: 1, name: "Cursor",
    slogan: "AI驱动的代码编辑器，让编程速度提升10倍",
    description: "Cursor是一款革命性的AI代码编辑器，内置GPT-4和Claude，能够理解你的整个代码库。它提供智能代码补全、自然语言编辑、以及强大的代码生成能力，让开发者的生产力提升到一个全新的水平。\n\n### 核心功能\n- **智能补全**: 基于上下文的AI代码建议\n- **自然语言编辑**: 用中文描述你想要的改动\n- **代码库理解**: AI能理解你的整个项目结构\n- **多模型支持**: 同时支持GPT-4、Claude等顶级模型",
    logo: "", tags: ["编辑器", "AI编程", "开发工具"], category: "devtools",
    upvotes: 2847, views: 45200, comments: 312, website: "https://cursor.sh",
    verified: true, featured: true,
    maker: { name: "Aman Sanger", avatar: "", title: "CEO & Co-founder" },
    company: { name: "Anysphere", founded: "2022", location: "旧金山", funding: "B轮 $60M" },
    benefits: ["代码编写速度提升10倍", "支持多种AI模型", "理解整个代码库上下文", "自然语言编辑代码"],
    launchDate: "2024-03-15",
  },
  {
    id: "2", rank: 2, name: "Midjourney",
    slogan: "用文字创造令人惊叹的艺术作品",
    description: "Midjourney是领先的AI图像生成平台，通过简单的文字描述即可创造出专业级别的艺术作品和设计。V6版本带来了前所未有的图像质量和创作控制能力。",
    logo: "", tags: ["图像生成", "AI艺术", "设计"], category: "imagegen",
    upvotes: 2341, views: 38900, comments: 256, website: "https://midjourney.com",
    verified: true, featured: true,
    maker: { name: "David Holz", avatar: "", title: "创始人" },
    company: { name: "Midjourney Inc.", founded: "2021", location: "旧金山", funding: "自盈利" },
    benefits: ["V6模型画质惊艳", "自然语言控制创作", "风格一致性强", "商业可用授权"],
    launchDate: "2024-01-10",
  },
  {
    id: "3", rank: 3, name: "Kimi",
    slogan: "20万字超长上下文AI助手，中文理解更出色",
    description: "Kimi是由月之暗面(Moonshot AI)推出的AI助手，支持20万字超长上下文，在中文理解和生成方面表现卓越。",
    logo: "", tags: ["AI助手", "长文本", "中文"], category: "productivity",
    upvotes: 1956, views: 32100, comments: 189, website: "https://kimi.moonshot.cn",
    verified: true, featured: false,
    maker: { name: "杨植麟", avatar: "", title: "创始人 & CEO" },
    company: { name: "月之暗面", founded: "2023", location: "北京", funding: "B轮 $10亿" },
    benefits: ["20万字超长上下文", "中文理解能力强", "支持文档/网页解析", "免费使用额度充足"],
    launchDate: "2024-02-20",
  },
  {
    id: "4", rank: 4, name: "Devin",
    slogan: "全球首个AI软件工程师，自主完成开发任务",
    description: "Devin是Cognition推出的全球首个AI软件工程师。它可以自主规划和执行复杂的工程任务。",
    logo: "", tags: ["AI工程师", "自动化", "编程"], category: "agents",
    upvotes: 1823, views: 28700, comments: 203, website: "https://devin.ai",
    verified: true, featured: false,
    maker: { name: "Scott Wu", avatar: "", title: "CEO" },
    company: { name: "Cognition", founded: "2023", location: "旧金山", funding: "A轮 $21M" },
    benefits: ["自主完成开发任务", "能学习新技术", "端到端项目交付", "减少人工干预"],
    launchDate: "2024-03-12",
  },
  {
    id: "5", rank: 5, name: "Sora",
    slogan: "OpenAI文生视频模型，创造逼真视频内容",
    description: "Sora是OpenAI推出的文生视频AI模型，能够根据文字描述生成长达60秒的高质量视频。",
    logo: "", tags: ["文生视频", "OpenAI", "内容创作"], category: "marketing",
    upvotes: 1647, views: 51200, comments: 178, website: "https://openai.com/sora",
    verified: true, featured: true,
    maker: { name: "Sam Altman", avatar: "", title: "CEO" },
    company: { name: "OpenAI", founded: "2015", location: "旧金山", funding: "$13B+" },
    benefits: ["最长60秒视频", "物理世界理解", "多角度镜头", "细节极其逼真"],
    launchDate: "2024-02-15",
  },
  {
    id: "6", rank: 6, name: "Jasper AI",
    slogan: "企业级AI内容营销平台",
    description: "Jasper是面向企业的AI内容营销平台，帮助品牌快速生成高质量的营销文案、社交媒体内容、邮件和广告素材。",
    logo: "", tags: ["营销", "文案", "内容生成"], category: "marketing",
    upvotes: 1432, views: 22300, comments: 134, website: "https://jasper.ai",
    verified: true, featured: false,
    maker: { name: "Dave Rogenmoser", avatar: "", title: "CEO" },
    company: { name: "Jasper AI", founded: "2021", location: "奥斯汀", funding: "A轮 $125M" },
    benefits: ["品牌语调一致", "50+内容模板", "团队协作", "SEO优化建议"],
    launchDate: "2024-01-28",
  },
  {
    id: "7", rank: 7, name: "Notion AI",
    slogan: "在你的工作空间内获得AI超能力",
    description: "Notion AI将AI能力深度集成到Notion工作空间中，让你在笔记、文档、项目管理中随时调用AI辅助写作、总结、翻译和头脑风暴。",
    logo: "", tags: ["生产力", "写作", "笔记"], category: "writing",
    upvotes: 1289, views: 19800, comments: 98, website: "https://notion.so",
    verified: true, featured: false,
    maker: { name: "Ivan Zhao", avatar: "", title: "CEO & Co-founder" },
    company: { name: "Notion Labs", founded: "2016", location: "旧金山", funding: "C轮 $275M" },
    benefits: ["无缝集成工作流", "智能写作助手", "内容总结提炼", "多语言翻译"],
    launchDate: "2024-04-01",
  },
  {
    id: "8", rank: 8, name: "V0.dev",
    slogan: "用自然语言生成React组件和UI界面",
    description: "V0是Vercel推出的AI驱动UI生成工具，使用自然语言描述即可快速生成基于React和Tailwind CSS的精美组件。",
    logo: "", tags: ["UI生成", "React", "前端"], category: "devtools",
    upvotes: 1156, views: 17600, comments: 87, website: "https://v0.dev",
    verified: true, featured: false,
    maker: { name: "Guillermo Rauch", avatar: "", title: "CEO" },
    company: { name: "Vercel", founded: "2015", location: "旧金山", funding: "D轮 $150M" },
    benefits: ["自然语言生成UI", "Shadcn/UI集成", "即时预览", "代码可直接使用"],
    launchDate: "2024-05-10",
  },
  {
    id: "9", rank: 9, name: "DeepSeek",
    slogan: "开源高性能大语言模型，媲美GPT-4",
    description: "DeepSeek是国产开源大模型，在代码生成、数学推理等方面表现出色，支持128K上下文。",
    logo: "", tags: ["大模型", "开源", "推理"], category: "agents",
    upvotes: 2105, views: 41000, comments: 267, website: "https://deepseek.com",
    verified: true, featured: false,
    maker: { name: "梁文峰", avatar: "", title: "创始人" },
    company: { name: "深度求索", founded: "2023", location: "杭州", funding: "天使轮" },
    benefits: ["完全开源", "128K超长上下文", "代码能力强", "中文表现优秀"],
    launchDate: "2024-06-01",
  },
  {
    id: "10", rank: 10, name: "Copilot",
    slogan: "GitHub官方AI编程助手，代码自动补全",
    description: "GitHub Copilot 是微软推出的AI编程助手，深度集成在VS Code和JetBrains中，实时提供代码建议。",
    logo: "", tags: ["编程", "自动补全", "GitHub"], category: "devtools",
    upvotes: 1870, views: 35600, comments: 198, website: "https://github.com/features/copilot",
    verified: true, featured: false,
    maker: { name: "Thomas Dohmke", avatar: "", title: "CEO" },
    company: { name: "GitHub (Microsoft)", founded: "2008", location: "旧金山", funding: "微软子公司" },
    benefits: ["IDE深度集成", "多语言支持", "Chat模式交互", "企业级安全"],
    launchDate: "2024-01-05",
  },
];

export const relatedProducts = products.slice(3, 6);

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export const mockComments: Comment[] = [
  { id: "c1", user: "张三", avatar: "张", text: "非常好用的工具，写代码效率提升了很多！强烈推荐给所有开发者。", time: "2小时前" },
  { id: "c2", user: "李四", avatar: "李", text: "请问支持Python吗？想用来做数据分析方面的开发。", time: "5小时前" },
  { id: "c3", user: "王五", avatar: "王", text: "已经用了一个月了，确实是目前最好的AI编程助手，没有之一。", time: "1天前" },
];

export interface InquiryRequest {
  id: string;
  projectName: string;
  serviceType: string;
  contact: string;
  phone: string;
  budget: string;
  date: string;
  status: string;
}

export const mockInquiries: InquiryRequest[] = [
  { id: "i1", projectName: "Cursor", serviceType: "CSDN展示广告", contact: "张经理", phone: "138****1234", budget: "5万-10万", date: "2024-03-20", status: "待处理" },
  { id: "i2", projectName: "Midjourney", serviceType: "CSDN非标合作", contact: "李总", phone: "139****5678", budget: "10万-20万", date: "2024-03-19", status: "待处理" },
  { id: "i3", projectName: "DeepSeek", serviceType: "CSDN频道精准", contact: "王经理", phone: "137****9012", budget: "3万-5万", date: "2024-03-18", status: "已跟进" },
  { id: "i4", projectName: "Kimi", serviceType: "站外付费流量", contact: "赵总", phone: "136****3456", budget: "20万以上", date: "2024-03-17", status: "已完成" },
  { id: "i5", projectName: "Sora", serviceType: "CSDN展示广告", contact: "孙经理", phone: "135****7890", budget: "5万-10万", date: "2024-03-16", status: "待处理" },
  { id: "i6", projectName: "V0.dev", serviceType: "CSDN频道精准", contact: "周总", phone: "134****2345", budget: "3万-5万", date: "2024-03-15", status: "已跟进" },
];
