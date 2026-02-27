#!/usr/bin/env node

'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const PREVIEW_FILE_PATTERN = /^preview\.(png|jpe?g|webp)$/i;

function printHelp() {
  const helpText = [
    'Generate a CSV manifest for product folders.',
    '',
    'Usage:',
    '  node scripts/generate-product-manifest.js [--root <dir>] [--output <file>]',
    '',
    'Options:',
    '  --root, -r    Root directory that contains category folders (default: ./products)',
    '  --output, -o  Output CSV path (default: ./product-manifest.csv)',
    '  --help, -h    Show this help text'
  ].join('\n');

  console.log(helpText);
}

function parseArgs(argv, cwd = process.cwd()) {
  const options = {
    root: path.resolve(cwd, 'products'),
    output: path.resolve(cwd, 'product-manifest.csv'),
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--root' || arg === '-r') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --root');
      }
      options.root = path.resolve(cwd, value);
      index += 1;
      continue;
    }

    if (arg === '--output' || arg === '-o') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Missing value for --output');
      }
      options.output = path.resolve(cwd, value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function titleize(segment) {
  return segment
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toManifestPath(rootDir, targetDir) {
  return path.relative(rootDir, targetDir).split(path.sep).join('/');
}

function escapeCsv(value) {
  const normalized = String(value ?? '');
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

async function readDirectories(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(dirPath, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function getRequiredFileStatus(productDir) {
  const entries = await fs.readdir(productDir, { withFileTypes: true });
  let hasProductFile = false;
  let hasPreview = false;

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) {
      continue;
    }

    if (PREVIEW_FILE_PATTERN.test(entry.name)) {
      hasPreview = true;
      continue;
    }

    hasProductFile = true;
  }

  const missing = [];
  if (!hasProductFile) {
    missing.push('product_file');
  }
  if (!hasPreview) {
    missing.push('preview');
  }

  return {
    hasProductFile,
    hasPreview,
    missingRequiredFiles: missing.join('|')
  };
}

async function collectManifestRows(rootDir) {
  const rows = [];
  const categoryDirs = await readDirectories(rootDir);

  for (const categoryDir of categoryDirs) {
    const categoryName = titleize(path.basename(categoryDir));
    const productDirs = await readDirectories(categoryDir);

    for (const productDir of productDirs) {
      const productName = titleize(path.basename(productDir));
      const status = await getRequiredFileStatus(productDir);

      rows.push({
        product_name: productName,
        category: categoryName,
        path: toManifestPath(rootDir, productDir),
        has_product_file: status.hasProductFile ? 'yes' : 'no',
        has_preview: status.hasPreview ? 'yes' : 'no',
        missing_required_files: status.missingRequiredFiles
      });
    }
  }

  return rows;
}

function toCsv(rows) {
  const headers = [
    'product_name',
    'category',
    'path',
    'has_product_file',
    'has_preview',
    'missing_required_files'
  ];

  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((header) => escapeCsv(row[header]));
    lines.push(values.join(','));
  }

  return `${lines.join('\n')}\n`;
}

async function writeManifest(outputPath, csvContents) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, csvContents, 'utf8');
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (options.help) {
      printHelp();
      return;
    }

    const rows = await collectManifestRows(options.root);
    const csvContents = toCsv(rows);
    await writeManifest(options.output, csvContents);

    const flaggedRows = rows.filter((row) => row.missing_required_files).length;
    console.log(`Manifest written: ${options.output}`);
    console.log(`Products scanned: ${rows.length}`);
    console.log(`Rows flagged: ${flaggedRows}`);
  } catch (error) {
    console.error(`Failed to generate manifest: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  PREVIEW_FILE_PATTERN,
  parseArgs,
  collectManifestRows,
  getRequiredFileStatus,
  toCsv
};
