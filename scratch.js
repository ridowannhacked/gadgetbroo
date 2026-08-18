const fs = require('fs');
let file = 'app/(admin)/admin/(dashboard)/pos/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/bg-\[\#12151a\]/g, 'bg-card');
c = c.replace(/bg-\[\#161a22\]/g, 'bg-background');
c = c.replace(/bg-\[\#0a0a0a\]/g, 'bg-background');
c = c.replace(/bg-\[\#0f1219\]/g, 'bg-card');
c = c.replace(/border-slate-800/g, 'border-border');
c = c.replace(/border-slate-700/g, 'border-border');
c = c.replace(/text-slate-500/g, 'text-muted-foreground');
c = c.replace(/text-slate-400/g, 'text-muted-foreground');
c = c.replace(/text-slate-300/g, 'text-muted-foreground');
c = c.replace(/text-slate-200/g, 'text-foreground');
c = c.replace(/text-white/g, 'text-foreground');
c = c.replace(/bg-slate-800/g, 'bg-muted');
c = c.replace(/bg-slate-700/g, 'bg-secondary');
c = c.replace(/hover:bg-slate-600/g, 'hover:bg-secondary/80');

fs.writeFileSync(file, c);
