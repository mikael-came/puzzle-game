import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  template: `
    <div class="board-shell" [style.--grid-size]="game.gridSize()">
      <div class="column-markers" aria-hidden="true">
        @for (column of game.status().columnCounts; track $index) {
          <span
            class="axis-marker"
            [class.axis-complete]="column === 1"
            [class.axis-conflict]="column > 1"
          >{{ $index + 1 }}</span>
        }
      </div>

      <div class="board-area">
        <div class="row-markers" aria-hidden="true">
          @for (count of game.status().rowCounts; track $index) {
            <span
              class="axis-marker"
              [class.axis-complete]="count === 1"
              [class.axis-conflict]="count > 1"
            >{{ $index + 1 }}</span>
          }
        </div>

        <div
          class="board"
          role="grid"
          [attr.aria-label]="'Grille de jeu de ' + game.gridSize() + ' lignes et ' + game.gridSize() + ' colonnes'"
        >
          @for (row of game.regions(); track $index; let rowIndex = $index) {
            <div class="board-row" role="row" [attr.aria-label]="'Ligne ' + (rowIndex + 1)">
              @for (region of row; track $index; let columnIndex = $index) {
                <button
                  class="cell"
                  type="button"
                  role="gridcell"
                  [style.--region-color]="game.regionColors[region]"
                  [class.cell-conflict]="game.hasCellConflict(rowIndex, columnIndex)"
                  [attr.aria-label]="game.cellLabel(rowIndex, columnIndex)"
                  (click)="game.toggleCell(rowIndex, columnIndex)"
                >
                  @if (game.placements()[rowIndex][columnIndex] === 'unicorn') {
                    <span class="unicorn" aria-hidden="true">🦄</span>
                  } @else if (game.placements()[rowIndex][columnIndex] === 'note') {
                    <span class="note-mark" aria-hidden="true">×</span>
                  }
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class GameBoardComponent {
  protected readonly game = inject(GameService);
}
