import type Phaser from 'phaser';

/** Original world-space scenery. These distant hills and village are decorative,
 * outside the two service lots; camera movement never stretches a screen backdrop. */
export function buildValleyBackdrop(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setDepth(-1100);
  const poly = (points: number[][], colour: number, alpha = 1) => {
    g.fillStyle(colour, alpha); g.beginPath();
    points.forEach(([x,y],i) => i ? g.lineTo(x,y) : g.moveTo(x,y));
    g.closePath(); g.fillPath();
  };
  const mountain = (points: number[][], colour: number) => poly(points.map(([x,y]) => [x,y+620]),colour);
  g.fillStyle(0x91c9df); g.fillRect(-3000,-1300,7000,5000);
  // Atmospheric layers: distant blue ridges, sunny peaks, wooded foothills.
  mountain([[-3000,550],[-3000,-150],[-2100,-240],[-1800,-570],[-1300,-290],[-900,-650],[-400,-220],[0,-430],[420,-180],[780,-640],[1180,-260],[1500,-590],[1840,-260],[2300,-540],[2900,-150],[4000,-250],[4000,2400]],0x799eae);
  mountain([[400,-130],[780,-640],[1180,-260],[860,-420],[720,-400]],0xb6d1d3);
  mountain([[1180,-260],[1500,-590],[1840,-260],[1570,-380],[1500,-470],[1420,-390]],0xc7dfe0);
  mountain([[780,-640],[1180,-260],[940,-170],[865,-400]],0x608798);
  mountain([[1500,-590],[1840,-260],[1660,-150],[1580,-380]],0x648d9f);
  poly([[-3000,650],[-3000,70],[-2200,-100],[-1600,90],[-1000,-160],[-400,130],[150,-30],[700,140],[1100,-100],[1450,80],[1800,-130],[2300,20],[3000,-70],[4000,240],[4000,2400]],0x6c9f87);
  poly([[-3000,2500],[-3000,290],[-1800,90],[-1200,240],[-400,160],[180,260],[700,180],[1100,260],[1600,120],[2200,330],[3100,190],[4000,370],[4000,4000]],0x83b46a);
  poly([[470,230],[680,185],[1010,200],[1250,265],[1110,340],[820,320],[580,300]],0x72b8c4);
  poly([[545,236],[700,210],[1000,225],[1150,265],[1020,282],[755,270]],0x9ad1d1,.5);
  g.lineStyle(3,0xd6e4bd,.4);
  for (let i=0;i<10;i++) g.lineBetween(625+i*44,235+i%3*18,650+i*44,235+i%3*18);
  // Keep the horizon village small: a sense of place rather than fake play space.
  for (const [x,y,size] of [[820,135,22],[940,125,18],[1060,175,25],[1180,185,19],[1370,250,24],[1570,285,20]]) {
    poly([[x,y],[x+size,y+size*.4],[x+size,y+size*1.5],[x,y+size]],0xf4e6ba);
    poly([[x+size,y+size*.4],[x+size*1.7,y],[x+size*1.7,y+size],[x+size,y+size*1.5]],0xd4cfac);
    poly([[x-4,y],[x+size*.7,y-size*.4],[x+size*1.8,y],[x+size,y+size*.5]],0x577daf);
    g.fillStyle(0x44758e); g.fillRect(x+size*.3,y+size*.4,5,7);
  }
  let seed = 91823;
  const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed/4294967296; };
  for (let i=0;i<260;i++) {
    const x = -2500+random()*6000, y = -10+random()*460, h = 16+random()*32;
    if (x>470 && x<1280 && y>185 && y<340) continue;
    g.fillStyle(0x527c57,.25); g.fillEllipse(x+8,y+h*.2,h*.85,h*.3);
    g.lineStyle(3,0x786e4d); g.lineBetween(x,y,x,y-h*.35);
    poly([[x-h*.32,y-h*.12],[x,y-h],[x+h*.32,y-h*.12]],i%3 ? 0x4b835f : 0x3d725a);
    poly([[x-h*.32,y-h*.12],[x,y-h],[x,y-h*.12]],0x6c9e66);
  }
}
