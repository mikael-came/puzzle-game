import { Injectable, computed, signal } from '@angular/core';
import {
  BoardStatus,
  createEmptyPlacements,
  createPuzzle,
  createTutorialPuzzle,
  GRID_SIZE,
  PlacementBoard,
  RegionBoard,
  validateBoard,
} from './game';
import { GameTimerService } from './game-timer.service';
import { ProgressService } from './progress.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly regionColors = [
    '#f4c9cc',
    '#e9d8fa',
    '#c9e8d5',
    '#f8dfaa',
    '#cce4f6',
    '#f5d2b6',
    '#d8d8f4',
    '#e7e5d6',
  ];

  readonly currentLevel = signal(1);
  readonly isReplay = signal(false);
  readonly regions = signal<RegionBoard>(createTutorialPuzzle(1));
  readonly gridSize = computed(() => this.regions().length);
  readonly placements = signal<PlacementBoard>(createEmptyPlacements(4));
  readonly status = computed<BoardStatus>(() =>
    validateBoard(this.placements(), this.regions()),
  );
  readonly placedCount = computed(() =>
    this.status().rowCounts.reduce((total, count) => total + count, 0),
  );

  constructor(
    private readonly progress: ProgressService,
    private readonly timer: GameTimerService,
  ) {}

  openLevel(level: number): void {
    this.currentLevel.set(level);
    this.isReplay.set(false);
    const regions = level <= 4
      ? createTutorialPuzzle(level)
      : createPuzzle(this.randomForLevel(level));
    this.regions.set(regions);
    this.placements.set(this.progress.savedBoard(level, regions.length));
    this.timer.openLevel(level);
  }

  toggleCell(row: number, column: number): void {
    if (this.isLevelCompleted()) {
      return;
    }

    this.placements.update((placements) => {
      const nextPlacements = placements.map((currentRow) => [...currentRow]);
      const currentState = nextPlacements[row][column];
      nextPlacements[row][column] =
        currentState === 'empty' ? 'note' : currentState === 'note' ? 'unicorn' : 'empty';
      return nextPlacements;
    });
    this.progress.saveBoard(this.currentLevel(), this.placements());
    if (this.status().isComplete) {
      this.timer.finishLevel();
      this.isReplay.set(false);
    }
  }

  resetGame(): void {
    this.isReplay.set(this.progress.isLevelCompleted(this.currentLevel()));
    this.placements.set(createEmptyPlacements(this.gridSize()));
    this.progress.saveBoard(this.currentLevel(), this.placements());
    this.timer.restartLevel(this.isReplay());
  }

  isLevelCompleted(): boolean {
    return this.progress.isLevelCompleted(this.currentLevel()) && !this.isReplay();
  }

  private randomForLevel(level: number): () => number {
    let seed = (level * 2654435761) >>> 0;
    return () => {
      seed = (seed + 0x6d2b79f5) >>> 0;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  regionLabel(region: number): string {
    return String.fromCharCode(65 + region);
  }

  tutorialTitle(): string | null {
    return [
      'Tutoriel 1/4 · Une licorne par ligne',
      'Tutoriel 2/4 · Une licorne par colonne',
      'Tutoriel 3/4 · Une licorne par zone colorée',
      'Tutoriel 4/4 · Garder une case d’écart',
    ][this.currentLevel() - 1] ?? null;
  }

  tutorialDescription(): string | null {
    return [
      'Chaque ligne horizontale doit accueillir exactement une licorne.',
      'Chaque colonne verticale doit accueillir exactement une licorne.',
      'Chaque couleur correspond à une zone qui doit contenir exactement une licorne.',
      'Deux licornes ne peuvent pas se toucher, même en diagonale.',
    ][this.currentLevel() - 1] ?? null;
  }

  cellLabel(row: number, column: number): string {
    const region = this.regions()[row][column];
    const state = this.placements()[row][column];
    return `Ligne ${row + 1}, colonne ${column + 1}, zone ${this.regionLabel(region)}${
      state === 'unicorn'
        ? ', licorne placée, prochain clic pour vider la case'
        : state === 'note'
          ? ', croix de note, prochain clic pour placer une licorne'
          : ', case vide, appuyer pour ajouter une croix de note'
    }`;
  }

  hasCellConflict(row: number, column: number): boolean {
    const status = this.status();
    const region = this.regions()[row][column];
    return (
      status.rowCounts[row] > 1 ||
      status.columnCounts[column] > 1 ||
      status.regionCounts[region] > 1 ||
      status.adjacentConflictCells[row][column]
    );
  }
}
