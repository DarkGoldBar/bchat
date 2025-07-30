import type { WuziqiState } from '@bchat/types';

export class Wuziqi implements WuziqiState {
  rows: number;
  cols: number;
  board: number[];
  current: number | null;
  winner: number | null;
  undo: { row: number; col: number } | null;

  constructor(state: Partial<WuziqiState>) {
    this.rows = state.rows ?? 11;
    this.cols = state.cols ?? 11;
    this.board = state.board ?? [];
    this.current = state.current ?? null;
    this.winner = state.winner ?? null;
    this.undo = state.undo ?? null;
  }

  export(): WuziqiState {
    return {
      rows: this.rows,
      cols: this.cols,
      board: this.board,
      current: this.current,
      winner: this.winner,
      undo: this.undo
    };
  }

  canStart(): boolean {
    return !this.current && !!this.rows && !!this.cols;
  }

  doStart(): boolean {
    if (!this.canStart()) return false;
    this.board = Array.from({ length: this.rows * this.cols }, () => 0);
    this.current = 1;
    this.winner = null;
    this.undo = null;
    return true;
  }

  canMove(row: number, col: number): boolean {
    return (
      this.current !== null &&
      row >= 0 &&
      row < this.rows &&
      col >= 0 &&
      col < this.cols &&
      this.board[row * this.cols + col] === 0
    );
  }

  doMove(row: number, col: number): boolean {
    if (!this.canMove(row, col)) return false;
    this.board[row * this.cols + col] = this.current!;
    if (this.canWin(row, col)) {
      this.doWin();
    } else {
      this.undo = { row, col };
      this.current = 3 - this.current!;
    }
    return true;
  }

  canUndo(): boolean {
    return !!this.undo;
  }

  doUndo(): boolean {
    if (!this.canUndo()) return false;
    const { row, col } = this.undo!;
    this.board[row * this.cols + col] = 0;
    this.current = 3 - this.current!;
    this.undo = null;
    return true;
  }

  canWin(row: number, col: number): boolean {
    const currentPlayer = this.board[row * this.cols + col];

    const directions: [number[], number[]][] = [
      [[0, 1], [0, -1]],  // 水平
      [[1, 0], [-1, 0]],  // 垂直
      [[1, 1], [-1, -1]], // 左斜
      [[1, -1], [-1, 1]]  // 右斜
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1;
      // 向一个方向计数
      for (let i = 1; i < 5; i++) {
        const newRow = row + dir1[0] * i;
        const newCol = col + dir1[1] * i;
        if (
          newRow < 0 ||
          newRow >= this.rows ||
          newCol < 0 ||
          newCol >= this.cols ||
          this.board[newRow * this.cols + newCol] !== currentPlayer
        ) {
          break;
        }
        count++;
      }

      // 向相反方向计数
      for (let i = 1; i < 5; i++) {
        const newRow = row + dir2[0] * i;
        const newCol = col + dir2[1] * i;
        if (
          newRow < 0 ||
          newRow >= this.rows ||
          newCol < 0 ||
          newCol >= this.cols ||
          this.board[newRow * this.cols + newCol] !== currentPlayer
        ) {
          break;
        }
        count++;
      }
      if (count >= 5) return true;
    }
    return false;
  }

  doWin(): void {
    this.winner = this.current;
    this.current = null;
  }
}
