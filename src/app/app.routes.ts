import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { ProgressService } from './progress.service';

const canOpenLevel: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const level = Number(route.paramMap.get('level'));
  const router = inject(Router);
  return inject(ProgressService).isLevelAccessible(level)
    ? true
    : router.createUrlTree(['/levels']);
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'levels' },
  {
    path: 'levels',
    loadComponent: () =>
      import('./components/levels-page.component').then((module) => module.LevelsPageComponent),
  },
  {
    path: 'game/:level',
    canActivate: [canOpenLevel],
    loadComponent: () =>
      import('./components/game-page.component').then((module) => module.GamePageComponent),
  },
  { path: '**', redirectTo: 'levels' },
];
