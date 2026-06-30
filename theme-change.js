const fs = require('fs');

const path = 'd:/portfolio website/THE_WEBSITE/src/components/AdminPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  [/bg-\[\#0d0d0d\]/g, 'bg-gray-50'],
  [/bg-\[\#0a0a0a\]\/90/g, 'bg-white/90'],
  [/bg-\[\#121212\]/g, 'bg-white'],
  [/bg-\[\#181818\]/g, 'bg-gray-50'],
  [/bg-\[\#222\]/g, 'bg-gray-200'],
  [/bg-\[\#111\]/g, 'bg-gray-100'],
  
  [/text-white\/20/g, 'text-gray-400'],
  [/text-white\/30/g, 'text-gray-400'],
  [/text-white\/40/g, 'text-gray-500'],
  [/text-white\/50/g, 'text-gray-500'],
  [/text-white\/60/g, 'text-gray-600'],
  [/text-white\/70/g, 'text-gray-700'],
  [/text-white\/80/g, 'text-gray-800'],
  [/(?<!-)text-white/g, 'text-gray-900'],
  
  [/border-white\/5/g, 'border-gray-200'],
  [/border-white\/10/g, 'border-gray-300'],
  
  [/hover:bg-white\/5/g, 'hover:bg-gray-100'],
  [/hover:bg-white\/10/g, 'hover:bg-gray-200'],
  
  [/hover:text-white/g, 'hover:text-gray-900'],
  
  [/bg-white\/5/g, 'bg-gray-100'],
  [/bg-white\/10/g, 'bg-gray-200'],
  
  [/bg-white text-black/g, 'bg-gray-900 text-white'],
  [/hover:bg-neutral-200/g, 'hover:bg-gray-800'],
  
  [/bg-black\/20/g, 'bg-gray-100'],
  [/bg-black/g, 'bg-gray-200'],
  
  [/selection:bg-white selection:text-black/g, 'selection:bg-gray-900 selection:text-white'],
  
  [/placeholder:text-white\/20/g, 'placeholder:text-gray-400']
];

for (const [regex, replacement] of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced themes');
