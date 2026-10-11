// app.js —— 页面交互层（渐进增强）
// 原则：HTML 里的 <a href="#栏目ID"> 本身就能跳转，JS 只负责"告诉用户现在在哪"
// 和提升体验；JS 失效时页面仍可正常阅读、锚点跳转一切照常。
//
// 职责清单：
//   1. 顶部阅读进度条
//   2. 返回顶部按钮（滚过大半屏出现，点击平滑回顶）
//   3. 当前栏目高亮（导航下划线）+ 右下角栏目指示器
//   4. 栏目进入视口时淡入（IntersectionObserver）
//
// 分工约定：JS 只切换类名/写文字（管状态），外观全部由 styles.css 负责（管样子）。

// ---------- 元素引用 ----------
const progressBar = document.querySelector('#reading-progress')
const indicator = document.querySelector('#section-indicator')
const toTopButton = document.querySelector('#to-top')
const navLinks = document.querySelectorAll('nav a')

// 页面上所有栏目：hero 是首屏，其余是 section，两类都要监视。
const sections = document.querySelectorAll('main .hero[id], main section[id]')

// 导航链接的文字就是栏目的中文名，直接据此建对照表。
// 好处：以后在 HTML 里加一个栏目，这个文件一行都不用改。
const sectionNames = new Map()
navLinks.forEach(link => {
  sectionNames.set(link.getAttribute('href'), link.textContent.trim())
})

// ---------- 1. 阅读进度条 ----------
// 已滚距离 ÷ 可滚总距离 = 阅读比例。分母为 0（页面太短）时先挡住，避免 NaN。
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
  progressBar.style.width = `${ratio * 100}%`
}

// ---------- 2. 返回顶部 ----------
toTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // 回顶后地址栏的 # 还停在原栏目，手动同步高亮，避免徽标与实际位置不符
  history.replaceState(null, '', location.pathname)
  showCurrent('#about')
})

// ---------- 3. 当前栏目高亮 + 指示器 ----------
function showCurrent(hash) {
  // 没有 # 时默认第一个栏目，否则刚打开页面什么都不高亮
  const current = hash || '#about'

  indicator.textContent = sectionNames.get(current) || ''

  navLinks.forEach(link => {
    const isCurrent = link.getAttribute('href') === current
    link.classList.toggle('is-current', isCurrent)

    // aria-current 告诉读屏软件"当前在这一项"，视觉不可见但无障碍必需
    if (isCurrent) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })
}

// 点导航、按前进/后退键都会改变 hash → 高亮跟着走。
// 注意："监听变化"和"打开时先做一次"是两件事，缺一不可——
// 直接打开 index.html#skills 时 hash 没有变化过，不先调一次就不会高亮。
window.addEventListener('hashchange', () => showCurrent(location.hash))
showCurrent(location.hash)

// ---------- 滚动事件 ----------
// 按钮显隐与进度条共用一个监听器：scroll 一秒触发几十次，监听器越少越好。
function handleScroll() {
  // 用屏高比例而不是写死像素，手机/电脑都合适
  toTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6)
  updateProgress()
}
window.addEventListener('scroll', handleScroll)

// 首屏先算一次：刷新时浏览器可能已把页面停在中间，进度条不能停在 0
updateProgress()

// ---------- 4a. 滚动时高亮自动跟随 ----------
// IntersectionObserver 是浏览器内置的"进出视口监视器"，只在元素真的
// 进出时通知，比在 scroll 里反复计算七个栏目位置省性能。
const spy = new IntersectionObserver(
  entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) showCurrent(`#${entry.target.id}`)
    }
  },
  {
    // 判定范围上下各收窄 45%，只剩屏幕中间一条：
    // 栏目必须滚到屏幕正中间才算"进入"，避免高亮来回乱跳
    rootMargin: '-45% 0px -45% 0px',
  },
)
sections.forEach(section => spy.observe(section))

// ---------- 4b. 栏目进入视口时淡入上移 ----------
const reveal = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      // 只淡入一次，往回滚不再重复触发，省性能
      observer.unobserve(entry.target)
    }
  },
  { threshold: 0.15 },
)
sections.forEach(section => reveal.observe(section))
