const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prismaDir = path.resolve(__dirname, '../database/prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const tempSchemaPath = path.join(prismaDir, 'schema.temp.prisma');
const tempOutputDir = path.join(prismaDir, 'temp_client');
const targetClientDir = path.resolve(__dirname, '../node_modules/.prisma/client');

console.log('Preparing safe generate...');

// Read original schema
let content = fs.readFileSync(schemaPath, 'utf8');
// Replace output path to tempOutputDir
content = content.replace(
  'output   = "../../node_modules/.prisma/client"',
  `output   = "./temp_client"`
);
fs.writeFileSync(tempSchemaPath, content, 'utf8');

try {
  console.log('Running prisma generate to temp_client...');
  execSync(`npx prisma generate --schema="${tempSchemaPath}"`, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  console.log('Copying generated JS/TS files to target client dir...');
  const files = fs.readdirSync(tempOutputDir);
  for (const file of files) {
    if (file.endsWith('.dll.node') || file.includes('tmp')) {
      continue; // Skip the locked binary file
    }
    const src = path.join(tempOutputDir, file);
    const dest = path.join(targetClientDir, file);

    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`Copied: ${file}`);
  }

  console.log('Safe generate completed successfully!');
} finally {
  if (fs.existsSync(tempSchemaPath)) fs.unlinkSync(tempSchemaPath);
  if (fs.existsSync(tempOutputDir)) fs.rmSync(tempOutputDir, { recursive: true, force: true });
}
