/** Dependency-free integrity checks for generated pages and provenance. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects,studies,toolGroups,landing,technicalCapabilities } from '../minecraft-work/content.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const assets=JSON.parse(read('minecraft-work/assets.json'));
assert.equal(projects.length,6);assert.equal(studies.length,9);
assert.equal(new Set([...projects,...studies].map(p=>p.slug)).size,15);
assert.equal(assets.length,67);assert.ok(assets.every(a=>!a.error));
const inventory=toolGroups.flatMap(group=>group.tools);
assert.equal(new Set(inventory.map(tool=>tool.id)).size,inventory.length,'Tool IDs must be unique');
assert.ok(inventory.every(tool=>tool.name&&tool.evidence),'Every published tool needs evidence');
for(const capability of technicalCapabilities) for(const id of capability.toolIds) assert.ok(inventory.some(tool=>tool.id===id),`Unknown representative tool: ${id}`);
for(const p of [...projects,...studies]) {
 const images=assets.filter(a=>a.slug===p.slug);
 assert.equal(images.length,p.captions.length,`Descriptions must map exactly: ${p.slug}`);
 for(const a of images){
  assert.match(a.originalSourceUrl,/^https:\/\/(?:bassfreerunning\.weebly\.com\/uploads\/|static\.planetminecraft\.com\/files\/resource_media\/screenshot\/)/);
  assert.ok(a.width>0&&a.height>0);assert.match(a.contentType,/^image\//);
  assert.ok(fs.existsSync(path.join(root,a.original)));
  for(const v of a.variants){assert.ok(v.width<=a.width,'No image upscaling');assert.ok(fs.existsSync(path.join(root,v.src)));}
 }
}
const references=JSON.parse(read('minecraft-work/autumn-wind/reference-assets.json'));
assert.equal(references.length,3);
for(const a of references) {
 assert.ok(fs.existsSync(path.join(root,a.original)));
 assert.match(a.originalSourceUrl,/^https:\/\/i\.imgur\.com\//);
 assert.ok(a.alt&&a.caption&&a.sourceProject);
 if (a.inlineVideo) assert.ok(fs.existsSync(path.join(root,a.inlineVideo.src)));
 for(const v of a.variants) { assert.ok(v.width<=(a.sourceWidth||a.width)); assert.ok(fs.existsSync(path.join(root,v.src))); }
}
const routes=['/minecraft-work/',...[...projects,...studies].map(p=>`/minecraft-work/${p.slug}/`)];
for(const route of routes){
 const html=read(route+'index.html');
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.includes(`rel="canonical" href="https://lawrencedinh.com${route}"`));
 assert.ok(read('sitemap.xml').includes(`https://lawrencedinh.com${route}`));
 for(const match of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)){
  const url=new URL(match[1].replaceAll('&amp;','&'),'https://lawrencedinh.com');
  const local=path.join(root,decodeURIComponent(url.pathname));
  assert.ok(fs.existsSync(local),`Broken local destination: ${route} → ${url.pathname}`);
 }
 assert.ok(!/<img[^>]+src="https:\/\/(?:bassfreerunning|i\.imgur)/.test(html),'Images must be local');
}
const index=read('minecraft-work/index.html');
const opening=index.slice(index.indexOf('<section id="featured"'),index.indexOf('<section class="gd-section" id="selected"'));
const selected=index.slice(index.indexOf('<section class="gd-section" id="selected"'),index.indexOf('<section class="gd-tools'));
assert.ok(index.includes(landing.title.replaceAll('&','&amp;')));
assert.deepEqual(technicalCapabilities.map(group=>group.title),['Environment Design','Game Development','Project Delivery']);
assert.ok(technicalCapabilities.every(group=>group.description&&group.evidence));
assert.equal((opening.match(/class="gd-capability-group"/g)||[]).length,3);
assert.ok(opening.includes('id="capabilities-heading"'));
assert.ok(opening.includes('href="#tools-workflow"'));
assert.equal((index.match(/id="tools-workflow"/g)||[]).length,1);
assert.equal((index.match(/<section class="gd-tool-group"/g)||[]).length,toolGroups.filter(group=>group.tools.length&&group.showInInventory!==false).length);
for(const group of toolGroups.filter(group=>!group.tools.length)) assert.ok(!index.includes(`id="tool-group-${group.id}"`),'Empty tool categories must stay hidden');
assert.ok(!index.includes('id="tool-group-collaboration"'));
assert.ok(!opening.includes('Scripting &amp; QA'));
assert.equal((opening.match(/data-feature-slide=/g)||[]).length,landing.featuredSlugs.length);
assert.deepEqual([...opening.matchAll(/<h3><a class="gd-build-title-link" href="([^"]+)"/g)].map(match=>match[1]),landing.featuredSlugs.map(slug=>`/minecraft-work/${slug}/`));
assert.equal((selected.match(/class="gd-card-link"/g)||[]).length,3);
assert.deepEqual([...selected.matchAll(/class="gd-build-title-link" href="\/minecraft-work\/([^/]+)\//g)].map(match=>match[1]),[
 'autumn-wind','castle-spawn','moneywars-map',
 'strandbeest-study','pokemeadows-spawn','organics-study','opblocks-candy-environments',
 'tower-study','gazamo-trial','desert-spawn','plan-c2',
 'pixelmon-town','terrain-spawn','arcade-hub','downgrade-map',
]);
assert.equal((selected.match(/class="gd-study-link"/g)||[]).length,projects.length-3+studies.length);
assert.ok(!index.includes('id="studies-heading"'));
for (const study of studies) assert.ok(selected.includes(`data-gallery="${study.slug}"`));
assert.ok(selected.includes('/minecraft-work/opblocks-candy-environments/'));
for(const build of [...projects,...studies]) {
 assert.equal((selected.match(new RegExp(`class="(?:gd-study-link|gd-card-image gd-image-preview)"[^>]*data-gallery="${build.slug}"`, 'g'))||[]).length,1,`Selected Work must include ${build.slug} exactly once`);
 assert.ok(selected.includes(`/minecraft-work/${build.slug}/`));
}
for(const project of [...projects,...studies]) assert.ok(index.includes('/minecraft-work/'+project.slug+'/'));
assert.ok(!selected.includes('loading="eager"'));
assert.ok(opening.includes('href="/projects.html"'));
assert.ok(index.indexOf('id="selected"')<index.indexOf('id="tools-heading"'));
assert.ok(index.indexOf('id="tools-heading"')<index.indexOf('id="related-heading"'));
assert.ok(!index.includes('How I Approach the Work'));
assert.equal((read('minecraft-work/pixelmon-town/index.html').match(/data-gallery=/g)||[]).length,1);
assert.equal((read('minecraft-work/autumn-wind/index.html').match(/Dr_Bond/g)||[]).length,1,'Autumn Wind collaboration credit appears once');
assert.match(read('minecraft-work/autumn-wind/index.html'), /data-gallery="autumn-wind" data-image-index="6"/);
assert.ok(index.includes('href="https://www.linkedin.com/in/lawrence-dinh-profile/"'));
console.log('Passed: 16 static routes, 67 gallery images plus 3 reference media, local destinations, credits, technical opening, selected-work ordering, featured slideshow, and metadata.');

for (const route of routes) {
 const legacy=route.replace('/minecraft-work/','/game-design/');
 const html=read(legacy+'index.html');
 assert.ok(html.includes('location.search + location.hash'));
 assert.ok(html.includes('https://lawrencedinh.com'+route));
 assert.ok(!read('sitemap.xml').includes('https://lawrencedinh.com'+legacy));
}
