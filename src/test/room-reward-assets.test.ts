import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROOM_REWARD_SPRITE_IDS } from '../station/roomRewardSprites';

describe('room reward sprite assets', () => {
  it('contains one valid public PNG for every approved reward', () => {
    ROOM_REWARD_SPRITE_IDS.forEach((id) => {
      const path = resolve('public', 'assets', 'room-rewards', `${id}.png`);

      expect(existsSync(path), id).toBe(true);
      expect(readFileSync(path).subarray(0, 8), id).toEqual(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      );
    });
  });
});
