/** Generate crawlable GitHub Pages routes from curated content; no runtime build required. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, studies, toolGroups, breakdowns, sourceUrl, landing, technicalCapabilities } from '../minecraft-work/content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const write = (p,s) => { fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true}); fs.writeFileSync(path.join(root,p),s.replace(/[\t ]+$/gm,'')+'\n'); };
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const assets = JSON.parse(read('minecraft-work/assets.json'));
const referenceAssets = JSON.parse(read('minecraft-work/autumn-wind/reference-assets.json'));
const referenceImages = p => referenceAssets.filter(a=>a.slug===p.slug);
const allBuilds = [...projects, ...studies].map(p=>({...p,platform:p.platform || 'Minecraft'}));
const home = read('index.html');
const projectPage = read('projects.html');
const resume = '/'+home.match(/href="([^"]+\.pdf)"/)[1].replace(/^\//,'');
const github = home.match(/href="(https:\/\/github.com\/LawrenceDinh)"/)[1];
const linkedin = home.match(/href="(https:\/\/www.linkedin.com\/in\/[^/"]+\/)"/)[1];
let header = projectPage.match(/<header class="nav"[\s\S]*?<\/header>/)[0]
  .replaceAll(' aria-current="page"','')
  .replace(/href="([^"#/:][^"]*)"/g,(_,href)=>`href="/${href}"`)
  .replaceAll('/index.html#','/#').replaceAll('href="/index.html"','href="/"')
  .replace(/href="#(featured-case-study|current-projects|academic-projects)"/g,'href="/projects.html#$1"')
  .replaceAll('href="/minecraft-work/"','href="/minecraft-work/" aria-current="page"')
  .replace('class="nav-about-link nav-primary-destination nav-projects-link"','class="nav-about-link nav-primary-destination nav-projects-link" aria-current="location"');
const footer = home.match(/<footer>\s*©[\s\S]*?<\/footer>/)[0];
const topButton = projectPage.match(/<button class="back-to-top"[\s\S]*?<\/button>/)[0];
const url = p => `/minecraft-work/${p.slug}/`;
function images(p) {
  const records = assets.filter(a=>a.slug===p.slug && !a.error);
  if (!records.length) throw new Error(`No assets for ${p.slug}`);
  return records.map(a=>({...a,alt:p.captions[Number(a.id.slice(-2))-1],caption:p.captions[Number(a.id.slice(-2))-1],credit:[p.credits?null:p.collaborationCredits,p.galleryCredits??p.sourceCredits,p.imageCredits?.[Number(a.id.slice(-2))] || p.renderCredit].filter(Boolean).join(' · ')}));
}
const cover = p => images(p).find(a=>a.id===`view-${String(p.cover).padStart(2,'0')}`) || images(p)[0];
function img(a,{eager=false,priority=false,sizes='(max-width: 760px) calc(100vw - 40px), (max-width: 1024px) 48vw, 400px',position='50% 50%'}={}) {
  const fallback = a.variants.find(v=>v.width>=960) || a.variants.at(-1);
  if(!a.alt) throw new Error(`Missing image description: ${a.slug}/${a.id}`);
  return `<img src="${esc(fallback.src)}" srcset="${a.variants.map(v=>`${esc(v.src)} ${v.width}w`).join(', ')}" sizes="${sizes}" width="${a.width}" height="${a.height}" alt="${esc(a.alt)}" loading="${eager?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''} style="object-position:${esc(position)}">`;
}
function linkedTitle(title) {
 const [,prefix='',lastWord] = title.match(/^(.*\s)?(\S+)$/u);
 return `${esc(prefix)}<span class="gd-title-tail">${esc(lastWord)} <span aria-hidden="true">&#8599;</span></span>`;
}
function projectLink(p,featured=false,attributes='',eager=featured) {
  const a=cover(p);
  return `<div class="gd-card-link" ${attributes}><a href="${esc(a.original)}" class="gd-card-image gd-image-preview" data-gallery="${p.slug}" data-image-index="${p.cover-1}" aria-label="Enlarge ${esc(p.title)} image">${img(a,{eager,priority:eager,position:p.coverPosition,sizes:featured?'(max-width: 760px) calc(100vw - 80px), (max-width: 1024px) 90vw, 690px':undefined})}</a><div class="gd-card-copy">${p.context?`<p class="gd-meta">${esc(p.context)}</p>`:''}<h3><a class="gd-build-title-link" href="${url(p)}">${linkedTitle(p.title)}</a></h3><p>${esc(p.cardSummary || p.summary)}</p></div></div>`;
}
function workCopy(p,compact=false) {
 const context = compact ? (p.compactContext ?? p.context) : p.context;
 return `<div class="${compact?'':'gd-card-copy '}gd-work-copy"><h3><a class="gd-build-title-link" href="${url(p)}">${linkedTitle(p.title)}</a></h3><div class="gd-work-metadata">${context?`<p class="gd-meta">${esc(context)}</p>`:''}</div><p class="gd-work-description">${esc(p.cardSummary || p.summary)}</p></div>`;
}
function card(p) {
 const a=cover(p);
 return `<article class="gd-card gd-work-card"><div class="gd-card-link"><a href="${esc(a.original)}" class="gd-card-image gd-image-preview" data-gallery="${p.slug}" data-image-index="${p.cover-1}" aria-label="Enlarge ${esc(p.title)} image">${img(a,{position:p.coverPosition})}</a>${workCopy(p)}</div></article>`;
}
const selectedLeadSlugs = ['autumn-wind', 'castle-spawn', 'moneywars-map'];
const selectedCompactSlugs = ['strandbeest-study', 'pokemeadows-spawn', 'organics-study', 'opblocks-candy-environments', 'tower-study', 'gazamo-trial', 'desert-spawn', 'plan-c2'];
const selectedLead = selectedLeadSlugs.map(slug=>allBuilds.find(p=>p.slug===slug));
const selectedCompact = [
 ...selectedCompactSlugs.map(slug=>allBuilds.find(p=>p.slug===slug)),
 ...allBuilds.filter(p=>![...selectedLeadSlugs,...selectedCompactSlugs].includes(p.slug)),
];
const featuredProjects = landing.featuredSlugs.map(slug=>{
 const build=allBuilds.find(p=>p.slug===slug);
 if (!build) throw new Error(`Unknown featured build: ${slug}`);
 return build;
});
function featuredSlideshow() {
 return `<article class="gd-card gd-card--lead" aria-labelledby="gd-title" aria-roledescription="carousel"><header class="gd-feature-heading"><h1 id="gd-title">Minecraft Design &amp; Development</h1></header><div class="gd-feature-slides">${featuredProjects.map((p,i)=>projectLink(p,true,`data-feature-slide="${i}"${i?' inert aria-hidden="true"':''}`,i===0)).join('')}</div><div class="gd-feature-project-row"><a class="gd-text-link gd-feature-project" data-feature-project href="${url(featuredProjects[0])}">View project &#8594;</a></div><div class="writing-featured-card__footer gd-feature-footer gd-feature-actions"><nav class="gd-feature-dots" aria-label="Choose featured project" hidden>${featuredProjects.map((p,i)=>`<button type="button" data-feature-dot="${i}" aria-label="Show ${esc(p.title)}" aria-pressed="${i===0}"></button>`).join('')}</nav><div class="gd-slideshow-controls" hidden><button type="button" data-feature-prev aria-label="Previous featured project">&#8592;</button><span data-feature-count>1 / ${featuredProjects.length}</span><button type="button" data-feature-next aria-label="Next featured project">&#8594;</button><button type="button" data-feature-pause aria-label="Pause slideshow" title="Pause slideshow">&#9208;</button></div></div><div class="gd-feature-progress" aria-hidden="true" hidden><span data-feature-progress></span></div><p class="gd-sr" data-feature-status aria-live="polite" aria-atomic="true"></p></article>`;
}
function detailSlideshow(p) {
 const original=images(p),featured=cover(p);
 const all=[original.find(a=>a.id===featured.id),...original.filter(a=>a.id!==featured.id)],initial=0;
 if(all.length===1) return imageLink(p,all[0],0,true);
 return `<section class="gd-detail-slideshow" data-start-index="${initial}" aria-label="${esc(p.title)} images" aria-roledescription="carousel"><div class="gd-detail-slides">${all.map((a,i)=>`<div data-feature-slide="${i}"${i!==initial?' inert aria-hidden="true"':''}>${imageLink(p,a,original.findIndex(image=>image.id===a.id),i===initial)}</div>`).join('')}</div><div class="gd-detail-controls"><p class="gd-detail-caption" data-detail-caption>${esc(all[initial].caption)}</p><nav class="gd-feature-dots" aria-label="Choose project image" hidden>${all.map((a,i)=>`<button type="button" data-feature-dot="${i}" aria-label="Show image ${i+1}: ${esc(a.alt)}" aria-pressed="${i===initial}"></button>`).join('')}</nav><div class="gd-slideshow-controls" hidden><button type="button" data-feature-prev aria-label="Previous image">&#8592;</button><span data-feature-count>${initial+1} / ${all.length}</span><button type="button" data-feature-next aria-label="Next image">&#8594;</button><button type="button" data-feature-pause aria-label="Pause slideshow" title="Pause slideshow">&#9208;</button></div></div><div class="gd-feature-progress" aria-hidden="true" hidden><span data-feature-progress></span></div><p class="gd-sr" data-feature-status aria-live="polite" aria-atomic="true"></p></section>`;
}
function endActions() {
 return `<section class="gd-contact" aria-labelledby="gd-contact-heading"><div class="gd-contact-intro"><p class="gd-eyebrow">Connect</p><h2 id="gd-contact-heading">Let&#8217;s talk.</h2></div><nav class="gd-contact-actions" aria-label="Portfolio and contact links"><a href="${resume}">Resume PDF &#8599;</a><a href="/projects.html">Engineering work &#8594;</a><a href="${github}">GitHub &#8599;</a><a href="${linkedin}">LinkedIn &#8599;</a><a class="gd-contact-primary" data-open-nav-contact href="/#contact" aria-controls="navContactPanel" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Contact</span></a></nav></section>`;
}
function frame({title,description,route,preview,content,galleries={}}) {
 return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Lawrence Dinh</title><meta name="description" content="${esc(description)}">
<meta name="author" content="Lawrence Dinh"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://lawrencedinh.com${route}">
<meta property="og:site_name" content="Luat “Lawrence” Dinh"><meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)} | Lawrence Dinh"><meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="https://lawrencedinh.com${route}"><meta property="og:image" content="https://lawrencedinh.com${preview.variants.at(-1).src}"><meta property="og:image:alt" content="${esc(preview.alt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)} | Lawrence Dinh"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="https://lawrencedinh.com${preview.variants.at(-1).src}"><meta name="twitter:image:alt" content="${esc(preview.alt)}">
<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/style.css?v=20261022-2">${route==='/minecraft-work/'?'<link rel="stylesheet" href="/writing.css?v=20261021-3">':''}<link rel="stylesheet" href="/minecraft-work/game-design.css?v=20261023-35">
<script src="/display-mode.js?v=20260818-2"></script>
</head><body class="game-design-page${route==='/minecraft-work/'?' portfolio-index-page':''}">
<a class="gd-skip" href="#game-content">Skip to game design content</a>
${header}
${topButton}
<main class="gd-shell${route==='/minecraft-work/'?' portfolio-page-shell':''}" id="game-content">${content}${endActions()}</main>
${route==='/minecraft-work/'?footer.replace('</footer>',`<small class="gd-archive-credit">Build archive: <a href="${sourceUrl}">BassFreerunning &#8599;</a></small></footer>`):footer}
<script id="game-galleries" type="application/json">${JSON.stringify(galleries).replaceAll('<','\\u003c')}</script>
<script src="/navigation.js?v=20261023-2"></script>
<script src="/project-image-viewer.js?v=20261023-4"></script>
${route==='/minecraft-work/'?'<script src="/portfolio-entrance.js?v=20261021-2"></script>':''}
<script src="/minecraft-work/game-design.js?v=20261023-16"></script>
<script src="/analytics.js?v=20260720-1" defer></script>
</body></html>`;
}
function galleryData(p) { return images(p).map(a=>({src:a.original,thumbnailSrc:a.variants[0].src,sourceUrl:a.originalSourceUrl,sourceAlbum:a.sourceAlbum||p.gallerySource||p.sourceAlbum||'',alt:a.alt,title:p.title,description:[a.caption,a.credit].filter(Boolean).join(' ')})); }
function referenceData(p) {
 return referenceImages(p).map(a=>({src:a.original,reducedMotionSrc:a.reducedMotionSrc||'',thumbnailSrc:a.variants[0].src,alt:a.alt,title:p.title+' - Reference media',description:[a.caption,a.credit].filter(Boolean).join(' '),sourceUrl:a.originalSourceUrl,sourceAlbum:a.sourceProject}));
}
function referencePreview(p,a,i) {
 const content=a.inlineVideo?`<video class="gd-process-video" data-build-animation data-video-src="${esc(a.inlineVideo.src)}" width="${a.inlineVideo.width}" height="${a.inlineVideo.height}" muted loop playsinline preload="none" poster="${esc(a.variants.at(-1).src)}" aria-hidden="true" hidden></video><span data-animation-poster>${img(a)}</span>`:img(a);
 const imageLink=`<a class="gd-enlarge" href="${esc(a.original)}" data-gallery="${p.slug}-references" data-image-index="${i}" aria-label="Enlarge: ${esc(a.alt)}">${content}<span class="gd-image-action" aria-hidden="true">Enlarge &#8599;</span></a>`;
 return a.inlineVideo?`<div class="gd-process-preview">${imageLink}<button class="gd-animation-toggle" type="button" data-animation-toggle hidden>Play animation</button></div>`:imageLink;
}
function referenceSection(p) {
 const refs=referenceImages(p);
 if (!refs.length) return '';
 return `<section class="gd-section" id="inspiration" data-game-section="Process & inspiration" aria-labelledby="inspiration-heading"><div class="gd-section-heading"><h2 id="inspiration-heading">Process &amp; Inspiration</h2></div><p>${esc(p.referenceIntro)}</p><div class="gd-gallery">${refs.map((a,i)=>`<figure class="gd-figure${a.id==='process'?' gd-reference-process':' gd-reference-image'}"${a.id!=='process'?` style="--gd-reference-width:${a.width}px"`:''}>${referencePreview(p,a,i)}<figcaption>${esc(a.caption)}</figcaption></figure>`).join('')}</div></section>`;
}
function imageLink(p,a,i,hero=false) {
 const imageCredit=p.imageCredits?.[Number(a.id.slice(-2))] || p.renderCredit || '';
 const action=imageCredit?`<span class="gd-image-action gd-image-action--credited"><small class="gd-image-credit">${esc(imageCredit)}</small><span aria-hidden="true">Enlarge &#8599;</span></span>`:'<span class="gd-image-action" aria-hidden="true">Enlarge &#8599;</span>';
 return `<figure class="gd-figure${hero?' gd-hero-image':''}"><a class="gd-enlarge" href="${esc(a.original)}" data-gallery="${p.slug}" data-image-index="${i}" aria-label="Enlarge: ${esc(a.alt)}${imageCredit?', '+esc(imageCredit):''}">${img(a,{eager:hero,priority:hero,sizes:hero?'(max-width: 1280px) calc(100vw - 40px), 1240px':undefined})}${action}</a><figcaption>${esc(a.caption)}</figcaption></figure>`;
}
function projectCredits(p) {
 if (p.credits) return `<dl class="gd-source-credits">${p.credits.map(row=>`<div><dt>${esc(row.label)}</dt><dd>${esc(row.value)}</dd></div>`).join('')}</dl>`;
 return `${p.context?`<p>${esc(p.context)}.</p>`:''}${p.sourceCredits?`<p>${esc(p.sourceCredits)}</p>`:''}`;
}

const buildGalleries = Object.fromEntries(allBuilds.map(p=>[p.slug,galleryData(p)]));
const driftImage = home.match(/<img[^>]*src="[^\"]*complete-event-layout-960\.webp"[^>]*>/)[0].replace(/(src|srcset)="(?!\/)/g,'$1="/').replace(/, web\//g,', /web/').replace(/sizes="[^"]*"/,'sizes="(max-width: 760px) calc(100vw - 40px), 420px"');
const driftDescription = projectPage.match(/<p class="projects-case-study__purpose">(Drift Course Designer[^<]+)<\/p>/)[1];
const driftDestination = home.match(/class="career-project-card-link" href="([^"]*project=drift-course-designer[^"]*)"/)[1];
const toolsById = new Map(toolGroups.flatMap(group => group.tools).map(tool => [tool.id, tool]));
function toolNames(ids) {
 return ids.map(id => {
  const tool = toolsById.get(id);
  if (!tool) throw new Error(`Unknown tool reference: ${id}`);
  return `<span class="gd-tool-name">${esc(tool.name)}</span>`;
 }).join(' · ');
}
function compactWork(p) {
 const destination = cover(p).original;
 const gallery = ` data-gallery="${p.slug}" data-image-index="${p.cover-1}" aria-label="Enlarge ${esc(p.title)} image"`;
 return `<article class="gd-work-card"><a class="gd-study-link" href="${esc(destination)}"${gallery}>${img(cover(p),{position:p.coverPosition,sizes:'(max-width: 440px) calc(100vw - 28px), (max-width: 1024px) 45vw, 310px'})}</a>${workCopy(p,true)}</article>`;
}
const indexContent = `<div id="overview"></div>
<section id="featured" data-game-section="Featured work" aria-labelledby="featured-heading"><h2 class="gd-sr" id="featured-heading">Selected Environment &amp; Capabilities</h2><div class="gd-mosaic">${featuredSlideshow()}<aside class="gd-capabilities" aria-labelledby="capabilities-heading"><div class="gd-capabilities-header"><h3 id="capabilities-heading">Skills &amp; Tools</h3></div><div class="gd-capability-list">${technicalCapabilities.map((group,i)=>`<section class="gd-capability-group" aria-labelledby="capability-group-${i}"><div class="gd-capability-heading"><div class="gd-capability-label"><button type="button" class="gd-capability-icon" data-capability-preview aria-haspopup="dialog" aria-label="Enlarge ${esc(group.title)} icon">${i===0?'<img src="/imgsrc/game-design/icons/environment-creation.png" width="16" height="16" alt="">':i===1?'<img class="gd-server-icon" src="/imgsrc/game-design/icons/server-command-block.png" width="300" height="300" alt="">':'<img src="/imgsrc/game-design/icons/production-grass-block.png" width="300" height="300" alt="">'}</button><h4 id="capability-group-${i}">${esc(group.title)}</h4></div><p class="gd-capability-description">${esc(group.description)}</p></div>${group.toolIds.length?`<div class="gd-capability-tools"><span class="gd-tools-label">${esc(group.toolLabel || 'Tools')}</span><ul class="gd-capability-tool-list" role="list">${group.toolIds.map(id=>`<li>${toolNames([id])}</li>`).join('')}</ul></div>`:''}</section>`).join('')}</div><nav class="writing-featured-card__footer gd-links gd-capabilities-footer" aria-label="Technical portfolio"><a data-scroll-tools href="#tools-workflow">Related tools &amp; workflows ↓</a><a class="gd-secondary-link" href="/projects.html">Other projects →</a></nav></aside></div></section>
<section class="gd-section" id="selected" data-game-section="Selected work" aria-labelledby="selected-heading"><div class="gd-section-heading"><h2 id="selected-heading">Selected Work</h2></div><div class="gd-selected">${selectedLead.map(p=>card(p)).join('')}</div><div class="gd-compact-preview" data-work-preview><div class="gd-studies gd-selected-compact" id="selected-build-grid">${selectedCompact.map(p=>compactWork(p)).join('')}</div></div><button class="gd-see-more" type="button" data-work-toggle aria-controls="selected-build-grid" aria-expanded="false" hidden><span data-work-toggle-label>See more builds</span><svg class="gd-see-more-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></section>
<section class="gd-tools gd-section" id="tools-workflow" tabindex="-1" data-game-section="Tools & workflows" aria-labelledby="tools-heading"><h2 id="tools-heading">Tools &amp; Workflows</h2><div class="gd-tool-groups">${toolGroups.filter(g=>g.tools.length&&g.showInInventory!==false).map(g=>`<section class="gd-tool-group" data-tool-group="${esc(g.id)}" aria-labelledby="tool-group-${esc(g.id)}"><div class="gd-tool-group-heading"><h3 id="tool-group-${esc(g.id)}">${esc(g.label)}</h3></div><ul>${g.tools.map(tool=>`<li>${toolNames([tool.id])}</li>`).join('')}</ul></section>`).join('')}</div></section>
${breakdowns.length?`<section class="gd-section" aria-labelledby="approach-heading"><h2 id="approach-heading">How I Approach the Work</h2>${breakdowns.filter(b=>b.text&&b.image&&b.sourceUrl).slice(0,2).map(b=>`<article class="gd-related"><img src="${esc(b.image)}" alt="${esc(b.alt)}" loading="lazy"><div><h3>${esc(b.title)}</h3>${b.retrospective?'<p class="gd-meta">Retrospective review</p>':''}<p>${esc(b.text)}</p><a href="${esc(b.sourceUrl)}">Source notes ↗</a></div></article>`).join('')}</section>`:''}
<section class="gd-section" aria-labelledby="related-heading"><div class="gd-section-heading"><p class="gd-eyebrow">From game design to editing tools for reality</p><h2 id="related-heading">Related Project</h2></div><a class="gd-related" href="/${driftDestination}"><div>${driftImage}</div><div><p class="gd-meta">Spatial editing &amp; layout tools</p><h3>Drift Course Designer <span aria-hidden="true">↗</span></h3><p>${driftDescription}</p><span class="gd-text-link">View project details →</span></div></a></section>`;
write('minecraft-work/index.html',frame({title:landing.title,description:landing.description,route:'/minecraft-work/',preview:cover(featuredProjects[0]),content:indexContent,galleries:buildGalleries}));
for(const [i,p] of allBuilds.entries()) {
 const all=images(p),hero=cover(p),other=all.filter(a=>a.id!==hero.id),next=allBuilds[(i+1)%allBuilds.length];
 const facts=[['Type',p.projectType],['Platform',p.platform],['Commission context',p.studio?`${p.studio} commission`:null],['Client named in archive',p.client],['Collaboration',p.credits?null:p.collaborationCredits],['Year',p.year],['Published',p.published],['Status',p.status],['Role',p.role]].filter(([,v])=>v);
 const content=`<nav class="gd-breadcrumb" aria-label="Breadcrumb"><a href="/minecraft-work/">← Minecraft Work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav><section class="gd-detail-intro" id="overview" data-game-section="Project overview">${(p.detailContext||p.context)?`<p class="gd-eyebrow">${esc(p.detailContext||p.context)}</p>`:''}<h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p></section>
 ${detailSlideshow(p)}
 <dl class="gd-facts">${facts.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
 ${p.contribution?`<section class="gd-section"><h2>My contribution</h2><p>${esc(p.contribution)}</p></section>`:''}
 ${p.projectDescription?`<section class="gd-section gd-project-description" aria-labelledby="design-description-heading"><h2 id="design-description-heading">${esc(p.projectDescription.heading)}</h2>${p.projectDescription.paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')}</section>`:''}
 ${p.decisions?.length?`<section class="gd-section"><h2>Design decisions</h2>${p.decisions.map(d=>`<h3>${esc(d.title)}</h3><p>${esc(d.text)}</p>`).join('')}</section>`:''}
 ${other.length?`<section class="gd-section" id="gallery" data-game-section="Gallery" aria-labelledby="gallery-heading"><div class="gd-section-heading"><p class="gd-eyebrow">A closer look</p><h2 id="gallery-heading">Project Gallery</h2></div><div class="gd-gallery">${other.map(a=>imageLink(p,a,all.indexOf(a))).join('')}</div></section>`:''}

 ${p.outcome?`<section class="gd-section"><h2>Outcome</h2><p>${esc(p.outcome)}</p></section>`:''}
 ${referenceSection(p)}
 <section class="gd-sources gd-section"><h2>Sources &amp; Credits</h2>${projectCredits(p)}${p.sourceAlbum||p.sourceProject?`<nav class="gd-links" aria-label="Project sources">${p.sourceAlbum?`<a href="${esc(p.sourceAlbum)}">Source album &#8599;</a>`:''}${p.sourceProject?`<a href="${esc(p.sourceProject)}">${p.credits?'PlanetMinecraft project page':'Original project'} &#8599;</a>`:''}</nav>`:''}</section>
 <nav class="gd-next" aria-label="Project navigation"><a href="/minecraft-work/">← All game projects</a><a href="${url(next)}">Next: ${esc(next.title)} →</a></nav>`;
 write(`minecraft-work/${p.slug}/index.html`,frame({title:p.title,description:p.summary,route:url(p),preview:hero,content,galleries:{[p.slug]:galleryData(p),...(referenceImages(p).length?{[p.slug+'-references']:referenceData(p)}:{})}}));
}
let sitemap=read('sitemap.xml').replace(/\s*<url>\s*<loc>https:\/\/lawrencedinh.com\/(?:game-design|minecraft-work)\/[^<]*<\/loc>\s*<\/url>/g,'');
sitemap=sitemap.replace('</urlset>',['/minecraft-work/',...allBuilds.map(url)].map(route=>`  <url><loc>https://lawrencedinh.com${route}</loc></url>`).join('\n')+'\n</urlset>');
write('sitemap.xml',sitemap.trim());
console.log(`Generated index and ${allBuilds.length} project pages; sitemap updated.`);

// Preserve old bookmarks on static GitHub Pages, including query strings and fragments.
for (const route of ['/minecraft-work/', ...allBuilds.map(url)]) {
 const legacy = route.replace('/minecraft-work/', '/game-design/');
 write(legacy + 'index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minecraft Work | Lawrence Dinh</title><link rel="canonical" href="https://lawrencedinh.com${route}"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${route}"><script>location.replace(${JSON.stringify(route)} + location.search + location.hash);</script></head><body><p>This page has moved to <a href="${route}">Minecraft Work</a>.</p></body></html>`);
}
