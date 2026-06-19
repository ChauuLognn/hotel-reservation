const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.java')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const javaFiles = walkSync(path.join(__dirname, 'src', 'main', 'java'));
let strippedCount = 0;

javaFiles.forEach(file => {
  const buf = fs.readFileSync(file);
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    fs.writeFileSync(file, buf.slice(3));
    strippedCount++;
  }
});

console.log(`Stripped BOM from ${strippedCount} files.`);
