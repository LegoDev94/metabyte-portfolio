import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Setup standalone build for production
// 1. Copy static files to standalone/.next/static
// 2. Copy public folder (except uploads) to standalone/public
// 3. Create symlink for uploads

const cwd = process.cwd();
const standaloneDir = path.join(cwd, '.next', 'standalone');
const standalonePublic = path.join(standaloneDir, 'public');
const standaloneStatic = path.join(standaloneDir, '.next', 'static');

// Check if standalone build exists
if (!fs.existsSync(standaloneDir)) {
  console.log('Standalone build not found, skipping setup');
  process.exit(0);
}

// 1. Copy .next/static to standalone/.next/static
const sourceStatic = path.join(cwd, '.next', 'static');
if (fs.existsSync(sourceStatic)) {
  fs.cpSync(sourceStatic, standaloneStatic, { recursive: true });
  console.log('Copied .next/static to standalone build');
}

// 2. Copy public folder (except uploads) to standalone/public
const sourcePublic = path.join(cwd, 'public');
if (fs.existsSync(sourcePublic)) {
  // Ensure standalone/public exists
  if (!fs.existsSync(standalonePublic)) {
    fs.mkdirSync(standalonePublic, { recursive: true });
  }

  // Copy all files except uploads
  const entries = fs.readdirSync(sourcePublic, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'uploads') continue; // Skip uploads - will be symlinked

    const srcPath = path.join(sourcePublic, entry.name);
    const destPath = path.join(standalonePublic, entry.name);

    if (entry.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  console.log('Copied public folder to standalone build');
}

// 3. Ensure public/uploads exists
const uploadsDir = path.join(cwd, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created public/uploads directory');
}

// 4. Create symlink for uploads in standalone build
const uploadsLink = path.join(standalonePublic, 'uploads');
const uploadsTarget = '../../../public/uploads';

try {
  const stats = fs.lstatSync(uploadsLink);
  if (stats.isSymbolicLink()) {
    console.log('Uploads symlink already exists');
  } else {
    // If it's a directory, remove it and create symlink
    fs.rmSync(uploadsLink, { recursive: true });
    fs.symlinkSync(uploadsTarget, uploadsLink);
    console.log('Created uploads symlink in standalone build');
  }
} catch (err) {
  // Link doesn't exist, create it
  try {
    fs.symlinkSync(uploadsTarget, uploadsLink);
    console.log('Created uploads symlink in standalone build');
  } catch (symlinkErr) {
    console.error('Failed to create uploads symlink:', symlinkErr.message);
    process.exit(1);
  }
}

console.log('Standalone build setup complete!');
