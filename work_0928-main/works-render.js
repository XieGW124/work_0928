// 第 5 课：把数据渲染成页面，并支持筛选和排序。
//
// 这个文件里没有一处写死的作品标题或网址——**全部来自 works-data.js**。
// 想加作品、改标题、换封面，都只动数据文件。这就是"数据与视图分离"。

// ---------- 当前的筛选和排序状态 ----------
// 把"界面现在是什么状态"集中放在这里，而不是散落在各个函数里。
// 状态一改就重新渲染一次，界面永远跟着状态走。
let activeTag = '全部'
let newestFirst = true

// ---------- 把一条数据变成一张卡片 ----------
function createWorkCard(work) {
  const item = document.createElement('li')
  item.className = 'work-card'

  // 年份徽标：放进封面里，卡片倾斜时靠反向旋转保持水平
  const year = document.createElement('span')
  year.className = 'work-year'
  year.textContent = work.year

  const link = document.createElement('a')
  link.href = work.url
  link.target = '_blank'
  // 凡是 target="_blank" 的外链都要带上它，防止新页面反过来操纵本页
  link.rel = 'noopener noreferrer'

  const cover = document.createElement('div')
  cover.className = 'work-cover'
  const image = document.createElement('img')
  image.src = work.image
  // alt 要说清楚图上是什么，不能只写"图片"
  image.alt = `${work.title}的网页截图`
  // 写死宽高是为了让浏览器提前留好位置，图片加载时页面不会"跳一下"
  image.width = 1200
  image.height = 800
  cover.append(image, year)

  const copy = document.createElement('div')
  copy.className = 'work-copy'
  const title = document.createElement('h3')
  // 用 textContent 而不是 innerHTML：数据里万一有 < > 会被当成纯文字，不会被当成标签执行
  title.textContent = work.title
  const description = document.createElement('p')
  description.textContent = work.description
  copy.append(title, description)

  link.append(cover, copy)
  item.append(link)
  return item
}

// ---------- 按当前状态算出要显示哪些、按什么顺序 ----------
function getVisibleWorks() {
  // filter 保留满足条件的元素，返回**新数组**，不动原数组。
  // 原数组 works 从头到尾不变，这样反复筛选也不会把数据越筛越少。
  const filtered =
    activeTag === '全部' ? works : works.filter(work => work.tags.includes(activeTag))

  // sort 会**就地排序**（改动原数组），所以先用展开语法复制一份再排。
  // 忘了复制的话，切换几次排序，原始数据的顺序就被打乱了。
  return [...filtered].sort((a, b) => (newestFirst ? b.year - a.year : a.year - b.year))
}

// ---------- 渲染列表 ----------
function renderWorks() {
  const list = document.querySelector('.portfolio-list')
  const items = getVisibleWorks()
  const fragment = document.createDocumentFragment()

  if (items.length === 0) {
    // 没有作品时要说一句话，不能让列表空着
    const empty = document.createElement('li')
    empty.className = 'works-empty'
    empty.textContent = '这个标签下还没有作品。'
    fragment.append(empty)
  } else {
    // forEach 逐条处理。四条数据 → 四张卡片，代码只写一遍。
    items.forEach(work => fragment.append(createWorkCard(work)))
  }

  // 先把卡片都放进 fragment（一个"暂存容器"），最后一次性塞进页面。
  // 好处：浏览器只重排一次，不是每加一张卡就重排一次。
  // replaceChildren 会先清空再放入，所以重复调用不会越加越多。
  list.replaceChildren(fragment)
}

// ---------- 根据数据自动生成标签按钮 ----------
function renderTags() {
  const box = document.querySelector('#works-tags')

  // flatMap 把每个作品的 tags 数组摊平成一个大数组；
  // new Set 去重（Set 里同样的值只存一份）；再展开回数组。
  // 这样标签列表**完全由数据决定**，以后加一个新标签不用改这里。
  const tags = ['全部', ...new Set(works.flatMap(work => work.tags))]

  box.replaceChildren(
    ...tags.map(tag => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = tag
      // aria-pressed 既让 CSS 知道该高亮谁，也告诉读屏软件"这个按钮是按下状态"
      button.setAttribute('aria-pressed', String(tag === activeTag))
      button.addEventListener('click', () => {
        activeTag = tag
        renderTags() // 重画按钮，更新高亮
        renderWorks() // 重画列表
      })
      return button
    }),
  )
}

// ---------- 排序按钮 ----------
const sortButton = document.querySelector('#works-sort')
sortButton.addEventListener('click', () => {
  newestFirst = !newestFirst
  sortButton.textContent = newestFirst ? '按年份：新→旧' : '按年份：旧→新'
  renderWorks()
})

// ---------- 首次渲染 ----------
renderTags()
renderWorks()
