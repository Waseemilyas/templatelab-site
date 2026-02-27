'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  collectManifestRows,
  toCsv
} = require('../scripts/generate-product-manifest.js');

async function createFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, 'placeholder', 'utf8');
}

test('collectManifestRows flags missing required files without throwing', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'manifest-test-'));

  await createFile(path.join(tempRoot, 'spreadsheet-templates', 'budget-tracker', 'budget-tracker.xlsx'));
  await createFile(path.join(tempRoot, 'spreadsheet-templates', 'budget-tracker', 'preview.png'));

  await createFile(path.join(tempRoot, 'cheat-sheets', 'git-commands', 'preview.jpg'));

  await createFile(path.join(tempRoot, 'printables', 'goal-setting', 'goal-setting.pdf'));

  const rows = await collectManifestRows(tempRoot);
  assert.equal(rows.length, 3);

  const byPath = Object.fromEntries(rows.map((row) => [row.path, row]));

  assert.equal(byPath['spreadsheet-templates/budget-tracker'].has_product_file, 'yes');
  assert.equal(byPath['spreadsheet-templates/budget-tracker'].has_preview, 'yes');
  assert.equal(byPath['spreadsheet-templates/budget-tracker'].missing_required_files, '');

  assert.equal(byPath['cheat-sheets/git-commands'].has_product_file, 'no');
  assert.equal(byPath['cheat-sheets/git-commands'].has_preview, 'yes');
  assert.equal(byPath['cheat-sheets/git-commands'].missing_required_files, 'product_file');

  assert.equal(byPath['printables/goal-setting'].has_product_file, 'yes');
  assert.equal(byPath['printables/goal-setting'].has_preview, 'no');
  assert.equal(byPath['printables/goal-setting'].missing_required_files, 'preview');

  const csv = toCsv(rows);
  assert.match(csv, /product_name,category,path,has_product_file,has_preview,missing_required_files/);
  assert.match(csv, /product_file/);
  assert.match(csv, /preview/);

  await fs.rm(tempRoot, { recursive: true, force: true });
});
