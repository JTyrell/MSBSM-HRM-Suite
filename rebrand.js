/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'components', 'hrm');

const replaceColors = (content) => {
  // Regex patterns to match Tailwind classes and replace them
  // emerald-500 -> msbm-red
  // teal-600 -> inner-blue
  // emerald-50 -> msbm-red/5
  // emerald-900 -> msbm-red/20
  // emerald-950 -> msbm-red/30
  // emerald-100 -> msbm-red/10
  // emerald-200 -> msbm-red/20
  // emerald-300 -> msbm-red-bright
  // emerald-400 -> msbm-red
  // emerald-600 -> msbm-red
  // emerald-700 -> msbm-red
  // emerald-800 -> msbm-red
  
  let newContent = content;

  // General emerald/teal to msbm-red/inner-blue replacements
  newContent = newContent.replace(/from-emerald-\d+/g, 'from-msbm-red');
  newContent = newContent.replace(/to-teal-\d+/g, 'to-inner-blue');
  newContent = newContent.replace(/hover:from-emerald-\d+/g, 'hover:from-msbm-red-bright');
  newContent = newContent.replace(/hover:to-teal-\d+/g, 'hover:to-light-blue');

  // Text colors
  newContent = newContent.replace(/text-emerald-\d+/g, 'text-msbm-red');
  newContent = newContent.replace(/text-teal-\d+/g, 'text-inner-blue');

  // Border colors
  newContent = newContent.replace(/border-emerald-\d+\/\d+/g, 'border-msbm-red/20');
  newContent = newContent.replace(/border-emerald-\d+/g, 'border-msbm-red/20');
  newContent = newContent.replace(/border-teal-\d+/g, 'border-inner-blue/20');

  // BG colors
  newContent = newContent.replace(/bg-emerald-50\/(\d+)/g, 'bg-msbm-red/5');
  newContent = newContent.replace(/bg-emerald-50/g, 'bg-msbm-red/5');
  newContent = newContent.replace(/bg-emerald-100/g, 'bg-msbm-red/10');
  newContent = newContent.replace(/bg-emerald-900\/50/g, 'bg-msbm-red/20');
  newContent = newContent.replace(/bg-emerald-900\/40/g, 'bg-msbm-red/20');
  newContent = newContent.replace(/bg-emerald-950\/30/g, 'bg-msbm-red/30');
  newContent = newContent.replace(/bg-emerald-950\/20/g, 'bg-msbm-red/20');
  newContent = newContent.replace(/bg-emerald-950\/40/g, 'bg-msbm-red/30');
  newContent = newContent.replace(/bg-emerald-\d+/g, 'bg-msbm-red');
  newContent = newContent.replace(/bg-teal-\d+/g, 'bg-inner-blue');

  // Hover BG colors
  newContent = newContent.replace(/hover:bg-emerald-\d+\/\d+/g, 'hover:bg-msbm-red/10');
  newContent = newContent.replace(/hover:bg-emerald-\d+/g, 'hover:bg-msbm-red/10');

  // Rings and Shadows
  newContent = newContent.replace(/ring-emerald-\d+/g, 'ring-msbm-red');
  newContent = newContent.replace(/shadow-emerald-\d+\/\d+/g, 'shadow-msbm-red/20');
  newContent = newContent.replace(/shadow-emerald-\d+/g, 'shadow-msbm-red');

  // Raw color words (like color="emerald")
  newContent = newContent.replace(/color="emerald"/g, 'color="msbm-red"');
  newContent = newContent.replace(/color="teal"/g, 'color="inner-blue"');

  // Timeline dots
  newContent = newContent.replace(/timeline-dot-emerald/g, 'timeline-dot-msbm-red');

  return newContent;
};

const processDirectory = (dirPath) => {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replaceColors(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
};

processDirectory(directoryPath);
console.log('Rebranding script completed.');
