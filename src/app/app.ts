import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooterComponent } from './components/app-footer.component';
import { AppHeaderComponent } from './components/app-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AppFooterComponent,
    AppHeaderComponent,
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app-shell.scss',
})
export class App {}
