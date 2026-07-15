import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CLOUD_SAVE_INTERVAL_MS, CloudSaveQueue } from '../platform/cloudSaveQueue';

describe('CloudSaveQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends only the latest state at the bounded cloud-save interval', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const queue = new CloudSaveQueue(save);

    queue.enqueue('save', 'state-0');

    for (let second = 1; second <= 30; second += 1) {
      queue.enqueue('save', `state-${second}`);
      await vi.advanceTimersByTimeAsync(1_000);
    }

    expect(CLOUD_SAVE_INTERVAL_MS).toBe(15_000);
    expect(save).toHaveBeenCalledTimes(3);
    expect(save).toHaveBeenNthCalledWith(1, 'save', 'state-0');
    expect(save).toHaveBeenNthCalledWith(2, 'save', 'state-15');
    expect(save).toHaveBeenNthCalledWith(3, 'save', 'state-30');

    queue.dispose();
  });

  it('flushes the latest pending state immediately when the page is hidden', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const queue = new CloudSaveQueue(save);

    queue.enqueue('save', 'state-0');
    await vi.advanceTimersByTimeAsync(1_000);
    queue.enqueue('save', 'state-hidden');
    await queue.flushNow();

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith('save', 'state-hidden');

    queue.dispose();
  });
});
