export type Player = "warm" | "cool"

export type Cell = Player | null

export interface Piece {
  id: string
  player: Player
  cell: number
  placedAt: number
}

export interface MoveRecord {
  player: Player
  cell: number
  placed: Piece
  removed: Piece | null
}

export interface GameState {
  board: Cell[]
  queues: Record<Player, Piece[]>
  currentPlayer: Player
  winner: Player | null
  winningLine: number[] | null
  turn: number
  lastMove: MoveRecord | null
}

export interface ReadonlyGameState {
  readonly board: readonly Cell[]
  readonly queues: {
    readonly warm: readonly Readonly<Piece>[]
    readonly cool: readonly Readonly<Piece>[]
  }
  readonly currentPlayer: Player
  readonly winner: Player | null
  readonly winningLine: readonly number[] | null
  readonly turn: number
  readonly lastMove: Readonly<MoveRecord> | null
}

export const players: readonly Player[] = ["warm", "cool"] as const

export const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const

export function createGameState(): GameState {
  return {
    board: Array<Cell>(9).fill(null),
    queues: {
      warm: [],
      cool: [],
    },
    currentPlayer: "warm",
    winner: null,
    winningLine: null,
    turn: 0,
    lastMove: null,
  }
}

export function otherPlayer(player: Player): Player {
  return player === "warm" ? "cool" : "warm"
}

export function findWinningLine(board: readonly Cell[], player: Player): number[] | null {
  const line = winningLines.find((candidate) =>
    candidate.every((cell) => board[cell] === player),
  )

  return line ? [...line] : null
}

export function playMove(state: GameState, cell: number): GameState {
  if (state.winner || !Number.isInteger(cell) || cell < 0 || cell >= 9 || state.board[cell]) {
    return state
  }

  const player = state.currentPlayer
  const nextTurn = state.turn + 1
  const placed: Piece = {
    id: `${player}-${nextTurn}`,
    player,
    cell,
    placedAt: nextTurn,
  }

  const board = [...state.board]
  const queues: Record<Player, Piece[]> = {
    warm: [...state.queues.warm],
    cool: [...state.queues.cool],
  }

  board[cell] = player
  queues[player] = [...queues[player], placed]

  let removed: Piece | null = null
  if (queues[player].length > 3) {
    removed = queues[player][0] ?? null
    queues[player] = queues[player].slice(1)

    if (removed) {
      board[removed.cell] = null
    }
  }

  const winningLine = findWinningLine(board, player)
  const winner = winningLine ? player : null

  return {
    board,
    queues,
    currentPlayer: winner ? player : otherPlayer(player),
    winner,
    winningLine,
    turn: nextTurn,
    lastMove: {
      player,
      cell,
      placed,
      removed,
    },
  }
}
