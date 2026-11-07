import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../progress.service';

interface LevelPack {
  index: number;
  firstLevel: number;
  levels: number[];
  completedCount: number;
  unlocked: boolean;
}

@Component({
  selector: 'app-levels-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="levels-page" aria-labelledby="levels-title">
      <header class="levels-heading">
        <p class="eyebrow"><span aria-hidden="true">✦</span> TON AVENTURE</p>
        <h1 id="levels-title">Choisis ton <span>petit défi.</span></h1>
        <p class="levels-intro">
          Place les licornes en respectant les règles et avance dans les niveaux. Commence par quatre tutoriels en 4 × 4.
        </p>
        <button class="info-button" type="button" (click)="openRules()">
          <span aria-hidden="true">ⓘ</span> Comment jouer ?
        </button>
      </header>

      <div class="journey-summary">
        <div class="summary-icon" aria-hidden="true">🦄</div>
        <div class="summary-copy">
          <strong>{{ progress.completedCount() }} casse-têtes résolus</strong>
          <span>Termine 6 niveaux sur 10 pour ouvrir le prochain parcours.</span>
        </div>
        <div class="summary-badge"><span aria-hidden="true">✓</span> Progression locale</div>
      </div>

      <div class="level-packs">
        @for (pack of packs(); track pack.index) {
          <section class="level-pack" [attr.aria-labelledby]="'pack-title-' + pack.index">
            <header class="pack-heading">
              <div>
                <p class="card-kicker">PARCOURS {{ pack.index + 1 }}</p>
                <h2 [id]="'pack-title-' + pack.index">
                  Niveaux {{ pack.firstLevel }}–{{ pack.firstLevel + 9 }}
                </h2>
              </div>
              @if (pack.unlocked) {
                <span class="pack-progress">{{ pack.completedCount }}/10 terminés</span>
              } @else {
                <span class="pack-lock"><span aria-hidden="true">🔒</span> 6/10 requis</span>
              }
            </header>

            @if (pack.index === 0 || !pack.unlocked) {
              <div
                class="pack-progress-track"
                role="progressbar"
                [attr.aria-label]="'Progression du parcours ' + (pack.index + 1)"
                [attr.aria-valuenow]="pack.completedCount"
                aria-valuemin="0"
                aria-valuemax="6"
              >
                <span [style.width.%]="Math.min((pack.completedCount / 6) * 100, 100)"></span>
              </div>
            }

            <div class="level-grid">
              @for (level of pack.levels; track level) {
                @if (pack.unlocked) {
                  <a
                    class="level-tile"
                    [class.level-completed]="progress.isLevelCompleted(level)"
                    [routerLink]="['/game', level]"
                    [attr.aria-label]="
                      'Niveau ' + level +
                      (level <= 4 ? ', tutoriel 4 par 4' : '') +
                      (progress.isLevelCompleted(level) ? ', terminé, rejouer' : ', commencer')
                    "
                  >
                    <span class="tile-number">{{ level }}</span>
                    <span class="tile-status" aria-hidden="true">
                      {{ progress.isLevelCompleted(level) ? '✓' : '→' }}
                    </span>
                    <span class="tile-caption">
                      {{
                        progress.isLevelCompleted(level)
                          ? 'Terminé'
                          : level <= 4 ? 'Tutoriel 4×4' : 'À jouer'
                      }}
                    </span>
                  </a>
                } @else {
                  <div
                    class="level-tile level-locked"
                    aria-disabled="true"
                    [attr.aria-label]="'Niveau ' + level + ', verrouillé'"
                  >
                    <span class="tile-number">{{ level }}</span>
                    <span class="tile-status" aria-hidden="true">🔒</span>
                    <span class="tile-caption">Verrouillé</span>
                  </div>
                }
              }
            </div>
          </section>
        }
      </div>

      <p class="levels-footnote">
        <span aria-hidden="true">♡</span>
        Pas besoin d’étoiles : résous simplement 6 niveaux du parcours pour continuer.
      </p>
    </section>

    <dialog #rulesDialog class="rules-dialog" aria-labelledby="rules-dialog-title">
      <div class="rules-dialog-content">
        <header class="rules-dialog-heading">
          <div>
            <p class="eyebrow"><span aria-hidden="true">✦</span> PETIT GUIDE</p>
            <h2 id="rules-dialog-title">Comment jouer ?</h2>
          </div>
          <button
            class="rules-dialog-close"
            type="button"
            aria-label="Fermer les règles"
            (click)="closeRules()"
          >×</button>
        </header>

        <p class="rules-dialog-intro">Place toutes les licornes sans deviner, en respectant ces quatre règles :</p>
        <ol class="rules-dialog-list">
          <li><span>1</span> Une licorne par ligne.</li>
          <li><span>2</span> Une licorne par colonne.</li>
          <li><span>3</span> Une licorne par zone colorée.</li>
          <li><span>4</span> Les licornes ne se touchent pas, même en diagonale.</li>
        </ol>
        <p class="rules-dialog-tip">
          Sur une case : premier clic pour mettre une croix, deuxième pour placer une licorne,
          troisième pour l’effacer.
        </p>
        <p class="rules-dialog-tip">
          Les quatre premiers niveaux sont des tutoriels 4 × 4. Ensuite, termine 6 niveaux sur 10
          pour débloquer le parcours suivant.
        </p>
        <button class="button button-primary rules-dialog-done" type="button" (click)="closeRules()">
          C’est compris !
        </button>
      </div>
    </dialog>
  `,
})
export class LevelsPageComponent {
  @ViewChild('rulesDialog') private rulesDialog?: ElementRef<HTMLDialogElement>;

  protected readonly progress = inject(ProgressService);
  protected readonly Math = Math;
  protected readonly packs = computed<LevelPack[]>(() => {
    const unlockedPacks = this.progress.unlockedLevelCount() / 10;
    return Array.from({ length: unlockedPacks + 1 }, (_, index) => {
      const firstLevel = index * 10 + 1;
      return {
        index,
        firstLevel,
        levels: Array.from({ length: 10 }, (_, offset) => firstLevel + offset),
        completedCount: this.progress.completedInPack(index),
        unlocked: index < unlockedPacks,
      };
    });
  });

  protected openRules(): void {
    this.rulesDialog?.nativeElement.showModal();
  }

  protected closeRules(): void {
    this.rulesDialog?.nativeElement.close();
  }
}
