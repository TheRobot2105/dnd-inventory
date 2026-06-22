import { describe, expect, it, beforeEach } from 'vitest';

import { useStore, flushPendingPersist } from './index';
import { loadAppState } from '@/db/load';
import { wipeAll } from '@/db/wipe';

beforeEach(async () => {
  // Reset both the store and the persisted DB so tests don't see each other.
  useStore.setState({ appState: null, log: [] });
  await wipeAll();
});

describe('store / reducer plumbing (M0)', () => {
  it('starts with null appState and empty log', () => {
    const s = useStore.getState();
    expect(s.appState).toBeNull();
    expect(s.log).toEqual([]);
  });

  it('dispatch appends a transaction log entry with action type + payload', () => {
    const { dispatch } = useStore.getState();
    dispatch({ type: '__noop', payload: { msg: 'hello' } });

    const { log } = useStore.getState();
    expect(log).toHaveLength(1);
    expect(log[0]?.type).toBe('__noop');
    expect(log[0]?.payload).toEqual({ msg: 'hello' });
    expect(log[0]?.id).toMatch(/[0-9a-f-]{36}/);
    expect(log[0]?.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('dispatch triggers a debounced persist that round-trips through Dexie', async () => {
    const { dispatch } = useStore.getState();
    dispatch({ type: '__noop' });
    dispatch({ type: '__noop' });

    // Nothing written yet (debounce window still open).
    expect(await loadAppState()).toBeNull();

    await flushPendingPersist();

    const persisted = await loadAppState();
    expect(persisted).toMatchObject({
      appState: null,
      log: expect.arrayContaining([expect.objectContaining({ type: '__noop' })]) as unknown,
    });
  });

  it('successive dispatches accumulate log entries in order', () => {
    const { dispatch } = useStore.getState();
    dispatch({ type: 'a' });
    dispatch({ type: 'b' });
    dispatch({ type: 'c' });

    const types = useStore.getState().log.map((e) => e.type);
    expect(types).toEqual(['a', 'b', 'c']);
  });
});
