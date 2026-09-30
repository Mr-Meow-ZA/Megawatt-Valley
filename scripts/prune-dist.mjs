#!/usr/bin/env node
/** Drop Kenney source packs from dist — only runtime /assets/game is needed. */
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const sourced = join(process.cwd(), 'dist', 'assets', 'sourced');
if (existsSync(sourced)) {
  rmSync(sourced, { recursive: true, force: true });
  console.log('prune-dist: removed dist/assets/sourced');
}
