const fs = require('fs');
const file = 'components/storefront/ProductCommentsClient.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  [/text-slate-500/g, 'text-muted-foreground'],
  [/text-slate-300/g, 'text-muted-foreground'],
  [/border-slate-800\/80/g, 'border-border/80'],
  [/border-slate-800/g, 'border-border'],
  [/border-slate-700/g, 'border-border'],
  [/hover:border-slate-600/g, 'hover:border-muted-foreground'],
  [/bg-slate-900/g, 'bg-muted'],
  [/bg-\[\#111318\]/g, 'bg-card'],
  [/text-slate-600/g, 'text-muted-foreground'],
  [/bg-blue-600/g, 'bg-primary'],
  [/hover:bg-blue-500/g, 'hover:bg-primary/90'],
  [/hover:bg-slate-700/g, 'hover:bg-muted/80'],
  [/text-blue-500/g, 'text-primary'],
  [/text-blue-400/g, 'text-primary'],
  [/border-blue-500/g, 'border-primary'],
  [/text-white/g, 'text-foreground'],
  [/bg-slate-800/g, 'bg-muted'],
  [/hover:text-slate-200/g, 'hover:text-foreground'],
  [/bg-blue-500\/10/g, 'bg-primary/10'],
  [/text-slate-400/g, 'text-muted-foreground'],
  [/hover:bg-blue-500/g, 'hover:bg-primary/90'],
  [/bg-\[\#0a0a0a\]/g, 'bg-background'],
  [/text-slate-700/g, 'text-muted-foreground'],
  [/text-slate-200/g, 'text-foreground'],
  [/hover:text-slate-500/g, 'hover:text-foreground'],
  [/bg-blue-900\/10/g, 'bg-primary/10'],
  [/text-blue-100\/80/g, 'text-primary-foreground/80'],
  [/bg-primary hover:bg-primary\/90 disabled:bg-muted disabled:text-muted-foreground text-foreground/g, 'bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground'],
  [/hover:bg-red-400\/10/g, 'hover:bg-destructive/10'],
  [/hover:text-red-400/g, 'hover:text-destructive'],
  [/hover:text-blue-400/g, 'hover:text-primary'],
  [/hover:bg-blue-400\/10/g, 'hover:bg-primary/10'],
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

// Final specific pass for text-foreground on buttons to primary-foreground
content = content.replace(/bg-primary hover:bg-primary\/90 disabled:bg-muted disabled:text-muted-foreground text-foreground/g, 'bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground');
content = content.replace(/bg-primary hover:bg-primary\/90 text-foreground/g, 'bg-primary hover:bg-primary/90 text-primary-foreground');
content = content.replace(/bg-primary text-foreground/g, 'bg-primary text-primary-foreground');


fs.writeFileSync(file, content);
console.log('Replacements complete.');
