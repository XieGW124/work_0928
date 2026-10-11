// 个人主页自检脚本
//
// 用法：node tools/check-page.mjs
//
// 它做三件事，都是人工检查很容易漏、机器检查很快的：
//   1. 必须有的文件在不在
//   2. index.html 里引用的本地文件（css / js / 图片）是不是真的存在
//   3. 页内锚点 #xxx 有没有对应的 id
//
// 不依赖任何第三方包，Node 24 自带的能力就够。
// GitHub Actions 里也跑这一条，所以推上去之前先在本地跑一次。

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const problems = [];
const ok = (msg) => console.log('  [OK]', msg);
const bad = (msg) => { problems.push(msg); console.log('  [X] ', msg); };

console.log('== 1. 必须有的文件 ==');
for (const name of ['index.html', 'styles.css', 'app.js']) {
  if (fs.existsSync(path.join(root, name))) ok(name);
  else bad(`缺少 ${name}`);
}

const htmlPath = path.join(root, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.log('\n找不到 index.html，后面的检查没法做。');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('\n== 2. index.html 引用的本地文件 ==');
// 取出所有 href/src，跳过外部链接和「不是文件」的那几种写法：
//   http(s):  外部网址        //        协议相对网址
//   mailto:   发邮件          tel:      打电话
//   data:     内嵌数据        #         页内锚点
// 这里用「有没有冒号协议头」来判断，比一个个列举更稳妥——
// 以后加 sms: 、geo: 之类的也不用再改这一行。
const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((v) => !/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(v));

for (const ref of [...new Set(refs)]) {
  const target = path.join(root, ref.split('?')[0].split('#')[0]);
  if (fs.existsSync(target)) ok(ref);
  else bad(`引用了不存在的文件：${ref}`);
}

console.log('\n== 3. 页内锚点 ==');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))];
for (const anchor of anchors) {
  // 手册示例里的占位符不算问题
  if (anchor === '栏目ID') continue;
  if (ids.has(anchor)) ok(`#${anchor}`);
  else bad(`导航指向 #${anchor}，但页面里没有 id="${anchor}"`);
}

console.log('\n== 4. 图片的 alt ==');
// alt 是图片加载失败时的替代文字，也是视障用户理解图片的唯一途径。
// 它很容易在改代码时被删掉，而且**页面看起来完全正常**，人工发现不了——
// 这正是最适合交给机器查的那类问题。
const WEAK_ALT = new Set(['图片', '照片', 'image', 'photo', 'img']);
const imgs = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
for (const tag of imgs) {
  const found = tag.match(/alt="([^"]*)"/);
  const brief = tag.slice(0, 60);
  if (!found) bad(`图片缺少 alt：${brief}`);
  else if (!found[1].trim()) bad(`图片的 alt 是空的：${brief}`);
  else if (WEAK_ALT.has(found[1].trim())) bad(`alt 写得太笼统（"${found[1]}"）：${brief}`);
  else ok(found[1]);
}

console.log('');
if (problems.length) {
  console.log(`自检未通过，共 ${problems.length} 个问题，请逐条修好再提交。`);
  process.exit(1);
}
console.log('自检通过。');
