// 第 5 课：作品数据。
//
// 每个对象代表一个作品。**数据和界面完全分开**——
// 想加一个作品，只在这里加一个对象，HTML 一个字都不用动。
// 这是本课最重要的一个观念。
//
// 六个字段各管一件事：
//   title        卡片标题
//   description  一句话说明
//   image        封面图路径
//   url          点击去哪
//   year         年份，用来排序和显示右上角徽标
//   tags         标签数组，用来筛选。一个作品可以有多个标签
const works = [
  {
    title: '长风成卷 · 博客应用',
    description: '文章展示、接口与数据库。',
    image: 'assets/work-blog.png',
    url: 'https://ffd-p2-blog.netlify.app/',
    year: 2026,
    tags: ['前端', '后端', '数据库'],
  },
  {
    title: '群像云图 · 社区应用',
    description: '内容发布与社区互动。',
    image: 'assets/work-community.png',
    url: 'https://ffd-p3-community.netlify.app/',
    year: 2026,
    tags: ['前端', '数据库', '部署'],
  },
  {
    title: '一笺心意 · 祝福卡片',
    description: '卡片制作与作品分享。',
    image: 'assets/work-greeting-card.png',
    url: 'https://ffd-p4-greeting-card.netlify.app/',
    year: 2025,
    tags: ['前端', 'AI'],
  },
  {
    title: '星声音乐站 · 音乐应用',
    description: '网页音频与交互实践。',
    image: 'assets/work-music-station.png',
    url: 'https://ffd-p5-music-station.netlify.app/',
    year: 2025,
    tags: ['前端', '测试'],
  },
]
