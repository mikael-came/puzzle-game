export const GRID_SIZE = 8;

export type RegionBoard = number[][];
export type CellState = 'empty' | 'unicorn' | 'note';
export type PlacementBoard = CellState[][];

export interface BoardStatus {
  rowCounts: number[];
  columnCounts: number[];
  regionCounts: number[];
  adjacentConflictCells: boolean[][];
  hasConflict: boolean;
  isComplete: boolean;
}

type Candidate = [row: number, column: number, region: number];

const BASE_PUZZLE_REGIONS: RegionBoard = [
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 1, 0, 0, 0, 3, 3, 2],
  [0, 0, 3, 3, 3, 3, 2, 2],
  [0, 0, 3, 3, 3, 2, 2, 2],
  [3, 3, 3, 5, 5, 5, 5, 4],
  [3, 3, 7, 7, 7, 5, 5, 5],
  [6, 6, 6, 6, 7, 7, 7, 5],
  [6, 6, 6, 6, 7, 7, 7, 5],
];

const TUTORIAL_PUZZLES: RegionBoard[] = [
  [
    [2, 0, 1, 1],
    [2, 2, 1, 1],
    [2, 2, 1, 3],
    [2, 3, 3, 3],
  ],
  [
    [0, 0, 0, 0],
    [2, 0, 0, 1],
    [2, 0, 0, 3],
    [2, 2, 3, 3],
  ],
  [
    [2, 0, 1, 1],
    [2, 2, 1, 1],
    [2, 3, 3, 1],
    [2, 3, 3, 1],
  ],
  [
    [0, 0, 1, 1],
    [0, 3, 1, 1],
    [2, 3, 3, 3],
    [3, 3, 3, 3],
  ],
];

export function createEmptyPlacements(size = GRID_SIZE): PlacementBoard {
  return Array.from({ length: size }, () => Array<CellState>(size).fill('empty'));
}

export function createTutorialPuzzle(level: number): RegionBoard {
  const puzzle = TUTORIAL_PUZZLES[level - 1];
  if (!puzzle) {
    throw new Error(`Le niveau ${level} n'est pas un niveau tutoriel.`);
  }
  if (countSolutions(puzzle) !== 1 || solveByDeduction(puzzle) === null) {
    throw new Error(`Le tutoriel du niveau ${level} doit être unique et déductible.`);
  }
  return puzzle.map((row) => [...row]);
}

export function createPuzzle(random: () => number = Math.random): RegionBoard {
  const regionOrder = Array.from({ length: GRID_SIZE }, (_, index) => index);
  for (let index = regionOrder.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [regionOrder[index], regionOrder[swapIndex]] = [regionOrder[swapIndex], regionOrder[index]];
  }

  const transform = Math.floor(random() * 8);
  const regions = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(-1));
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let column = 0; column < GRID_SIZE; column++) {
      let transformedRow = row;
      let transformedColumn = transform >= 4 ? GRID_SIZE - 1 - column : column;
      for (let rotation = 0; rotation < transform % 4; rotation++) {
        [transformedRow, transformedColumn] = [
          transformedColumn,
          GRID_SIZE - 1 - transformedRow,
        ];
      }
      regions[transformedRow][transformedColumn] = regionOrder[BASE_PUZZLE_REGIONS[row][column]];
    }
  }

  if (
    countSolutions(regions) !== 1 ||
    solveByDeduction(regions) === null
  ) {
    throw new Error('La grille générée doit avoir une solution unique déductible sans licornes adjacentes.');
  }
  return regions;
}

export function countSolutions(regions: RegionBoard, limit = 2): number {
  const size = regions.length;
  let solutionCount = 0;

  function search(
    row: number,
    usedColumns: number,
    usedRegions: number,
    previousColumn: number,
  ): void {
    if (solutionCount >= limit) {
      return;
    }
    if (row === size) {
      solutionCount++;
      return;
    }

    for (let column = 0; column < size; column++) {
      const region = regions[row][column];
      const columnBit = 1 << column;
      const regionBit = 1 << region;
      if (
        (usedColumns & columnBit) === 0 &&
        (usedRegions & regionBit) === 0 &&
        (row === 0 || Math.abs(column - previousColumn) > 1)
      ) {
        search(row + 1, usedColumns | columnBit, usedRegions | regionBit, column);
      }
    }
  }

  search(0, 0, 0, -2);
  return solutionCount;
}

export function solveByDeduction(regions: RegionBoard): PlacementBoard | null {
  const size = regions.length;
  const placements = createEmptyPlacements(size);
  const usedColumns = new Set<number>();
  const usedRegions = new Set<number>();

  for (let placed = 0; placed < size; placed++) {
    const candidates: Candidate[] = [];
    for (let row = 0; row < size; row++) {
      if (placements[row].some((cell) => cell === 'unicorn')) {
        continue;
      }
      for (let column = 0; column < size; column++) {
        const region = regions[row][column];
        if (
          !usedColumns.has(column) &&
          !usedRegions.has(region) &&
          !hasAdjacentUnicorn(placements, row, column)
        ) {
          candidates.push([row, column, region]);
        }
      }
    }

    let forcedCandidate: Candidate | undefined;
    for (let group = 0; group < 3 && !forcedCandidate; group++) {
      const candidatesByGroup = new Map<number, Candidate[]>();
      for (const candidate of candidates) {
        const groupId = candidate[group];
        const groupCandidates = candidatesByGroup.get(groupId) ?? [];
        groupCandidates.push(candidate);
        candidatesByGroup.set(groupId, groupCandidates);
      }
      forcedCandidate = [...candidatesByGroup.values()].find(
        (groupCandidates) => groupCandidates.length === 1,
      )?.[0];
    }

    if (!forcedCandidate) {
      return null;
    }

    const [row, column, region] = forcedCandidate;
    placements[row][column] = 'unicorn';
    usedColumns.add(column);
    usedRegions.add(region);
  }

  return placements;
}

export function validateBoard(
  placements: PlacementBoard,
  regions: RegionBoard,
): BoardStatus {
  const size = placements.length;
  const rowCounts = Array(size).fill(0);
  const columnCounts = Array(size).fill(0);
  const regionCounts = Array(size).fill(0);
  const adjacentConflictCells = Array.from({ length: size }, () =>
    Array(size).fill(false),
  );

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (placements[row][column] === 'unicorn') {
        rowCounts[row]++;
        columnCounts[column]++;
        regionCounts[regions[row][column]]++;
      }
    }
  }

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      if (placements[row][column] !== 'unicorn') {
        continue;
      }
      for (let neighborRow = Math.max(0, row - 1); neighborRow <= Math.min(size - 1, row + 1); neighborRow++) {
        for (
          let neighborColumn = Math.max(0, column - 1);
          neighborColumn <= Math.min(size - 1, column + 1);
          neighborColumn++
        ) {
          if (
            (neighborRow !== row || neighborColumn !== column) &&
            placements[neighborRow][neighborColumn] === 'unicorn'
          ) {
            adjacentConflictCells[row][column] = true;
          }
        }
      }
    }
  }

  const hasConflict =
    [rowCounts, columnCounts, regionCounts].some((counts) =>
      counts.some((count) => count > 1),
    ) || adjacentConflictCells.some((row) => row.some(Boolean));
  const isComplete = [rowCounts, columnCounts, regionCounts].every((counts) =>
    counts.every((count) => count === 1),
  ) && !hasConflict;

  return { rowCounts, columnCounts, regionCounts, adjacentConflictCells, hasConflict, isComplete };
}

function hasAdjacentUnicorn(placements: PlacementBoard, row: number, column: number): boolean {
  const size = placements.length;
  for (let neighborRow = Math.max(0, row - 1); neighborRow <= Math.min(size - 1, row + 1); neighborRow++) {
    for (
      let neighborColumn = Math.max(0, column - 1);
      neighborColumn <= Math.min(size - 1, column + 1);
      neighborColumn++
    ) {
      if (
        (neighborRow !== row || neighborColumn !== column) &&
        placements[neighborRow][neighborColumn] === 'unicorn'
      ) {
        return true;
      }
    }
  }
  return false;
}
