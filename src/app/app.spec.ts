import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { GameService } from './game.service';
import { GameTimerService } from './game-timer.service';
import { ProgressService } from './progress.service';
import { routes } from './app.routes';
import {
  countSolutions,
  createEmptyPlacements,
  createPuzzle,
  createTutorialPuzzle,
  GRID_SIZE,
  solveByDeduction,
  validateBoard,
} from './game';

describe('Licornes game rules', () => {
  it('creates an 8 by 8 board with eight connected regions and one deductive solution', () => {
    const regions = createPuzzle(() => 0.42);

    expect(regions).toHaveLength(GRID_SIZE);
    expect(regions.every((row) => row.length === GRID_SIZE)).toBe(true);
    expect(countSolutions(regions)).toBe(1);

    for (let region = 0; region < GRID_SIZE; region++) {
      const cells = regions.flatMap((row, rowIndex) =>
        row.flatMap((cellRegion, columnIndex) =>
          cellRegion === region ? [[rowIndex, columnIndex] as const] : [],
        ),
      );
      const visited = new Set([`${cells[0][0]},${cells[0][1]}`]);
      const queue = [cells[0]];

      for (let index = 0; index < queue.length; index++) {
        const [row, column] = queue[index];
        for (const [nextRow, nextColumn] of [
          [row - 1, column],
          [row + 1, column],
          [row, column - 1],
          [row, column + 1],
        ]) {
          const key = `${nextRow},${nextColumn}`;
          if (
            nextRow >= 0 &&
            nextRow < GRID_SIZE &&
            nextColumn >= 0 &&
            nextColumn < GRID_SIZE &&
            regions[nextRow][nextColumn] === region &&
            !visited.has(key)
          ) {
            visited.add(key);
            queue.push([nextRow, nextColumn]);
          }
        }
      }

      expect(visited.size).toBe(cells.length);
    }

    const solution = solveByDeduction(regions);
    expect(solution).not.toBeNull();
    expect(validateBoard(solution!, regions).isComplete).toBe(true);
    expect(validateBoard(solution!, regions).adjacentConflictCells.flat().some(Boolean)).toBe(false);
  });

  it('rejects a board with multiple solutions in the uniqueness counter', () => {
    const regions = Array.from({ length: GRID_SIZE }, (_, row) =>
      Array(GRID_SIZE).fill(row),
    );

    expect(countSolutions(regions)).toBe(2);
  });

  it('keeps generated boards unique and deductible across different shapes', () => {
    for (const random of [() => 0, () => 0.49, () => 0.51, () => 0.99]) {
      const regions = createPuzzle(random);
      expect(countSolutions(regions)).toBe(1);
      expect(solveByDeduction(regions)).not.toBeNull();
    }
  });

  it('provides four unique, deductible 4 by 4 tutorial puzzles', () => {
    for (let level = 1; level <= 4; level++) {
      const regions = createTutorialPuzzle(level);
      const solution = solveByDeduction(regions);

      expect(regions).toHaveLength(4);
      expect(regions.every((row) => row.length === 4)).toBe(true);
      expect(countSolutions(regions)).toBe(1);
      expect(solution).not.toBeNull();
      expect(validateBoard(solution!, regions).isComplete).toBe(true);
    }
  });

  it('keeps an empty board incomplete and conflict-free', () => {
    const status = validateBoard(createEmptyPlacements(), createPuzzle(() => 0.42));

    expect(status.isComplete).toBe(false);
    expect(status.hasConflict).toBe(false);
  });

  it('detects duplicates in rows, columns, and regions', () => {
    const regions = createPuzzle(() => 0.42);
    const placements = createEmptyPlacements();
    placements[0][0] = 'unicorn';
    placements[0][1] = 'unicorn';
    placements[1][0] = 'unicorn';

    const status = validateBoard(placements, regions);
    expect(status.hasConflict).toBe(true);
    expect(status.rowCounts[0]).toBe(2);
    expect(status.columnCounts[0]).toBe(2);
  });

  it('detects horizontal, vertical, and diagonal adjacency', () => {
    const regions = createPuzzle(() => 0.42);

    for (const [first, second] of [
      [[0, 0], [0, 1]],
      [[0, 0], [1, 0]],
      [[0, 0], [1, 1]],
    ] as const) {
      const placements = createEmptyPlacements();
      placements[first[0]][first[1]] = 'unicorn';
      placements[second[0]][second[1]] = 'unicorn';

      const status = validateBoard(placements, regions);
      expect(status.hasConflict).toBe(true);
      expect(status.adjacentConflictCells[first[0]][first[1]]).toBe(true);
      expect(status.adjacentConflictCells[second[0]][second[1]]).toBe(true);
    }
  });

  it('allows unicorns with at least one empty cell between them', () => {
    const regions = createPuzzle(() => 0.42);
    const placements = createEmptyPlacements();
    placements[0][0] = 'unicorn';
    placements[2][2] = 'unicorn';

    const status = validateBoard(placements, regions);
    expect(status.adjacentConflictCells.flat().some(Boolean)).toBe(false);
  });

  it('does not consider a valid partial board a win', () => {
    const regions = createPuzzle(() => 0.42);
    const placements = createEmptyPlacements();
    placements[0][regions[0].indexOf(0)] = 'unicorn';

    const status = validateBoard(placements, regions);
    expect(status.hasConflict).toBe(false);
    expect(status.isComplete).toBe(false);
  });
});

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the level selection and its first unlocked pack', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/levels');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.level-tile')).toHaveLength(20);
    expect(element.querySelectorAll('a.level-tile')).toHaveLength(10);
    expect(element.querySelectorAll('.level-locked')).toHaveLength(10);
    expect(element.textContent).toContain('Choisis ton');
    expect(element.querySelector('.rules-dialog')).not.toBeNull();
    expect(element.textContent).toContain('Comment jouer ?');
    expect(getComputedStyle(element.querySelector('.page')!).display).toBe('flex');
  });

  it('shows the rules in a dismissible dialog on the level selection page', async () => {
    const showModalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
    const closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
    const showModal = vi.fn(function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      });
    const close = vi.fn(function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: showModal });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: close });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/levels');
    fixture.detectChanges();

    const infoButton = [...fixture.nativeElement.querySelectorAll('button')]
      .find((button: HTMLButtonElement) => button.textContent?.includes('Comment jouer'));
    infoButton!.click();
    fixture.detectChanges();
    expect(showModal).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.rules-dialog[open]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Une licorne par ligne');
    expect(fixture.nativeElement.textContent).toContain('Une licorne par colonne');

    const closeButton = fixture.nativeElement.querySelector('.rules-dialog-close') as HTMLButtonElement;
    closeButton.click();
    expect(close).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.rules-dialog[open]')).toBeNull();
    if (showModalDescriptor) {
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModalDescriptor);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    }
    if (closeDescriptor) {
      Object.defineProperty(HTMLDialogElement.prototype, 'close', closeDescriptor);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    }
  });

  it('uses 4 by 4 boards for tutorials and 8 by 8 boards for regular levels', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const game = TestBed.inject(GameService);

    await router.navigateByUrl('/game/1');
    fixture.detectChanges();
    expect(game.gridSize()).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('.cell')).toHaveLength(16);
    expect(fixture.nativeElement.textContent).not.toContain('Les règles du jeu');

    await router.navigateByUrl('/game/5');
    fixture.detectChanges();
    expect(game.gridSize()).toBe(8);
    expect(fixture.nativeElement.querySelectorAll('.cell')).toHaveLength(64);
  });

  it('restarts a completed level without removing its saved completion', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/game/1');
    fixture.detectChanges();

    const game = TestBed.inject(GameService);
    const progress = TestBed.inject(ProgressService);
    const timer = TestBed.inject(GameTimerService);
    const solution = solveByDeduction(game.regions())!;
    for (let row = 0; row < solution.length; row++) {
      for (let column = 0; column < solution.length; column++) {
        if (solution[row][column] === 'unicorn') {
          game.toggleCell(row, column);
          game.toggleCell(row, column);
        }
      }
    }

    expect(game.isLevelCompleted()).toBe(true);
    expect(progress.isLevelCompleted(1)).toBe(true);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.game-card.game-won')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.victory-icon')).not.toBeNull();
    const replayButton = [...fixture.nativeElement.querySelectorAll('button')]
      .find((button: HTMLButtonElement) => button.textContent?.includes('Rejouer le niveau'));
    expect(replayButton).toBeDefined();
    replayButton!.click();
    fixture.detectChanges();

    expect(game.isLevelCompleted()).toBe(false);
    expect(game.placedCount()).toBe(0);
    expect(progress.isLevelCompleted(1)).toBe(true);
    expect(timer.elapsedSeconds()).toBe(0);
    expect(timer.isRunning()).toBe(true);
  });

  it('cycles a cell from note to unicorn to empty', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/game/1');
    const game = TestBed.inject(GameService);
    fixture.detectChanges();
    const cell = fixture.nativeElement.querySelector('.cell') as HTMLButtonElement;

    cell.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.note-mark').length).toBe(1);
    expect(game.placedCount()).toBe(0);
    expect(cell.getAttribute('aria-label')).toContain('croix de note');

    cell.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.unicorn').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.note-mark').length).toBe(0);
    expect(game.placedCount()).toBe(1);

    cell.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.note-mark').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.unicorn').length).toBe(0);
    expect(game.placedCount()).toBe(0);
  });

  it('highlights adjacent unicorns and explains the conflict', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/game/1');
    const game = TestBed.inject(GameService);
    game.toggleCell(0, 0);
    game.toggleCell(0, 0);
    game.toggleCell(1, 1);
    game.toggleCell(1, 1);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.cell') as NodeListOf<HTMLElement>;
    expect(cells[0].classList).toContain('cell-conflict');
    expect(cells[9].classList).toContain('cell-conflict');
    expect(fixture.nativeElement.textContent).toContain('Des licornes sont trop proches');
  });

  it('restarts a level without changing its puzzle and opens another level', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/game/1');
    fixture.detectChanges();
    const game = TestBed.inject(GameService);
    const originalRegions = game.regions();
    game.toggleCell(0, 0);

    game.resetGame();
    expect(game.regions()).toBe(originalRegions);
    expect(game.placedCount()).toBe(0);

    game.openLevel(2);
    expect(game.placedCount()).toBe(0);
    expect(game.currentLevel()).toBe(2);
  });

  it('redirects a locked level to the level list', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/game/11');
    fixture.detectChanges();

    expect(router.url).toBe('/levels');
    expect(fixture.nativeElement.textContent).toContain('Choisis ton');
  });
});
