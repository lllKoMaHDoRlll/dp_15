import { MatrixState } from './matrix-state';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MatrixCalculatorService {

  constructor() { }

  private getAlphas(matrix: number[][]): number[] {
    let alphas: number[] = [];
    for (let i = 0; i < matrix.length; i++) {
      let zerosCount = 0;
      let alpha = -1;
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] == 0) {
          zerosCount++;
          if (zerosCount > 1) {
            alpha = 0;
            break;
          }
        }
        else {
          if (alpha == -1) {
            alpha = matrix[i][j];
          }
          else if (matrix[i][j] < alpha) {
            alpha = matrix[i][j];
          }
        }
      }
      alphas.push(alpha);
    }
    return alphas;
  }

  private getBetas(matrix: number[][]): number[] {
    let betas = [];
    for (let j = 0; j < matrix[0].length; j++) {
      let zerosCount = 0;
      let beta = -1;
      for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][j] == 0) {
          zerosCount++;
          if (zerosCount > 1) {
            beta = 0;
            break;
          }
        }
        else {
          if (beta == -1) {
            beta = matrix[i][j];
          }
          else if (matrix[i][j] < beta) {
            beta = matrix[i][j];
          }
        }
      }
      betas.push(beta);
    }
    return betas;
  }

  private getTheta(matrix: number[][], alphas: number[], betas: number[]): {theta: number, thetaPos: number[]} {
    let theta = -1;
    let thetaPos = [-1, -1];

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] == 0) {
          let localTheta = alphas[i] + betas[j];
          if (theta == -1 || localTheta > theta) {
            theta = localTheta;
            thetaPos = [i, j];
          }
        }
      }
    }

    return {theta: theta, thetaPos: thetaPos};
  }

  private reduction(matrix: number[][]): {
    matrix: number[][],
    hCoefs: number[],
    HCoefs: number[],
    alphas: number[],
    betas: number[],
    theta: number,
    thetaPos: number[]
  } {
    let res: number[][] = [];
    matrix.forEach(val => res.push(Object.assign([], val)));
    let hCoefs: number[] = [];
    let HCoefs: number[] = [];


    for (let i = 0; i < matrix.length; i++) {
      hCoefs.push(this.findMin(matrix[i]));
      for (let j = 0; j < matrix[i].length; j++) {
        res[i][j] -= hCoefs[i];
      }
    }

    for (let i = 0; i < matrix[0].length; i++) {
      let column_min = res[0][i];
      for (let j = 1; j < matrix.length; j++) {
        if (column_min > res[j][i]) column_min = res[j][i];
      }
      HCoefs.push(column_min);
      for (let j = 0; j < matrix.length; j++) {
        res[j][i] -= HCoefs[i];
      }
    }

    const alphas = this.getAlphas(res);
    const betas = this.getBetas(res);

    const {theta, thetaPos} = this.getTheta(res, alphas, betas);

    return {matrix: res, hCoefs: hCoefs, HCoefs: HCoefs, alphas: alphas, betas: betas, theta: theta, thetaPos: thetaPos};
  }

  private getMinState(initialState: MatrixState): {minState: MatrixState, doDivide: boolean} {
    let minState = initialState;
    let minSigma = -1;
    let doDivide = true;
    let queue: MatrixState[] = [initialState];
    while(queue.length > 0) {
      const curState = queue.shift()!;
      if (curState.hiredChild === null && curState.notHiredChild === null) {
        if (minSigma == -1 || curState.sigma < minSigma) {
          minSigma = curState.sigma;
          minState = curState;
          doDivide = true;
        }
      }
      if (curState.hiredChild !== null) {
        if (minSigma == -1 || curState.notHiredChildSigma < minSigma) {
          minSigma = curState.sigma;
          minState = curState;
          doDivide = false;
        }
        queue.push(curState.hiredChild);
      }
      if (curState.notHiredChild !== null) {
        queue.push(curState.notHiredChild);
      }
    }
    return {minState: minState, doDivide: doDivide}
  }

  public test() {
    const initialMatrix = [
      [8, 1, 4, 8, 9],
      [14, 11, 5, 8, 12],
      [14, 2, 10, 11, 14],
      [13, 1, 8, 3, 9],
      [8, 3, 1, 2, 3]
    ];
    return this.calculate(initialMatrix)
  }

  public calculate(initialMatrix: number[][]) {

    let iIndexes = [];
    for (let i = 1; i <= initialMatrix.length; i++) iIndexes.push(i);
    let jIndexes = [];
    for (let j = 1; j <= initialMatrix[0].length; j++) jIndexes.push(j);

    let {matrix, hCoefs, HCoefs, alphas, betas, theta, thetaPos} = this.reduction(initialMatrix);
    const sigma = this.getSigma(hCoefs, HCoefs);
    const initialState: MatrixState = {
      matrix: matrix,
      hCoefs: hCoefs,
      HCoefs: HCoefs,
      alphas: alphas,
      betas: betas,
      theta: theta,
      thetaPos: thetaPos,
      parent: null,
      sigma: sigma,
      prevSigma: 0,
      hiredChild: null,
      notHiredChild: null,
      notHiredChildSigma: sigma + theta,
      iIndexes: iIndexes,
      jIndexes: jIndexes,
      isDivided: true
    };

    let {minState, doDivide} = this.getMinState(initialState);
    while (minState.matrix.length != 1) {
      if (doDivide) {
        let {newMatrix, iIndexes, jIndexes} = this.removeElement(minState.matrix, minState.iIndexes, minState.jIndexes, minState.thetaPos[0], minState.thetaPos[1]);

        let {matrix, hCoefs, HCoefs, alphas, betas, theta, thetaPos} = this.reduction(newMatrix);
        const sigma = this.getSigma(hCoefs, HCoefs) + minState.sigma;
        const state: MatrixState = {
          matrix: matrix,
          hCoefs: hCoefs,
          HCoefs: HCoefs,
          alphas: alphas,
          betas: betas,
          theta: theta,
          thetaPos: thetaPos,
          parent: minState,
          sigma: sigma,
          prevSigma: minState.sigma,
          hiredChild: null,
          notHiredChild: null,
          notHiredChildSigma: sigma + theta,
          iIndexes: iIndexes,
          jIndexes: jIndexes,
          isDivided: doDivide
        };
        minState.hiredChild = state;
        ({minState, doDivide} = this.getMinState(state));
      }
      else {
        let {newMatrix, iIndexes, jIndexes} = this.removeElement(minState.matrix, minState.iIndexes, minState.jIndexes, -1, -1);
        let {matrix, hCoefs, HCoefs, alphas, betas, theta, thetaPos} = this.reduction(newMatrix);
        const sigma = this.getSigma(hCoefs, HCoefs) + minState.sigma;
        const state: MatrixState = {
          matrix: matrix,
          hCoefs: hCoefs,
          HCoefs: HCoefs,
          alphas: alphas,
          betas: betas,
          theta: theta,
          thetaPos: thetaPos,
          parent: minState,
          sigma: sigma,
          prevSigma: minState.sigma,
          hiredChild: null,
          notHiredChild: null,
          notHiredChildSigma: sigma + theta,
          iIndexes: iIndexes,
          jIndexes: jIndexes,
          isDivided: doDivide
        };
        minState.notHiredChild = state;
        ({minState, doDivide} = this.getMinState(state));
      }
    }

    let hires = [];
    let curState = minState;
    const resources = minState.sigma;
    console.log(curState);
    while (curState.parent !== null) {
      if (curState.isDivided) {
        let thetaPos = curState.thetaPos;
        hires.push([curState.iIndexes[thetaPos[0]], curState.jIndexes[thetaPos[1]]]);
      }
      curState = curState.parent;
    }
    thetaPos = curState.thetaPos;
    hires.push([curState.iIndexes[thetaPos[0]], curState.jIndexes[thetaPos[1]]]);

    return {hires: hires, resources: resources}
    console.log(initialState);
  }

  private findMin(array: number[]): number {
    if (array.length == 0) throw new Error;
    let res = array[0];
    for (let i = 1; i < array.length; i++) {
      if (res >= array[i]) res = array[i];
    }
    return res;
  }

  private getSigma(hCoefs: number[], HCoefs: number[]) {
    let res: number = 0;
    hCoefs.forEach(coef => {
      res += coef;
    });
    HCoefs.forEach(coef => {
      res += coef;
    });
    return res;
  }

  private removeElement(matrix: number[][], iIndexes: number[], jIndexes: number[], rowI: number, colI: number) {
    let res: number[][] = [];
    let newI = [];
    for (let i = 0; i < iIndexes.length; i++) if (i != rowI) newI.push(iIndexes[i])
    let newJ = [];
    for (let j = 0; j < jIndexes.length; j++) if (j != colI) newJ.push(jIndexes[j])


    for (let i = 0; i < matrix.length; i++) {
      if (i == rowI) continue;
      res.push([]);
      for (let j = 0; j < matrix[i].length; j++) {
        if (j == colI) continue;
        res[res.length - 1].push(matrix[i][j]);
      }
    }
    return {newMatrix: res, iIndexes: newI, jIndexes: newJ};
  }
}
