/** @typedef {{slug:string,title:string,summary:string,cardSummary:string,projectType:string,context:string,client?:string,studio?:string,collaborationCredits?:string,imageCredits?:Object<number,string>,role?:string,contribution?:string,year?:number,platform:string,cover:number,coverPosition:string,sourceAlbum?:string,decisions?:Array<{title:string,text:string}>,outcome?:string,captions:string[],featuredPlacement:string,sortOrder:number}} GameProject */
export const sourceUrl = 'https://bassfreerunning.weebly.com/builds.html';
// Landing-page positioning supplied by the author. Capability evidence stays in source only.
export const landing = {
  title: 'Minecraft Work',
  featuredSlugs: ['moneywars-map', 'autumn-wind', 'castle-spawn', 'pokemeadows-spawn', 'strandbeest-study', 'organics-study'],
  summary: 'Minecraft environments, commissioned builds, and multiplayer server systems, from world creation to gameplay configuration.',
  description: 'Minecraft environments, level design, and server systems by Lawrence Dinh, published as BassFreerunning.'
};
// Single verified inventory. Summary cards reference IDs rather than copying tool names.
// Empty categories remain available for authoring but are not rendered.
export const toolGroups = [
  { id: 'building', label: 'Building & World Creation', tools: [
    { id: 'worldedit', name: 'WorldEdit', evidence: 'Explicitly supplied by the author in the original portfolio request.' },
    { id: 'fawe', name: 'FAWE', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' },
    { id: 'voxelsniper', name: 'VoxelSniper', evidence: 'Explicitly supplied by the author in the original portfolio request.' },
    { id: 'worldpainter', name: 'WorldPainter', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' },
    { id: 'gobrush', name: 'goBrush', evidence: 'Author requested inclusion in the tool inventory, 2026-10-21.' }
  ] },
  { id: 'assets', label: '3D Assets & Content Production', tools: [
    { id: 'blockbench', name: 'Blockbench', evidence: 'Author instructed selection of common tools and attested use, 2026-10-06; official source verifies function, not personal history.', sourceUrl: 'https://blockbench.net/' },
    { id: 'blender', name: 'Blender', evidence: 'Author requested inclusion in the tool inventory, 2026-10-21.' },
    { id: 'magicavoxel', name: 'MagicaVoxel', evidence: 'Author requested inclusion in the tool inventory, 2026-10-21.' }
  ] },
  { id: 'server', label: 'Java Plugins & Gameplay', tools: [
    { id: 'java', name: 'Java', evidence: 'Author supplied custom plugin development capability copy, 2026-10-22.' },
    { id: 'custom-plugins', name: 'Custom Plugins', evidence: 'Author explicitly supplied custom plugin development experience, 2026-10-22.' },
    { id: 'spigot-paper', name: 'Paper/Spigot', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' },
    { id: 'essentials', name: 'Essentials/EssentialsX', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' },
    { id: 'worldguard', name: 'WorldGuard', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' },
    { id: 'luckperms', name: 'LuckPerms', evidence: 'Author instructed selection of common tools and attested use, 2026-10-06; official source verifies function, not personal history.', sourceUrl: 'https://luckperms.net/' },
    { id: 'citizens', name: 'Citizens', evidence: 'Author instructed selection of common tools and attested use, 2026-10-06; official source verifies function, not personal history.', sourceUrl: 'https://www.citizensnpcs.co/' },
    { id: 'quests', name: 'Quests', evidence: 'Author instructed selection of common tools and attested use, 2026-10-06; official source verifies function, not personal history.', sourceUrl: 'https://github.com/PikaMug/Quests' },
    { id: 'vault', name: 'Vault (economy integration)', evidence: 'Author instructed selection of common tools and attested use, 2026-10-06; Vault is an integration bridge, not a standalone economy.', sourceUrl: 'https://github.com/MilkBowl/Vault' },
    { id: 'towny', name: 'Towny', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' },
    { id: 'mcmmo', name: 'mcMMO', evidence: 'Author confirmed personal use in the tools clarification, 2026-10-06.' }
  ] },
  { id: 'collaboration', label: 'Project Management & Collaboration', showInInventory:false, tools: [
    { id: 'client-communication', name: 'Client Communication', evidence: 'Author supplied collaboration and project-delivery capability copy, 2026-10-22.' },
    { id: 'team-coordination', name: 'Team Coordination', evidence: 'Author supplied collaboration and project-delivery capability copy, 2026-10-22.' },
    { id: 'quality-control', name: 'Quality Control', evidence: 'Author supplied collaboration and project-delivery capability copy, 2026-10-22.' },
    { id: 'trello', name: 'Trello', evidence: 'Author requested inclusion in the project-management skills list, 2026-10-22.' },
    { id: 'slack', name: 'Slack', evidence: 'Author requested inclusion in the project-management skills list, 2026-10-22.' },
    { id: 'microsoft-teams', name: 'Microsoft Teams', evidence: 'Author requested inclusion in the project-management skills list, 2026-10-22.' }
  ] }
];
export const technicalCapabilities = [
  {
    title: 'Environment Design', toolIds: ['worldedit', 'fawe', 'voxelsniper', 'gobrush', 'worldpainter'],
    description: 'Creating immersive Minecraft environments that combine visual storytelling with thoughtful level design that focus on the player experience.',
    evidence: 'Capability description and representative tools supplied by the author, 2026-10-22.'
  },
  {
    title: 'Game Development', toolIds: ['java', 'custom-plugins', 'spigot-paper', 'worldguard', 'luckperms', 'towny', 'citizens'],
    description: 'Turning project requirements into functional gameplay experiences through custom plugins, server configuration, and gameplay integration.',
    evidence: 'Custom development, integration, and testing experience explicitly supplied by the author, 2026-10-22.'
  },
  {
    title: 'Project Delivery', toolLabel: 'Skills & Tools', toolIds: ['client-communication', 'team-coordination', 'quality-control', 'blender'],
    description: 'Bringing projects from client briefs to finished deliverables through team collaboration, quality review, and final visual presentation.',
    evidence: 'Capability description and representative skills supplied by the author, 2026-10-22.'
  }
];
// Only populate breakdowns from author-confirmed notes. Retrospective analysis must be labeled.
/** @type {Array<{title:string,text:string,image:string,alt:string,sourceUrl:string,retrospective?:boolean}>} */
export const breakdowns = [];
/** @type {GameProject[]} */
// Card copy describes documented purpose or inspiration; image captions describe visible details.
// Autumn Wind inspiration supplied by the author, 2026-10-21.
export const projects = [
  { slug:'opblocks-candy-environments', cardSummary:"Candy-themed server hubs created for OPBlocks through Vaeron.", title:"OPBlocks Candy Environments", summary:"Candy-themed server hubs created for OPBlocks through Vaeron.", projectType:'Hubs & terrain', client:'OPBlocks', studio:'Vaeron', context:'Vaeron commission · OPBlocks', cover:1, captions:[
    'Aerial view of the candy-colored hub, with striped towers, pink terrain and a purple waterway.',
    'A floating candy island above pink terrain, surrounded by oversized sweets and spiral lollipops.',
    'Isolated overview of the hub with red-topped towers and branching paths.',
    'Close view of the Free World and Mines entrances between colorful towers.',
    'In-game aerial view of striped towers around the central pink tree.',
    'Ground-level view toward the Free World entrance beneath pink foliage.'
  ], sourceAlbum:'http://imgur.com/a/0rB7u' },
  { slug:'moneywars-map', cardSummary:"Japanese-style Moneywars map created for YouTuber BajanCanadian as a Vaeron commission.", title:"Japanese Styled Moneywars Map", summary:"Japanese-style Moneywars map created for YouTuber BajanCanadian as a Vaeron commission.", projectType:'Multiplayer map', client:'BajanCanadian', clientLabel:'Client', studio:'Vaeron', context:'Vaeron commission · BajanCanadian', cover:1, captions:[
    'Floating islands with tiered buildings, red gates and a ring of red structures around the center.',
    'Close view of a floating island with dark tiered roofs, white walls and greenery.',
    'Overhead view of the central island and surrounding islands beneath red gate-like structures.',
    'Angled aerial view across red gates and tiered buildings on floating islands.'
  ], sourceAlbum:'http://imgur.com/a/vAQ5d' },
  {
    "slug": "autumn-wind",
    "title": "Autumn Wind of the Red Leaf Maple",
    "cardSummary": "Japanese architecture and an autumn maple arranged in a ceramic teacup, inspired by bonsai.",
    "summary": "Minecraft project combining Japanese architecture, ceramics and bonsai in an autumn scene.",
    "detailContext": "Collaborative project",
    "projectType": "Collaborative project",
    "collaborationCredits": "Collaboration with Dr_Bond",
    "context": "Collaboration with Dr_Bond",
    "cover": 7,
    "published": "September 9, 2016",
    "status": "Complete",
    "sourceProject": "https://www.planetminecraft.com/project/autumn-wind-of-the-red-leaf-maple---/",
    "sourceAlbum": "http://imgur.com/a/muT93",
    "gallerySource": "https://www.planetminecraft.com/project/autumn-wind-of-the-red-leaf-maple---/",
    "credits": [
      {"label":"Build","value":"BassFreerunning and Dr_Bond"},
      {"label":"Renders","value":"Joebricksy, MonkeyDharu, Matibian, iSkillia, Werolf, Koala and Cmelvard"},
      {"label":"Build server","value":"Gazamo"}
    ],
    "galleryCredits": "",
    "imageCredits": {
      "1": "Render by MonkeyDharu",
      "2": "Render by Matibian",
      "3": "Render by Werolf",
      "4": "Render by Joebricksy",
      "5": "Render by Joebricksy",
      "6": "Render by iSkillia",
      "7": "Render by Werolf",
      "8": "Render by Koala",
      "9": "Render by Joebricksy"
    },
    "projectDescription": {
      "heading": "Design & Inspiration",
      "paragraphs": [
        "The goal of this project was twofold: to study Japanese architecture in Minecraft and use a strong seasonal theme to bring the whole scene together.",
        "A focused autumn palette runs through the red maple leaves and ceramic cup. Free-flowing leaves suggest an autumn wind, adding movement to the build.",
        "Japanese ceramics and bonsai were the main references for the cup, tree and overall composition."
      ]
    },
    "referenceIntro": "Inspired by Japanese ceramics and bonsai.",
    "captions": [
      "Elevated render of the ceramic teacup, Japanese buildings and red maple in warm autumn light.",
      "Red-lit view through the maple canopy toward layered roofs and the ceramic cup.",
      "Front view of the tiered Japanese buildings and hanging lantern beneath the maple canopy.",
      "Close render of timber buildings and layered roofs beneath red maple branches.",
      "Wide side view of the complete teacup, buildings and spreading maple canopy.",
      "Render of the buildings and autumn maple under diagonal beams of light.",
      "Side render of the patterned teacup, Japanese buildings and windblown maple leaves.",
      "Warm render of the tiered roofs, hanging lantern and maple branches.",
      "Close view of the red maple canopy, branches and lantern above the buildings.",
      "In-game view across the roofs toward the maple canopy and loose leaves overhead.",
      "In-game overview of the rounded teacup base, buildings and maple tree against the sky.",
      "Upward in-game view of the maple branches, hanging lantern and Japanese roofs.",
      "Rear in-game view of the maple trunk, canopy, lantern and wooden buildings.",
      "Side in-game view of the teacup, autumn maple and hanging lantern.",
      "Close view of timber beams, red columns, tiled roofs and the stone walkway.",
      "Low-angle view of the rounded ceramic cup and its patterned exterior.",
      "Side view of the teacup-shaped base, lantern and layered buildings in pink light."
    ]
  },
  { slug:'castle-spawn', cardSummary:"Medieval castle-themed spawn built for a Minecraft server through Vaeron.", title:"Medieval Castle Spawn", summary:"Medieval castle-themed spawn built for a Minecraft server through Vaeron.", projectType:'Server spawn', studio:'Vaeron', context:'Vaeron commission', cover:1, captions:[
    'Front view of the stone gatehouse and flag-topped towers above the courtyard.',
    'Courtyard view with a blue fountain, stone paths and timber-fronted structures.',
    'Elevated view of market stalls and the courtyard enclosed by castle walls.',
    'Close view of stone columns, a timber balcony and a narrow building entrance.',
    'View across the fountain courtyard toward the gatehouse against a sunset sky.',
    'Exterior overview of the castle walls and towers on a flat build area.'
  ], sourceAlbum:'https://imgur.com/a/qs8E0qB' },
  { slug:'pixelmon-town', cardSummary:"Interactive town built for Pixelmon as part of a Shapescape commission.", title:"Pixelmon Town", summary:"Interactive town built for Pixelmon as part of a Shapescape commission.", projectType:'Town environment', studio:'Shapescape', context:'Shapescape commission', cover:1, captions:[
    'Aerial view of a town with a domed building, winding roads and smaller houses between forest and pale terrain.'
  ] },
  { slug:'strandbeest-study', cardSummary:"Steampunk Minecraft build inspired by Theo Jansen\u2019s kinetic Strandbeest sculptures.", title:"Strandbeest Steampunk Study", summary:"Steampunk Minecraft build inspired by Theo Jansen\u2019s kinetic Strandbeest sculptures.", projectType:'Personal sculpture', compactContext:'Personal build', context:'Personal build · Inspired by Theo Jansen', cover:1, captions:[
    'Front view of a many-legged architectural sculpture with layered timber structures and windmill-like forms.',
    'Close view along a raised walkway toward the sculpture’s ornate timber buildings.',
    'Three-quarter view of the sculpture, showing its repeated legs, layered roofs and large rotor-like forms.',
    'Side view showing the sculpture’s legs and architectural mass beside neighboring build structures.'
  ], sourceAlbum:'http://imgur.com/a/ZY4Rd' }
].map((p,i)=>({...p, platform:'Minecraft', coverPosition:p.slug==='autumn-wind'?'50% 55%':'50% 50%', featuredPlacement:i===0?'large':'selected', sortOrder:i+1}));
export const studies = [
  {slug:'organics-study',title:"Humanoid Organics Study",context:'Personal build',summary:"Minecraft study combining humanoid forms with Roman and Gothic architecture.",sourceAlbum:'http://imgur.com/a/P4IYo',cover:1,captions:[
    'Full view of a dark framed composition with suspended organic forms and small white architectural structures.',
    'Upward view of the frame and suspended block-built organic forms.',
    'Detail of the layered white buildings along the lower left edge of the composition.',
    'Detail of white arches and towers beside an unfinished pillar.'
  ]},
  {slug:'tower-study',title:"Small Beaux-Arts Tower Study",context:'Personal build',summary:"Small tower exploring Beaux-Arts architectural form and detail.",sourceAlbum:'http://imgur.com/a/oZOb2',cover:1,captions:[
    'Render of a white-columned tower with a dark layered roof on a circular landscaped platform.'
  ]},
  {slug:'terrain-spawn',title:"Server Spawn with Custom Terrain",context:'Personal build',summary:"Medieval-themed server spawn built alongside custom terrain.",sourceAlbum:'http://imgur.com/a/QqdOk',cover:1,captions:[
    'Angled view of a symmetrical stone courtyard with radiating paths and tall green trees.',
    'Top-down view of radial courtyard paths surrounded by walls and towers.',
    'Ground-facing view of stone towers, trees and paved paths within the spawn.',
    'Rocky custom terrain with ridges, grass patches and steep slopes.'
  ]},
  {slug:'desert-spawn',title:"Desert Spawn",context:'Personal build',summary:"Server spawn designed around a desert theme.",sourceAlbum:'http://imgur.com/a/vIK3T',cover:1,captions:[
    'Front view of a pale columned building with orange wall panels and a broad central staircase.',
    'Angled render showing the long colonnade and stepped frontage in pink light.'
  ]},
  {"slug": "pokemeadows-spawn", "title": "PokeMeadows Pixelmon Spawn", "summary": "Pixelmon server spawn for PokeMeadows, built as a Meraki commission.", "context": "Meraki commission \u00b7 PokeMeadows", "sourceAlbum": "https://imgur.com/a/9rHDf", "cover": 1, "captions": ["Aerial view of the PokeMeadows spawn, with red- and green-roofed buildings, trees and a central courtyard.", "Closer aerial view of the central courtyard between towers, paths and wooded terrain.", "Ground-level view of the green-roofed spawn building beside a large tree and hanging lantern."]},
  {"slug": "plan-c2", "title": "Plan C2", "summary": "Spirited Away-inspired plot build created for a Team Varuna trial.", "context": "Team Varuna trial", "sourceAlbum": "https://imgur.com/a/LEpvR", "sourceProject": "https://www.planetminecraft.com/project/plan-c2/", "credits": [{"label":"Renders","value":"Joebricksy"},{"label":"Build server","value":"Team Varuna"}], "galleryCredits": "", "renderCredit": "Render by Joebricksy", "cover": 1, "captions": ["Render of the compact tiered plot build, with a pink tree and warm lighting.", "Front view of the tiered building, pink tree and small landscaped plot against the sky.", "Side view of the narrow plot build, showing stacked roofs, balconies and chimney smoke.", "Rear view of the building, with tiered roofs and decorated walls above the plot base.", "Upward view past the pink tree toward projecting roofs and balconies.", "Angled view of the entrance, stone supports and tiered upper floors."]},
  {"slug": "arcade-hub", "title": "Arcade Themed Hub", "summary": "Arcade-themed server hub built as a personal commission.", "context": "Personal commission", "sourceAlbum": "https://imgur.com/a/RmdPV", "cover": 1, "captions": ["Overhead render of the arcade hub, with red-and-white plant sculptures in green pipes around a central plaza.", "Aerial in-game view of the hub, showing the radial plaza, brick perimeter and pipe-mounted sculptures.", "Ground-level view of the red-and-white sculptures, green pipes and stairs beside the plaza.", "Angled overhead view across the plaza and surrounding pipes, sculptures and brick walls."]},
  {"slug": "downgrade-map", "title": "Industrial Minigame Map", "summary": "Map made for minigame \"Downgrade\" on Minecraft Party Zone.", "context": "Shapescape commission \u00b7 Minecraft Party Zone", "cover": 1, "captions": ["Aerial render of the Downgrade map, showing city streets, vehicles and a large multi-storey building."]},
  {"slug": "gazamo-trial", "title": "Gazamo Trial Build", "summary": "Trial build created as part of an application to join Gazamo.", "context": "Gazamo team trial", "sourceAlbum": "https://imgur.com/a/wtHAe", "cover": 1, "captions": ["Render of the white-columned trial build, with green domes and a tall central tower.", "Angled render showing the central dome and smaller domed wings.", "In-game front view of the domed building, entrance and layered columns.", "In-game angled view of the building and green domes on a flat plot."]}
];
