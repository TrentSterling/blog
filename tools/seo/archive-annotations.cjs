'use strict';
// Hash-pinned allowances for 2026 SEO archive additions. Existing historical
// body, links, image bytes and dates still need to match the archived baseline.
// Each entry identifies one exact reviewed source change; no arbitrary edits are
// normalized. Compatible with a staged merge of either seven-post batch.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const entries = new Map([
  {
    "path": "_posts/2015-06-19-tiny-zombies.md",
    "before": "e068f961898a458015627ffd9658f5a64ce61a34",
    "after": "cf7a5671f16a53a92195e7713d98b20664cacafa",
    "length": 763,
    "description": "description: \"Just a bunch of tiny zombies  2015-01-1008-36-05  2014-12-2418-33-03  2014-12-2421-53-15(/assets/\""
  },
  {
    "path": "_posts/2014-06-19-voxel-helicopter-shooter.md",
    "before": "a6ee858b8f80bb28425ff068d96d70a469f47ea7",
    "after": "a632b18e62379555494394ec8f8d35e342feb7ee",
    "length": 1243,
    "description": "description: \"This game was my last PlayMaker experiment before going back to pure C. Now that I’ve stopped using PlayMaker, I doubt that I’ll do anything more...\""
  },
  {
    "path": "_posts/2014-04-11-pathfinding-and-a-shiny-key.md",
    "before": "d6efcdf0303f406bd9a576729a381b45138855fa",
    "after": "a10ff3cd0b59a556b558380a0705571e7ac0a5a4",
    "length": 818,
    "description": "description: \"shadertest  dungeonstuff  pits  animatedshit\""
  },
  {
    "path": "_posts/2015-07-19-multiplayer-topdown-zombie.md",
    "before": "be811681222eeb460d2e1ece2861883a9879ca35",
    "after": "2c7f34ed4bf1d0b8dbe8d3728acc43b4f23c11c5",
    "length": 2071,
    "description": "description: \"A Photon networked topdown twin-stick shooter for PC, Android, and Amazon FireTV.\""
  },
  {
    "path": "_posts/2014-02-28-3-day-rpg.md",
    "before": "ed9ebc037bc8c138d7558a32daa37882ad08814a",
    "after": "76bd12c73ac51041a075ca51a27ed984622179ca",
    "length": 1381,
    "description": "description: \"A bunch of devs making life harder by compounding multiple gamejams at once - making an RPG in 3 days.\""
  },
  {
    "path": "_posts/2014-10-20-bacongamejam08-super-turbo-ship-puncher-3.md",
    "before": "74155a7e6dfb839c6d51298a576393b7b29f3e7a",
    "after": "c4604ea7b1c2350c3beda40daeed5b373eb06cd3",
    "length": 2196,
    "description": "description: \"A game created in 48 hours for the BaconGameJam. The theme was “Millions Of Them”.  ---  Dodge through 100’s of enemies while picking up 1000’s of...\""
  },
  {
    "path": "_posts/2015-05-15-voxel-twinstick-voxefire.md",
    "before": "510d5702e47ca65ddc799b478a1701ea72aa823c",
    "after": "9d31208da596a79993a390941e1c0ba4b1287152",
    "length": 1756,
    "description": "description: \"VoxeFire - a voxel-powered twin-stick shooter with destructible environments, built for Amazon FireTV.\""
  },
  {
    "path": "_posts/2014-11-09-week-1-12-games-in-12-weeks.md",
    "before": "8ad2497b41574cf74e3c40a1d6ab988a6d9e4589",
    "after": "8d84ebc67dc0fcc7ca6925b61021b0a2d23eb67a",
    "length": 3027,
    "description": "description: \"MFpRLkW  Wow, what a week  How to even begin? Well for starters, I guess I’ll mention that gamedev is hard. Scheduling is hard. Finishing stuff is...\""
  },
  {
    "path": "_posts/2014-10-28-12-games-in-12-weeks.md",
    "before": "0345fbc193b4f04f0bdd60b140557b67c4ecf0fd",
    "after": "126188152c2799b03ffc1926679f7debd495f2ea",
    "length": 5424,
    "description": "description: \"Taking on the 12 games in 12 weeks challenge - rapid game development, streaming on Twitch, and distribution woes.\""
  },
  {
    "path": "_posts/2010-10-31-finishing-a-game.md",
    "before": "576b11b605480db12dbbdae55b8cfbc011a9d1b1",
    "after": "e8b5cd310d6a1373cebe6b43c3bc75eb9afb319d",
    "length": 836,
    "description": "description: \"Reading about finishing games and getting a second wind on my project.\""
  },
  {
    "path": "_posts/2011-03-04-engine-design-components-and-papervision3d.md",
    "before": "df1203f79a6efacdd045df47ef0c3b1b45cb926f",
    "after": "687dbd412fc924ff2bdda43ff87cf553d6e20865",
    "length": 2668,
    "description": "description: \"Implementing a component-based entity system with FlashPunk-inspired architecture.\""
  },
  {
    "path": "_posts/2010-10-29-3d-rendering-in-flash.md",
    "before": "2b259917cbe6361b2157b325ad19139a5d335b7d",
    "after": "0487d66a3379d0d9d78b8e2237f0f6385202a107",
    "length": 1019,
    "description": "description: \"Exploring different 3D rendering engines for Flash - Papervision3D, Away3DLite, Alternativa, and ND3D.\""
  },
  {
    "path": "_posts/2014-04-27-mini-dungeon-ludum-dare-29.md",
    "before": "85cd34230d532643c0a03f526f9c83d02b2d3eaf",
    "after": "fca7640514588f9331472a769e2c2774df0ceb17",
    "length": 4646,
    "description": "description: \"runningzomber  So me and Yuuki didn’t really want to kill our momentum, but I also thought it would be fun to give ourselves a little challenge. ...\""
  },
  {
    "path": "_posts/2014-10-28-vaultscript-and-other-old-gmod-gamemodes.md",
    "before": "27ba6f580d0c93780b61adcc16a5b5b99a0cfd08",
    "after": "b71bae2a5f52dd6a4b965de3d7261c9ebc38a57d",
    "length": 1586,
    "description": "description: \"I had an old friend on steam recently ask about my old Garry’s Mod lua scripts. He asked if I still had them. This wasn’t the first time he had asked...\""
  }
].map(entry => [entry.path, entry]));
function gitBlob(contents) {
  const bytes = Buffer.from(contents, 'utf8');
  return crypto.createHash('sha1').update('blob ' + bytes.length + String.fromCharCode(0)).update(bytes).digest('hex');
}
function normalize(relative, text) {
  const entry = entries.get(relative);
  if (!entry) return text;
  const actual = gitBlob(text);
  if (actual === entry.before) return text;
  assert.equal(actual, entry.after, relative + ': only the exact reviewed SEO archive extension is allowed');
  const currentDescription = text.match(/^description: .*$/m);
  assert.ok(currentDescription, relative + ': original description line present');
  const restoredDescription = text.replace(currentDescription[0], entry.description);
  const original = restoredDescription.slice(0, entry.length);
  assert.equal(gitBlob(original), entry.before, relative + ': no edits to historical text, media or dates');
  const appendix = restoredDescription.slice(entry.length);
  assert.match(appendix, /## Archive (?:notes|context) \(2026\)/, relative + ': labeled archive addition');
  return original;
}
function verify(root) {
  let enhanced = 0;
  for (const [relative, entry] of entries) {
    const text = fs.readFileSync(path.join(root, relative), 'utf8');
    const sha = gitBlob(text);
    assert.ok(sha === entry.before || sha === entry.after, relative + ': only baseline or approved published version');
    const restored = normalize(relative, text);
    assert.equal(gitBlob(restored), entry.before, relative + ': intact original article');
    if (sha === entry.after) enhanced++;
    assert.throws(() => normalize(relative, text + '\\nUNAPPROVED'), /only the exact reviewed SEO archive extension/);
  }
  assert.ok(enhanced >= 7, 'at least one complete seven-post batch is published in the PR');
  return {reviewed: entries.size, enhanced};
}
module.exports = {entries, normalize, verify, gitBlob};
if (require.main === module) console.log(verify(path.resolve(__dirname, '../..')));
