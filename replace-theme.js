const fs = require('fs');
const file = 'app/(main)/product/[slug]/ProductDetailsClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  [/text-slate-500/g, 'text-muted-foreground'],
  [/hover:text-slate-300/g, 'hover:text-foreground'],
  [/text-slate-300/g, 'text-muted-foreground'],
  [/border-slate-800/g, 'border-border'],
  [/hover:border-slate-600/g, 'hover:border-muted-foreground'],
  [/bg-slate-900/g, 'bg-muted'],
  [/bg-\[\#111318\]/g, 'bg-card'],
  [/text-slate-600/g, 'text-muted-foreground'],
  [/bg-blue-600/g, 'bg-primary'],
  [/text-blue-500/g, 'text-primary'],
  [/text-blue-400/g, 'text-primary'],
  [/text-white/g, 'text-foreground'],
  [/bg-slate-800/g, 'bg-muted'],
  [/hover:text-slate-200/g, 'hover:text-foreground'],
  [/bg-blue-500\/10/g, 'bg-primary/10'],
  [/border-blue-500/g, 'border-primary'],
  [/text-slate-400/g, 'text-muted-foreground'],
  [/hover:bg-blue-500/g, 'hover:bg-primary/90'],
  [/prose-invert/g, 'dark:prose-invert'],
  [/prose-slate/g, ''],
  [/prose-p:text-slate-400/g, 'prose-p:text-muted-foreground'],
  [/hover:text-blue-300/g, 'hover:text-primary/80'],
  [/bg-\[\#0f1219\]/g, 'bg-card'],
  [/hover:border-slate-700/g, 'hover:border-primary/50'],
  [/bg-\[\#0a0a0a\]/g, 'bg-background'],
  [/text-slate-700/g, 'text-muted-foreground'],
  [/text-slate-200/g, 'text-foreground'],
  [/hover:text-slate-500/g, 'hover:text-foreground'],
  [/text-primary font-bold uppercase/g, 'text-primary-foreground font-bold uppercase'],
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

// Fix specific text-foreground inside featured badge which should be primary-foreground
content = content.replace(/bg-primary text-foreground text-\[10px\] font-bold uppercase/g, 'bg-primary text-primary-foreground text-[10px] font-bold uppercase');
content = content.replace(/bg-primary text-foreground text-\[9px\] font-bold uppercase/g, 'bg-primary text-primary-foreground text-[9px] font-bold uppercase');

// Fix button text colors
content = content.replace(/bg-primary hover:bg-primary\/90 disabled:bg-muted disabled:text-muted-foreground text-foreground text-sm/g, 'bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground text-sm');
content = content.replace(/bg-primary hover:bg-primary\/90 disabled:bg-muted disabled:text-muted-foreground text-foreground font-semibold/g, 'bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold');
content = content.replace(/text-primary-foreground text-primary-foreground text-\[10px\]/g, 'text-primary text-primary-foreground text-[10px]');


fs.writeFileSync(file, content);
console.log('Replacements complete.');
