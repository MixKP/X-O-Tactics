import { describe, it, expect } from 'vitest';
import { addMP, consumeMP, hasEnoughMP, resetMP, MP_MIN, MP_MAX, MP_GAIN_PER_TURN } from './mp-manager';

describe('MP Constants', () => {
  it('should have correct MP limits', () => {
    expect(MP_MIN).toBe(0);
    expect(MP_MAX).toBe(5);
    expect(MP_GAIN_PER_TURN).toBe(1);
  });
});

describe('addMP', () => {
  it('should add MP correctly', () => {
    const playerState = { mp: 2 };
    const newState = addMP(playerState, 1);

    expect(newState.mp).toBe(3);
  });

  it('should use default MP_GAIN_PER_TURN when amount not specified', () => {
    const playerState = { mp: 2 };
    const newState = addMP(playerState);

    expect(newState.mp).toBe(3);
  });

  it('should cap MP at MP_MAX', () => {
    const playerState = { mp: 4 };
    const newState = addMP(playerState, 3); // Try to add 3, would be 7

    expect(newState.mp).toBe(5); // Should cap at 5
  });

  it('should not exceed MP_MAX even at max already', () => {
    const playerState = { mp: 5 };
    const newState = addMP(playerState, 1);

    expect(newState.mp).toBe(5);
  });

  it('should create new state object (immutability)', () => {
    const originalState = { mp: 2 };
    const newState = addMP(originalState, 1);

    expect(originalState.mp).toBe(2);
    expect(newState.mp).toBe(3);
    expect(newState).not.toBe(originalState);
  });
});

describe('consumeMP', () => {
  it('should consume MP correctly', () => {
    const playerState = { mp: 5 };
    const newState = consumeMP(playerState, 3);

    expect(newState.mp).toBe(2);
  });

  it('should throw error when not enough MP', () => {
    const playerState = { mp: 2 };

    expect(() => consumeMP(playerState, 3)).toThrow('Not enough MP');
  });

  it('should allow consuming all MP', () => {
    const playerState = { mp: 3 };
    const newState = consumeMP(playerState, 3);

    expect(newState.mp).toBe(0);
  });

  it('should create new state object (immutability)', () => {
    const originalState = { mp: 5 };
    const newState = consumeMP(originalState, 2);

    expect(originalState.mp).toBe(5);
    expect(newState.mp).toBe(3);
    expect(newState).not.toBe(originalState);
  });
});

describe('hasEnoughMP', () => {
  it('should return true when player has enough MP', () => {
    const playerState = { mp: 3 };
    expect(hasEnoughMP(playerState, 2)).toBe(true);
    expect(hasEnoughMP(playerState, 3)).toBe(true);
  });

  it('should return false when player lacks MP', () => {
    const playerState = { mp: 2 };
    expect(hasEnoughMP(playerState, 3)).toBe(false);
  });

  it('should return true for zero cost', () => {
    const playerState = { mp: 0 };
    expect(hasEnoughMP(playerState, 0)).toBe(true);
  });
});

describe('resetMP', () => {
  it('should reset MP to 0', () => {
    const newState = resetMP();

    expect(newState.mp).toBe(0);
  });
});
