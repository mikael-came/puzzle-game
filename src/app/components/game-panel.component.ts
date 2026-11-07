import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameBoardComponent } from './game-board.component';
import { GameService } from '../game.service';
import { GameTimerService } from '../game-timer.service';

@Component({
  selector: 'app-game-panel',
  standalone: true,
  imports: [GameBoardComponent, RouterLink],
  template: `
    <section
      class="game-card"
      [class.game-won]="game.status().isComplete"
      aria-label="Plateau de jeu"
    >
      <div class="card-top">
        <div>
          <p class="card-kicker">TON PETIT DÉFI</p>
          <h2>{{ game.tutorialTitle() ?? 'La prairie enchantée' }}</h2>
          <span class="level-pill"><span aria-hidden="true">✦</span> N° {{ game.currentLevel() }}</span>
        </div>
        <a class="back-to-levels" routerLink="/levels">← Parcours</a>
      </div>

      <div class="timer-row">
        <span class="timer-label"><span aria-hidden="true">◷</span> Temps de résolution</span>
        <div class="timer-controls">
          <time class="timer-value" [attr.aria-label]="'Temps écoulé ' + timer.formattedTime()">
            {{ timer.formattedTime() }}
          </time>
          <button
            class="timer-toggle"
            type="button"
            [disabled]="game.isLevelCompleted()"
            (click)="timer.isRunning() ? timer.pause() : timer.resume()"
            [attr.aria-label]="timer.isRunning() ? 'Mettre le chronomètre en pause' : 'Reprendre le chronomètre'"
          >
            {{ timer.isRunning() ? 'Pause' : 'Reprendre' }}
          </button>
        </div>
      </div>

      <div class="progress-row">
        <div class="progress-label">
          <span>Licornes trouvées</span>
          <span class="progress-count">{{ game.placedCount() }} <span>/ {{ game.gridSize() }}</span></span>
        </div>
        <div
          class="progress-track"
          role="progressbar"
          aria-label="Licornes placées"
          [attr.aria-valuenow]="game.placedCount()"
          aria-valuemin="0"
          [attr.aria-valuemax]="game.gridSize()"
        >
          <span class="progress-fill" [style.width.%]="(game.placedCount() / game.gridSize()) * 100"></span>
        </div>
      </div>

      <app-game-board />

      <p class="helper-text">
        1er clic : croix <span aria-hidden="true">·</span> 2e : licorne
        <span aria-hidden="true">·</span> 3e : effacer
      </p>

      <div class="game-status-slot" aria-live="polite">
        @if (game.status().isComplete) {
          <div class="game-message victory" role="status">
            <span class="victory-icon" aria-hidden="true">✨</span>
            Bravo, toutes les licornes ont trouvé leur place !
            <span class="victory-icon" aria-hidden="true">🎉</span>
          </div>
        } @else if (game.status().hasConflict) {
          <div class="game-message conflict" role="status">
            Des licornes sont trop proches ou une règle de ligne, colonne ou zone n’est pas respectée.
          </div>
        }
      </div>

      <div class="game-actions">
        <button
          class="button button-secondary"
          type="button"
          (click)="game.resetGame()"
        >
          <span aria-hidden="true">↺</span>
          {{ game.isLevelCompleted() ? 'Rejouer le niveau' : 'Recommencer' }}
        </button>
        <a class="button button-primary" routerLink="/levels">
          Choisir un niveau <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  `,
})
export class GamePanelComponent {
  protected readonly game = inject(GameService);
  protected readonly timer = inject(GameTimerService);
}
