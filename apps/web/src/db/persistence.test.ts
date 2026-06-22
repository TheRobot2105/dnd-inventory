import { describe, expect, it, beforeEach } from 'vitest';

import { db } from './schema';
import { loadAppState } from './load';
import { saveAppState, createDebouncedSaver } from './save';
import { wipeAll } from './wipe';

beforeEach(async () => {
  await wipeAll();
});

describe('persistence plumbing', () => {
  it('loadAppState returns null when nothing is stored', async () => {
    expect(await loadAppState()).toBeNull();
  });

  it('saveAppState then loadAppState round-trips an opaque blob', async () => {
    const blob = { version: 1 as const, hello: 'world', n: 42 };
    await saveAppState(blob);
    expect(await loadAppState()).toEqual(blob);
  });

  it('wipeAll clears every store including meta', async () => {
    await saveAppState({ version: 1, marker: true });
    await db.table('users').put({ id: 'u1' });
    await wipeAll();
    expect(await loadAppState()).toBeNull();
    expect(await db.table('users').count()).toBe(0);
  });

  it('createDebouncedSaver coalesces rapid writes into one persisted state', async () => {
    const saver = createDebouncedSaver(10);
    saver.save({ n: 1 });
    saver.save({ n: 2 });
    saver.save({ n: 3 });
    await saver.flush();
    expect(await loadAppState()).toEqual({ n: 3 });
  });

  it('createDebouncedSaver flush is a no-op when nothing is pending', async () => {
    const saver = createDebouncedSaver(10);
    await saver.flush();
    expect(await loadAppState()).toBeNull();
  });
});
