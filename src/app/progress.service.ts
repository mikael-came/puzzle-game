import { Injectable, computed, signal } from '@angular/core';
import { CellState, GRID_SIZE, PlacementBoard, createEmptyPlacements } from './game';

const STORAGE_KEY = 'licorne.progress.v1';
const LEVELS_PER_PACK = 10;
const REQUIRED_COMPLETIONS = 6;

interface SavedProgress {
  completedLevels: number[];
  elapsedSeconds: Record<string, number>;
  boards: Record<string, CellState[][]>;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly saved = signal<SavedProgress>(this.load());

  readonly completedCount = computed(() => this.saved().completedLevels.length);
  readonly unlockedLevelCount = computed(() => {
    let unlockedPacks = 1;
    while (this.completedInPack(unlockedPacks - 1) >= REQUIRED_COMPLETIONS) {
      unlockedPacks++;
    }
    return unlockedPacks * LEVELS_PER_PACK;
  });

  isLevelCompleted(level: number): boolean {
    return this.saved().completedLevels.includes(level);
  }

  isLevelAccessible(level: number): boolean {
    return Number.isInteger(level) && level > 0 && level <= this.unlockedLevelCount();
  }

  completedInPack(packIndex: number): number {
    const firstLevel = packIndex * LEVELS_PER_PACK + 1;
    const lastLevel = firstLevel + LEVELS_PER_PACK;
    return this.saved().completedLevels.filter(
      (level) => level >= firstLevel && level < lastLevel,
    ).length;
  }

  elapsedTime(level: number): number {
    return this.saved().elapsedSeconds[String(level)] ?? 0;
  }

  saveElapsedTime(level: number, seconds: number): void {
    this.update((progress) => ({
      ...progress,
      elapsedSeconds: { ...progress.elapsedSeconds, [level]: Math.max(0, Math.floor(seconds)) },
    }));
  }

  savedBoard(level: number, size = GRID_SIZE): PlacementBoard {
    const board = this.saved().boards[String(level)];
    if (
      !board ||
      board.length !== size ||
      board.some((row) => row.length !== size || row.some((cell) =>
        cell !== 'empty' && cell !== 'note' && cell !== 'unicorn',
      ))
    ) {
      return createEmptyPlacements(size);
    }
    return board.map((row) => [...row]);
  }

  saveBoard(level: number, board: PlacementBoard): void {
    this.update((progress) => ({
      ...progress,
      boards: {
        ...progress.boards,
        [level]: board.map((row) => [...row]),
      },
    }));
  }

  completeLevel(level: number): void {
    if (this.isLevelCompleted(level)) {
      return;
    }
    this.update((progress) => ({
      ...progress,
      completedLevels: [...progress.completedLevels, level].sort((a, b) => a - b),
    }));
  }

  private update(updater: (progress: SavedProgress) => SavedProgress): void {
    const next = updater(this.saved());
    this.saved.set(next);
    this.persist(next);
  }

  private load(): SavedProgress {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { completedLevels: [], elapsedSeconds: {}, boards: {} };
      }

      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Données de progression invalides.');
      }
      const data = parsed as Partial<SavedProgress>;
      return {
        completedLevels: Array.isArray(data.completedLevels)
          ? data.completedLevels.filter((level): level is number =>
              Number.isInteger(level) && level > 0,
            )
          : [],
        elapsedSeconds: data.elapsedSeconds && typeof data.elapsedSeconds === 'object'
          ? data.elapsedSeconds
          : {},
        boards: data.boards && typeof data.boards === 'object' ? data.boards : {},
      };
    } catch (error) {
      console.error('Impossible de charger la progression sauvegardée.', error);
      return { completedLevels: [], elapsedSeconds: {}, boards: {} };
    }
  }

  private persist(progress: SavedProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Impossible de sauvegarder la progression.', error);
    }
  }
}
