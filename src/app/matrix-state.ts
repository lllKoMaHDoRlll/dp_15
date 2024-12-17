export interface MatrixState {
  sigma: number;
  prevSigma: number;
  matrix: number[][];
  hCoefs: number[];
  HCoefs: number[];
  alphas: number[];
  betas: number[];
  parent: MatrixState | null;
  hiredChild: MatrixState | null;
  notHiredChild: MatrixState | null;
  theta: number;
  thetaPos: number[];
  notHiredChildSigma: number;
  iIndexes: number[];
  jIndexes: number[];
  isDivided: boolean;
}
