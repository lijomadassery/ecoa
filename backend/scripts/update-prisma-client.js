#!/usr/bin/env node

/**
 * This script finds all files that create new PrismaClient instances
 * and updates them to use the singleton pattern instead.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Root directory to search
const rootDir = path.resolve(__dirname, '../');

// Find all files with "new PrismaClient" pattern
console.log('Finding files with "new PrismaClient" pattern...');
const grepOutput = execSync(`grep -l "new PrismaClient" ${rootDir}/**/*.ts`, { encoding: 'utf-8' });
const fileList = grepOutput.split('\n').filter(Boolean);

// Skip files we've already updated
const filesToSkip = [
  path.resolve(rootDir, 'src/lib/prisma.ts'),
  path.resolve(rootDir, 'src/controllers/communication-notes.controller.ts'),
  path.resolve(rootDir, 'src/index.ts'),
  path.resolve(rootDir, 'src/routes/prompts.routes.ts')
];

// Update each file
for (const filePath of fileList) {
  // Skip files we've already manually updated
  if (filesToSkip.includes(path.resolve(filePath))) {
    console.log(`Skipping already updated file: ${filePath}`);
    continue;
  }

  console.log(`Updating file: ${filePath}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace import
  content = content.replace(
    /import \{ PrismaClient \} from ['"]@prisma\/client['"];/g,
    `import { prisma } from '../lib/prisma';`
  );
  
  // Replace instance creation
  content = content.replace(
    /const prisma = new PrismaClient\(\);/g,
    ``
  );
  
  // Replace instance creation with options
  content = content.replace(
    /const prisma = new PrismaClient\({[\s\S]*?}\);/g,
    ``
  );
  
  // Write updated content back to file
  fs.writeFileSync(filePath, content);
  
  console.log(`Updated: ${filePath}`);
}

console.log('Done updating files.');
console.log('Remember to manually check and fix any path issues with imports.');
console.log('Remember to restart your server after these changes.'); 