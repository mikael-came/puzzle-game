import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameTimerService } from './game-timer.service';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('unlocks each next pack after six levels in the current pack are completed', () => {
    const progress = new ProgressService();

    expect(progress.unlockedLevelCount()).toBe(10);
    expect(progress.isLevelAccessible(10)).toBe(true);
    expect(progress.isLevelAccessible(11)).toBe(false);

    for (let level = 1; level <= 6; level++) {
      progress.completeLevel(level);
    }

    expect(progress.unlockedLevelCount()).toBe(20);
    expect(progress.isLevelAccessible(11)).toBe(true);
    expect(progress.isLevelAccessible(21)).toBe(false);

    for (let level = 11; level <= 16; level++) {
      progress.completeLevel(level);
    }
    expect(progress.unlockedLevelCount()).toBe(30);
  });

  it('persists completion, elapsed time, and board notes between instances', () => {
    const progress = new ProgressService();
    progress.completeLevel(1);
    progress.saveElapsedTime(2, 95);
    progress.saveBoard(2, Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, column) => row === 0 && column === 0 ? 'note' : 'empty'),
    ));

    const restored = new ProgressService();
    expect(restored.isLevelCompleted(1)).toBe(true);
    expect(restored.elapsedTime(2)).toBe(95);
    expect(restored.savedBoard(2)[0][0]).toBe('note');
  });

  it('restores a tutorial board with its own grid size', () => {
    const progress = new ProgressService();
    const tutorialBoard = Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 4 }, (_, column) => row === 0 && column === 0 ? 'note' : 'empty'),
    );
    progress.saveBoard(1, tutorialBoard);

    const restored = new ProgressService();
    expect(restored.savedBoard(1, 4)).toHaveLength(4);
    expect(restored.savedBoard(1, 4)[0][0]).toBe('note');
  });
});

describe('GameTimerService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pauses and restores the elapsed time when a level is reopened', () => {
    const progress = new ProgressService();
    const timer = new GameTimerService(progress);
    timer.openLevel(1);
    vi.advanceTimersByTime(3000);

    expect(timer.formattedTime()).toBe('00:03');
    timer.pause();
    vi.advanceTimersByTime(2000);
    expect(timer.formattedTime()).toBe('00:03');

    const reopenedTimer = new GameTimerService(new ProgressService());
    reopenedTimer.openLevel(1);
    expect(reopenedTimer.formattedTime()).toBe('00:03');
    expect(reopenedTimer.isRunning()).toBe(false);
  });
});
