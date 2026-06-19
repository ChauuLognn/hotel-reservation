const fs = require('fs');
const path = require('path');

const featuresDir = path.join(__dirname, 'frontend-react', 'src', 'features');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const files = walkSync(featuresDir);

function removeBlock(content, startMatch) {
  let idx = content.indexOf(startMatch);
  if (idx === -1) return content;
  
  // Need to find the block start `{`
  let blockStart = content.indexOf('{', idx);
  if (blockStart === -1) return content;
  
  let braceCount = 1;
  let endIdx = blockStart + 1;
  
  while (braceCount > 0 && endIdx < content.length) {
    if (content[endIdx] === '{') braceCount++;
    else if (content[endIdx] === '}') braceCount--;
    endIdx++;
  }
  
  // if endIdx is right after a '}', we also want to remove trailing spaces/semicolons/newlines if possible
  while (endIdx < content.length && (content[endIdx] === ' ' || content[endIdx] === '\n' || content[endIdx] === '\r' || content[endIdx] === ';')) {
    endIdx++;
  }
  
  let before = content.slice(0, idx);
  // Remove "export " if it precedes startMatch
  if (before.endsWith('export ')) {
    before = before.slice(0, -7);
  } else if (before.endsWith('export const ')) { // This won't work well if startMatch doesn't include 'const'
  }
  
  return before + content.slice(endIdx);
}

const blockStarts = [
  'function formatVND(n)',
  'function formatDate(s)',
  'function formatDateTime(s)',
  'const STATUS_MAP =',
  'const BILL_STATUS =',
  'const ROLE_BADGE =',
  'const ROLE_LABELS =',
  'const getTodayString =',
  'const getTomorrowString =',
  'function getTodayString()',
  'function getTomorrowString()'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;
  
  // Iteratively remove blocks until none are left
  let modified = true;
  while(modified) {
    modified = false;
    for (const match of blockStarts) {
      if (content.includes(match)) {
        content = removeBlock(content, match);
        modified = true;
      }
    }
  }

  // Also remove "export " if left dangling
  content = content.replace(/export\s+(?=import|export|$)/g, ''); // just a safe guard
  
  // Replace usages
  content = content.replace(/\bSTATUS_MAP\b/g, 'RESERVATION_STATUS');
  content = content.replace(/\bBILL_STATUS\b/g, 'RESERVATION_STATUS');

  if (content !== originalContent) {
    let needsFormat = content.includes('formatVND') || content.includes('formatDate') || content.includes('formatDateTime');
    let needsStatusMaps = content.includes('RESERVATION_STATUS') || content.includes('ROLE_BADGE') || content.includes('ROOM_STATUS');
    let needsRoleConstants = content.includes('ROLE_LABELS') || content.includes('ROLE_IDS');
    let needsDate = content.includes('getTodayString') || content.includes('getTomorrowString');

    let imports = '';
    if (needsFormat && !content.includes('@shared/utils/format')) {
      imports += `import { formatVND, formatDate, formatDateTime } from '@shared/utils/format';\n`;
    }
    if (needsDate && !content.includes('@shared/utils/date')) {
      imports += `import { getTodayString, getTomorrowString } from '@shared/utils/date';\n`;
    }
    if (needsStatusMaps && !content.includes('@shared/constants/statusMaps')) {
      imports += `import { RESERVATION_STATUS, ROOM_STATUS, ROLE_BADGE } from '@shared/constants/statusMaps';\n`;
    }
    if (needsRoleConstants && !content.includes('@shared/constants/roleConstants')) {
      imports += `import { ROLE_LABELS, ROLE_IDS } from '@shared/constants/roleConstants';\n`;
    }
    
    if (imports) {
      const importLines = content.match(/^import .*?;?$/gm);
      if (importLines && importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        content = content.replace(lastImport, `${lastImport}\n${imports}`);
      } else {
        content = `${imports}\n${content}`;
      }
    }
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done.');
