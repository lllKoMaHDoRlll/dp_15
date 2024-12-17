import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatrixInputComponent } from './matrix-input/matrix-input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatrixInputComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
