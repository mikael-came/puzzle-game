import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GamePanelComponent } from './game-panel.component';
import { GameService } from '../game.service';
import { GameTimerService } from '../game-timer.service';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [GamePanelComponent],
  template: `
    <section class="game-layout game-only" aria-label="Partie en cours">
      <app-game-panel />
    </section>
  `,
})
export class GamePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly game = inject(GameService);
  private readonly timer = inject(GameTimerService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.game.openLevel(Number(params.get('level'))));
  }

  ngOnDestroy(): void {
    this.timer.pause();
  }
}
