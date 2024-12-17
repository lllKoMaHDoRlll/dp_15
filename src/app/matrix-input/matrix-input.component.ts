import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { MatrixCalculatorService } from '../matrix-calculator.service';
import { ResultsComponent } from "../results/results.component";

@Component({
  selector: 'app-matrix-input',
  standalone: true,
  imports: [CommonModule, ResultsComponent],
  templateUrl: './matrix-input.component.html',
  styleUrl: './matrix-input.component.css'
})
export class MatrixInputComponent {
  constructor(private elRef: ElementRef, private matrixCalculator: MatrixCalculatorService) { }

  protected n: number = 5;

  protected hires: number[][] = [];
  protected resources: number | null = null;

  range(start: number, stop: number | undefined = undefined, step: number = 1): number[] {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }

    if (typeof step == 'undefined') {
      step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
    }
    return result;
  }

  updateN(ev: any) {
    this.n = ev.target!.value;
  }


  getMatrix() {
    let matrix: number[][] = [];
    for (let i = 0; i < this.n; i++) {
      matrix.push([]);
      for (let j = 0; j < this.n; j++) {
        let item = this.elRef.nativeElement.querySelector('input[name="item' + i + ';' + j + '"]');
        if (isNaN(Number(item.value)) || item.value == "") {
          alert("Заполните матрицу");
          return;
        }
        matrix[i].push(Number(item.value));
      }
    }
    return matrix;
  }

  test() {
    this.matrixCalculator.test();
  }

  calculate() {
    const initialMatrix = this.getMatrix();

    if (initialMatrix) {
      const {hires, resources} = this.matrixCalculator.calculate(initialMatrix);
      this.hires = hires;
      this.resources = resources;
    }
  }
}
