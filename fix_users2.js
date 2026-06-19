const fs = require('fs');
const file = 'frontend-react/src/features/users/Users.jsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace using simple string replace
content = content.replace(`
const ROLE_LABELS = {
  1: 'MANAGER',
  2: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};`, '');

content = content.replace(`
const ROLE_IDS = {
  MANAGER: 1,
  EMPLOYEE: 2,
};`, '');

// Add imports
const imports = `import { RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE } from '@shared/constants/statusMaps';\nimport { ROLE_LABELS, ROLE_IDS } from '@shared/constants/roleConstants';\n`;

if (!content.includes('@shared/constants/statusMaps')) {
  const lines = content.split('\n');
  const lastImportIndex = lines.map(l => l.startsWith('import')).lastIndexOf(true);
  lines.splice(lastImportIndex + 1, 0, imports);
  content = lines.join('\n');
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed Users.jsx using exact string replace');
