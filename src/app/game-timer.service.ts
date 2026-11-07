import { Injectable, computed, signal } from '@angular/core';
import { ProgressService } from './progress.service';

@Injectable({ providedIn: 'root' })
export class GameTimerService {
  private intervalId?: ReturnType<typeof setInterval>;
  private replayingCompletedLevel = false;

  readonly level = signal<number | null>(null);
  readonly elapsedSeconds = signal(0);
  readonly isRunning = signal(false);
  readonly formattedTime = computed(() => {
    const seconds = this.elapsedSeconds();
    const minutesPart = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secondsPart = (seconds % 60).toString().padStart(2, '0');
    return `${minutesPart}:${secondsPart}`;
  });

  constructor(private readonly progress: ProgressService) {}

  openLevel(level: number): void {
    this.pause();
    this.replayingCompletedLevel = false;
    this.level.set(level);
    this.elapsedSeconds.set(this.progress.elapsedTime(level));
    if (!this.progress.isLevelCompleted(level) && this.elapsedSeconds() === 0) {
      this.resume();
    }
  }

  restartLevel(replayCompletedLevel = false): void {
    const level = this.level();
    if (level === null) {
      return;
    }

    this.pause();
    this.replayingCompletedLevel = replayCompletedLevel;
    this.elapsedSeconds.set(0);
    this.progress.saveElapsedTime(level, 0);
    this.resume();
  }

  resume(): void {
    const level = this.level();
    if (
      level === null ||
      this.isRunning() ||
      (this.progress.isLevelCompleted(level) && !this.replayingCompletedLevel)
    ) {
      return;
    }

    this.isRunning.set(true);
    this.intervalId = setInterval(() => {
      const elapsed = this.elapsedSeconds() + 1;
      this.elapsedSeconds.set(elapsed);
      this.progress.saveElapsedTime(level, elapsed);
    }, 1000);
  }

  pause(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning.set(false);
    const level = this.level();
    if (level !== null) {
      this.progress.saveElapsedTime(level, this.elapsedSeconds());
    }
  }

  finishLevel(): void {
    const level = this.level();
    if (level === null) {
      return;
    }
    this.pause();
    this.progress.completeLevel(level);
    this.replayingCompletedLevel = false;
  }
}
