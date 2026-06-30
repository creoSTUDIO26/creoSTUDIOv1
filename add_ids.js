const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

// Update Interface
content = content.replace(
  'subsections: {',
  'subsections: {\n    id?: string;'
);

// Update PortfolioProject
content = content.replace(
  'featured: boolean;\n  sections: ProjectSection[];\n}',
  'featured: boolean;\n  sections: ProjectSection[];\n  linkedWorkId?: string;\n}'
);

// We need to inject id: 'work-xyz' into every object inside subsections array.
let idCounter = 1;
content = content.replace(/\{\s*title:\s*\"/g, match => {
  return '{\n        id: \"work-ai-' + (idCounter++) + '\",\n        title: \"';
});

fs.writeFileSync('src/types.ts', content);
console.log('types.ts updated successfully');
