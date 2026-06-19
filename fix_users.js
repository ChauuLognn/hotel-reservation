const fs = require('fs');
const file = 'frontend-react/src/features/users/Users.jsx';
let content = fs.readFileSync(file, 'utf-8');

// Remove ROLE_IDS
content = content.replace(/const ROLE_IDS = \{\s*MANAGER: 1,\s*EMPLOYEE: 2,\s*\};\s*/g, '');

// Remove ROLE_LABELS
content = content.replace(/const ROLE_LABELS = \{\s*1: 'MANAGER',\s*2: 'EMPLOYEE',\s*MANAGER:\s*'MANAGER',\s*EMPLOYEE:\s*'EMPLOYEE',\s*\};\s*/g, '');

// Remove STATUS_MAP, ROLE_BADGE, BILL_STATUS just in case
content = content.replace(/const STATUS_MAP = \{[\s\S]*?\};\s*/g, '');
content = content.replace(/const BILL_STATUS = \{[\s\S]*?\};\s*/g, '');
content = content.replace(/const ROLE_BADGE = \{[\s\S]*?\};\s*/g, '');

content = content.replace(/\bSTATUS_MAP\b/g, 'RESERVATION_STATUS');
content = content.replace(/\bBILL_STATUS\b/g, 'RESERVATION_STATUS');

const imports = `import { RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE } from '@shared/constants/statusMaps';\nimport { ROLE_LABELS, ROLE_IDS } from '@shared/constants/roleConstants';\n`;

// Add imports
if (!content.includes('@shared/constants/statusMaps')) {
  const lines = content.split('\n');
  const lastImportIndex = lines.map(l => l.startsWith('import')).lastIndexOf(true);
  lines.splice(lastImportIndex + 1, 0, imports);
  content = lines.join('\n');
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed Users.jsx');
