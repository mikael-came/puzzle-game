import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <span>Fait avec <span class="footer-heart" aria-label="amour">♥</span> et un soupçon de magie</span>
      <span>✦ &nbsp; petit monde des licornes &nbsp; ✦</span>
    </footer>
  `,
})
export class AppFooterComponent {}
