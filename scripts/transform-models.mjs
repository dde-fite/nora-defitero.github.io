import {
  readdir,
  mkdir,
  access,
  unlink,
  rmdir,
} from 'node:fs/promises';

import {
  join,
  extname,
  relative,
  dirname,
} from 'node:path';

import { spawn } from 'node:child_process';

const INPUT_DIR = 'src/lib/assets/models';
const OUTPUT_DIR = 'static/models';

const EXTENSIONS = new Set(['.gltf', '.glb']);

async function findModels(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findModels(fullPath));
    } else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`gltf-transform finished with code ${code}`)
        );
      }
    });
  });
}

async function removeEmptyDirectories(dir) {
  if (!(await exists(dir))) {
    return;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = join(dir, entry.name);

      await removeEmptyDirectories(subDir);

      try {
        await rmdir(subDir);
      } catch {
      }
    }
  }
}

const sourceModels = await findModels(INPUT_DIR);

const sourceRelativePaths = new Set(
  sourceModels.map((file) => relative(INPUT_DIR, file))
);

let deleted = 0;

if (await exists(OUTPUT_DIR)) {
  const outputModels = await findModels(OUTPUT_DIR);

  for (const output of outputModels) {
    const relativePath = relative(OUTPUT_DIR, output);

    if (!sourceRelativePaths.has(relativePath)) {
      await unlink(output);

      console.log(`🗑 Eliminado: ${relativePath}`);

      deleted++;
    }
  }
}

await removeEmptyDirectories(OUTPUT_DIR);

let optimized = 0;
let skipped = 0;

for (const input of sourceModels) {
  const relativePath = relative(INPUT_DIR, input);
  const output = join(OUTPUT_DIR, relativePath);

  if (await exists(output)) {
    skipped++;
    continue;
  }

  await mkdir(dirname(output), { recursive: true });


  await run('npx', [
    'gltf-transform',
    'optimize',
    input,
    output,
	'--simplify',
	'false',
    '--texture-compress',
    'webp',
  ]);

  console.log(`Done: ${output}\n`);

  optimized++;
}
// ✔ dedup                5ms
// ✔ instance             0ms
// ✔ palette              0ms
// ✔ flatten              1ms
// ✔ join                 28ms
// ✔ weld                 32ms
// ✔ simplify             45ms
// ✔ resample             0ms
// ✔ prune                159ms
// ✔ sparse               18ms
// ✔ textureCompress      938ms
// ✔ meshopt    