#!/usr/bin/env node
/**
 * Builds all_125_pages_content.json from batch1..batch10 JSON files.
 * For each of the 125 slugs: uses batch content (HTML → plain text with \n) when available,
 * otherwise a substantive paragraph mentioning Ranjan Dasgupta, programmatic, exchange, or CTV.
 * Output: scripts/seo-pages/all_125_pages_content.json
 * Format: number, slug, title, category, content (plain text, newlines as \n)
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

// Exact 125 slugs in order (from build-all-125.js)
const slugs = [
  'whoami','theadsguy','notabot','humanbehindtheads','plottwist','originstory','beforeiwasfamous','mymanifesto','dearworld','lettertotheinternet',
  'whynotme','pickme','bestdecisionyoullmake','yourfutureCMO','nexthire','stolenfrommydayjob','resumebutcooler','absorbmeinyourteam','ROIofhiringme','cheaperthanabillboard',
  'whatIbreathe','adsareinmyDNA','Ithinkincampaigns','Idreamincopy','mybrainisabrief','strategymode','Ispeakdata','creativeondemand','funnelwhisperer','clickmagnet',
  'messagefrom2025','openitin2050','dearaliens','dearelon','dearbillgates','dearfutureCEO','ifAIfindsthis','hellofromanotherplanet','timecapsule','sentfromthepast','whenyoureadthis','beforeAGI','afterhumanity','postadvertising','theinternetremembers','lastadstanding','dearmars','signaltothestars','proofiwashere','digitalfossil',
  'adsarentdead','whyadsmatter','beautifulinterruptions','theartoftheclick','attentionisacurrency','everyoneisanad','youaretheproduct','theadthatneverlaunched','ifsocietywasanad','adsforgood','theperfectad','adsarelove','unsoldideas','killedcampaigns','ideagraveyard',
  'oops','youfoundme','congratulations','secretlevel','theredpill','theotherdoor','downtherabbithole','thispagedoesntexist','ormaybeitdoes','glitchinthematrix','404butonpurpose','hiddeninplainsight','noonewilleverseethis','exceptyou','nowwhat',
  'adsin2030','adsin2040','adsin2100','whatcomesafterreels','aftergoogle','afterinstagram','whentiktokdies','thenextbigplatform','neuromarketing','adsintheMetaverse','adsonmars','adsinspace','brainads','dreamtargeting','adsinVR',
  'thedayIquit','thedayIstarted','myworstcampaign','mybestcampaign','midnightonadeadline','whatclientsreallymean','thanksmom','thedayanadchangedmylife','whyIdothis','burnoutandback',
  'pitchme','solvethis','canyoubeatmyad','writemeabettercopy','ratethisad','guessmyCTR','adorbad','realorai','spotthefakead','buildanadwithme',
  'firstpost','lastpost','page1of1000','day1','year1','milliondollaridea','thebeginning','theend','untilnexttime','seeyouontheotherside'
];

// Title and category per slug (canonical from existing all_125)
const meta = {
  whoami: { title: 'Who Am I', category: 'Self-Introduction / Identity' },
  theadsguy: { title: 'The Ads Guy', category: 'Self-Introduction / Identity' },
  notabot: { title: 'Not A Bot', category: 'Self-Introduction / Identity' },
  humanbehindtheads: { title: 'The Human Behind The Ads', category: 'Self-Introduction / Identity' },
  plottwist: { title: 'Plot Twist', category: 'Self-Introduction / Identity' },
  originstory: { title: 'Origin Story', category: 'Self-Introduction / Identity' },
  beforeiwasfamous: { title: 'Before I Was Famous', category: 'Self-Introduction / Identity' },
  mymanifesto: { title: 'My Manifesto', category: 'Self-Introduction / Identity' },
  dearworld: { title: 'Dear World', category: 'Self-Introduction / Identity' },
  lettertotheinternet: { title: 'Letter To The Internet', category: 'Self-Introduction / Identity' },
  whynotme: { title: 'Why Not Me', category: 'Hire Me / Career' },
  pickme: { title: 'Pick Me', category: 'Hire Me / Career' },
  bestdecisionyoullmake: { title: "Best Decision You'll Make", category: 'Hire Me / Career' },
  yourfutureCMO: { title: 'Your Future CMO', category: 'Hire Me / Career' },
  nexthire: { title: 'Next Hire', category: 'Hire Me / Career' },
  stolenfrommydayjob: { title: 'Stolen From My Day Job', category: 'Hire Me / Career' },
  resumebutcooler: { title: 'Resume But Cooler', category: 'Hire Me / Career' },
  absorbmeinyourteam: { title: 'Absorb Me In Your Team', category: 'Hire Me / Career' },
  ROIofhiringme: { title: 'ROI Of Hiring Me', category: 'Hire Me / Career' },
  cheaperthanabillboard: { title: 'Cheaper Than A Billboard', category: 'Hire Me / Career' },
  whatIbreathe: { title: 'What I Breathe Is', category: 'Skills & Expertise' },
  adsareinmyDNA: { title: 'Ads Are In My DNA', category: 'Skills & Expertise' },
  Ithinkincampaigns: { title: 'I Think In Campaigns', category: 'Skills & Expertise' },
  Idreamincopy: { title: 'I Dream In Copy', category: 'Skills & Expertise' },
  mybrainisabrief: { title: 'My Brain Is A Brief', category: 'Skills & Expertise' },
  strategymode: { title: 'Strategy Mode', category: 'Skills & Expertise' },
  Ispeakdata: { title: 'I Speak Data', category: 'Skills & Expertise' },
  creativeondemand: { title: 'Creative On Demand', category: 'Skills & Expertise' },
  funnelwhisperer: { title: 'Funnel Whisperer', category: 'Skills & Expertise' },
  clickmagnet: { title: 'Click Magnet', category: 'Skills & Expertise' },
  messagefrom2025: { title: 'Message From 2025', category: 'Futuristic / Sci-Fi Discovery' },
  openitin2050: { title: 'Open It In 2050', category: 'Futuristic / Sci-Fi Discovery' },
  dearaliens: { title: 'Dear Aliens', category: 'Futuristic / Sci-Fi Discovery' },
  dearelon: { title: 'Dear Elon', category: 'Futuristic / Sci-Fi Discovery' },
  dearbillgates: { title: 'Dear Bill Gates', category: 'Futuristic / Sci-Fi Discovery' },
  dearfutureCEO: { title: 'Dear Future CEO', category: 'Futuristic / Sci-Fi Discovery' },
  ifAIfindsthis: { title: 'If AI Finds This', category: 'Futuristic / Sci-Fi Discovery' },
  hellofromanotherplanet: { title: 'Hello From Another Planet', category: 'Futuristic / Sci-Fi Discovery' },
  timecapsule: { title: 'Time Capsule', category: 'Futuristic / Sci-Fi Discovery' },
  sentfromthepast: { title: 'Sent From The Past', category: 'Futuristic / Sci-Fi Discovery' },
  whenyoureadthis: { title: 'When You Read This', category: 'Futuristic / Sci-Fi Discovery' },
  beforeAGI: { title: 'Before AGI', category: 'Futuristic / Sci-Fi Discovery' },
  afterhumanity: { title: 'After Humanity', category: 'Futuristic / Sci-Fi Discovery' },
  postadvertising: { title: 'Post Advertising', category: 'Futuristic / Sci-Fi Discovery' },
  theinternetremembers: { title: 'The Internet Remembers', category: 'Futuristic / Sci-Fi Discovery' },
  lastadstanding: { title: 'Last Ad Standing', category: 'Futuristic / Sci-Fi Discovery' },
  dearmars: { title: 'Dear Mars', category: 'Futuristic / Sci-Fi Discovery' },
  signaltothestars: { title: 'Signal To The Stars', category: 'Futuristic / Sci-Fi Discovery' },
  proofiwashere: { title: 'Proof I Was Here', category: 'Futuristic / Sci-Fi Discovery' },
  digitalfossil: { title: 'Digital Fossil', category: 'Futuristic / Sci-Fi Discovery' },
  adsarentdead: { title: "Ads Aren't Dead", category: 'Philosophy of Ads' },
  whyadsmatter: { title: 'Why Ads Matter', category: 'Philosophy of Ads' },
  beautifulinterruptions: { title: 'Beautiful Interruptions', category: 'Philosophy of Ads' },
  theartoftheclick: { title: 'The Art Of The Click', category: 'Philosophy of Ads' },
  attentionisacurrency: { title: 'Attention Is A Currency', category: 'Philosophy of Ads' },
  everyoneisanad: { title: 'Everyone Is An Ad', category: 'Philosophy of Ads' },
  youaretheproduct: { title: 'You Are The Product', category: 'Philosophy of Ads' },
  theadthatneverlaunched: { title: 'The Ad That Never Launched', category: 'Philosophy of Ads' },
  ifsocietywasanad: { title: 'If Society Was An Ad', category: 'Philosophy of Ads' },
  adsforgood: { title: 'Ads For Good', category: 'Philosophy of Ads' },
  theperfectad: { title: 'The Perfect Ad', category: 'Philosophy of Ads' },
  adsarelove: { title: 'Ads Are Love', category: 'Philosophy of Ads' },
  unsoldideas: { title: 'Unsold Ideas', category: 'Philosophy of Ads' },
  killedcampaigns: { title: 'Killed Campaigns', category: 'Philosophy of Ads' },
  ideagraveyard: { title: 'Idea Graveyard', category: 'Philosophy of Ads' },
  oops: { title: 'Oops', category: 'Wild & Weird Easter Eggs' },
  youfoundme: { title: 'You Found Me', category: 'Wild & Weird Easter Eggs' },
  congratulations: { title: 'Congratulations', category: 'Wild & Weird Easter Eggs' },
  secretlevel: { title: 'Secret Level', category: 'Wild & Weird Easter Eggs' },
  theredpill: { title: 'The Red Pill', category: 'Wild & Weird Easter Eggs' },
  theotherdoor: { title: 'The Other Door', category: 'Wild & Weird Easter Eggs' },
  downtherabbithole: { title: 'Down The Rabbit Hole', category: 'Wild & Weird Easter Eggs' },
  thispagedoesntexist: { title: "This Page Doesn't Exist", category: 'Wild & Weird Easter Eggs' },
  ormaybeitdoes: { title: 'Or Maybe It Does', category: 'Wild & Weird Easter Eggs' },
  glitchinthematrix: { title: 'Glitch In The Matrix', category: 'Wild & Weird Easter Eggs' },
  '404butonpurpose': { title: '404 But On Purpose', category: 'Wild & Weird Easter Eggs' },
  hiddeninplainsight: { title: 'Hidden In Plain Sight', category: 'Wild & Weird Easter Eggs' },
  noonewilleverseethis: { title: 'No One Will Ever See This', category: 'Wild & Weird Easter Eggs' },
  exceptyou: { title: 'Except You', category: 'Wild & Weird Easter Eggs' },
  nowwhat: { title: 'Now What', category: 'Wild & Weird Easter Eggs' },
  adsin2030: { title: 'Ads In 2030', category: 'Predictions & Vision' },
  adsin2040: { title: 'Ads In 2040', category: 'Predictions & Vision' },
  adsin2100: { title: 'Ads In 2100', category: 'Predictions & Vision' },
  whatcomesafterreels: { title: 'What Comes After Reels', category: 'Predictions & Vision' },
  aftergoogle: { title: 'After Google', category: 'Predictions & Vision' },
  afterinstagram: { title: 'After Instagram', category: 'Predictions & Vision' },
  whentiktokdies: { title: 'When TikTok Dies', category: 'Predictions & Vision' },
  thenextbigplatform: { title: 'The Next Big Platform', category: 'Predictions & Vision' },
  neuromarketing: { title: 'Neuromarketing', category: 'Predictions & Vision' },
  adsintheMetaverse: { title: 'Ads In The Metaverse', category: 'Predictions & Vision' },
  adsonmars: { title: 'Ads On Mars', category: 'Predictions & Vision' },
  adsinspace: { title: 'Ads In Space', category: 'Predictions & Vision' },
  brainads: { title: 'Brain Ads', category: 'Predictions & Vision' },
  dreamtargeting: { title: 'Dream Targeting', category: 'Predictions & Vision' },
  adsinVR: { title: 'Ads In VR', category: 'Predictions & Vision' },
  thedayIquit: { title: 'The Day I Quit', category: 'Emotional / Storytelling' },
  thedayIstarted: { title: 'The Day I Started', category: 'Emotional / Storytelling' },
  myworstcampaign: { title: 'My Worst Campaign', category: 'Emotional / Storytelling' },
  mybestcampaign: { title: 'My Best Campaign', category: 'Emotional / Storytelling' },
  midnightonadeadline: { title: 'Midnight On A Deadline', category: 'Emotional / Storytelling' },
  whatclientsreallymean: { title: 'What Clients Really Mean', category: 'Emotional / Storytelling' },
  thanksmom: { title: 'Thanks Mom', category: 'Emotional / Storytelling' },
  thedayanadchangedmylife: { title: 'The Day An Ad Changed My Life', category: 'Emotional / Storytelling' },
  whyIdothis: { title: 'Why I Do This', category: 'Emotional / Storytelling' },
  burnoutandback: { title: 'Burnout And Back', category: 'Emotional / Storytelling' },
  pitchme: { title: 'Pitch Me', category: 'Interactive / Challenge Pages' },
  solvethis: { title: 'Solve This', category: 'Interactive / Challenge Pages' },
  canyoubeatmyad: { title: 'Can You Beat My Ad', category: 'Interactive / Challenge Pages' },
  writemeabettercopy: { title: 'Write Me A Better Copy', category: 'Interactive / Challenge Pages' },
  ratethisad: { title: 'Rate This Ad', category: 'Interactive / Challenge Pages' },
  guessmyCTR: { title: 'Guess My CTR', category: 'Interactive / Challenge Pages' },
  adorbad: { title: 'Ad Or Bad', category: 'Interactive / Challenge Pages' },
  realorai: { title: 'Real Or AI', category: 'Interactive / Challenge Pages' },
  spotthefakead: { title: 'Spot The Fake Ad', category: 'Interactive / Challenge Pages' },
  buildanadwithme: { title: 'Build An Ad With Me', category: 'Interactive / Challenge Pages' },
  firstpost: { title: 'First Post', category: 'Legacy & Landmark' },
  lastpost: { title: 'Last Post', category: 'Legacy & Landmark' },
  page1of1000: { title: 'Page 1 Of 1000', category: 'Legacy & Landmark' },
  day1: { title: 'Day 1', category: 'Legacy & Landmark' },
  year1: { title: 'Year 1', category: 'Legacy & Landmark' },
  milliondollaridea: { title: 'Million Dollar Idea', category: 'Legacy & Landmark' },
  thebeginning: { title: 'The Beginning', category: 'Legacy & Landmark' },
  theend: { title: 'The End', category: 'Legacy & Landmark' },
  untilnexttime: { title: 'Until Next Time', category: 'Legacy & Landmark' },
  seeyouontheotherside: { title: 'See You On The Other Side', category: 'Legacy & Landmark' }
};

/** Strip HTML to plain text; use \n for paragraph/block breaks. */
function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  let s = html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<h2[^>]*>/gi, '\n\n')
    .replace(/<\/h2>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<a\s+href="[^"]*"[^>]*>/gi, '')
    .replace(/<\/a>/gi, '')
    .replace(/<strong>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s;
}

/** Meaningful fallback content when slug has no batch entry. */
function fallbackContent(slug) {
  const m = meta[slug] || { title: slug, category: 'SEO' };
  return `Ranjan Dasgupta builds ad products at scale: programmatic infrastructure, exchange architecture, and CTV monetization. This page (${m.title}) is part of that story. For more, see /about, /work, and /contact.`;
}

// Load all batches into slug -> content (plain text)
const batchContentBySlug = {};
for (let i = 1; i <= 10; i++) {
  const p = path.join(DIR, `batch${i}.json`);
  if (!fs.existsSync(p)) continue;
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!Array.isArray(data)) continue;
    for (const entry of data) {
      if (entry.slug && entry.content) {
        batchContentBySlug[entry.slug] = htmlToPlainText(entry.content);
      }
    }
  } catch (e) {
    console.warn('Warning: could not read', p, e.message);
  }
}

const entries = slugs.map((slug, i) => {
  const m = meta[slug] || { title: slug, category: 'SEO' };
  const content = batchContentBySlug[slug] || fallbackContent(slug);
  return {
    number: i + 1,
    slug,
    title: m.title,
    category: m.category,
    content
  };
});

const outPath = path.join(DIR, 'all_125_pages_content.json');
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8');
console.log('Wrote', outPath, 'with', entries.length, 'entries.');
console.log('From batches:', Object.keys(batchContentBySlug).length, 'slugs had batch content.');
