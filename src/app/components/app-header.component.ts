import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="topbar">
      <a class="brand" href="/levels" aria-label="Licorne — parcours">
        <span class="brand-icon" aria-hidden="true">✳</span>
        <span>petit<span class="brand-accent">monde</span></span>
      </a>
      <div class="topbar-note"><span class="online-dot"></span> une pause enchantée</div>
    </header>
  `,
})
export class AppHeaderComponent {}
