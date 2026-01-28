import fs from 'fs';
import path from 'path';

// Create symlink for uploads in standalone build
// This ensures uploaded files are accessible when running in standalone mode

const standalonePublic = path.join(process.cwd(), '.next', 'standalone', 'public');
const uploadsLink = path.join(standalonePublic, 'uploads');
const uploadsTarget = '../../../public/uploads';

// Check if standalone build exists
if (!fs.existsSync(standalonePublic)) {
  console.log('Standalone build not found, skipping uploads symlink setup');
  process.exit(0);
}

// Ensure public/uploads exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created public/uploads directory');
}

// Create symlink if it doesn't exist
try {
  const stats = fs.lstatSync(uploadsLink);
  if (stats.isSymbolicLink()) {
    console.log('Uploads symlink already exists');
    process.exit(0);
  }
  // If it's a directory, remove it and create symlink
  fs.rmSync(uploadsLink, { recursive: true });
} catch (err) {
  // Link doesn't exist, that's fine
}

try {
  fs.symlinkSync(uploadsTarget, uploadsLink);
  console.log('Created uploads symlink in standalone build');
} catch (err) {
  console.error('Failed to create uploads symlink:', err.message);
  process.exit(1);
}
