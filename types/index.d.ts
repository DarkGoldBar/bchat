export interface Avatar {
  icon: string
  color: string
  img?: string
}

export interface User {
  uuid: string
  name: string
  avatar: Avatar
  connectId?: string
  position?: number // 0 = 观众，可重复；其他为唯一位置
}

export type RoomStage = 'lobby' | 'ingame' | 'gameover'

export interface Room {
  id: string
  type: string
  stage: RoomStage
  posLimit: number
  members: User[]
  body: string
  createdAt: number
  ttl: number
  version: number
}

export interface WuziqiState {
  board: Array<number>,
  rows: number,
  cols: number,
  current: number | null,
  winner: number | null,
  undo: { row: number; col: number } | null,
}