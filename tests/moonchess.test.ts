import { describe, expect, it } from "vitest"
import {
  createGameState,
  playMove,
  type GameState,
  type Player,
} from "../utils/moonchess/game"

function playSequence(moves: number[]) {
  return moves.reduce<GameState>((state, cell) => playMove(state, cell), createGameState())
}

function expectCells(state: GameState, player: Player, cells: number[]) {
  for (const cell of cells) {
    expect(state.board[cell]).toBe(player)
  }
}

describe("moon chess rules", () => {
  it.each([
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ])("detects winning line %o", (a, b, c) => {
    const fillers = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((cell) => ![a, b, c].includes(cell))
    const state = playSequence([a, fillers[0]!, b, fillers[1]!, c])

    expect(state.winner).toBe("warm")
    expect(state.winningLine).toEqual([a, b, c])
    expectCells(state, "warm", [a, b, c])
  })

  it("removes only the current player's oldest moon on the fourth placement", () => {
    const state = playSequence([0, 4, 1, 5, 3, 7, 2])

    expect(state.winner).toBeNull()
    expect(state.board[0]).toBeNull()
    expectCells(state, "warm", [1, 2, 3])
    expectCells(state, "cool", [4, 5, 7])
    expect(state.queues.warm.map((piece) => piece.cell)).toEqual([1, 3, 2])
    expect(state.queues.cool.map((piece) => piece.cell)).toEqual([4, 5, 7])
    expect(state.lastMove?.removed?.player).toBe("warm")
    expect(state.currentPlayer).toBe("cool")
  })

  it("does not win when the fourth placement forms a temporary line that FIFO removal breaks", () => {
    const state = playSequence([0, 4, 1, 5, 3, 7, 2])

    expect(state.winner).toBeNull()
    expect(state.winningLine).toBeNull()
    expect(state.board[0]).toBeNull()
    expectCells(state, "warm", [1, 2, 3])
  })

  it("wins when FIFO removal does not break the new line", () => {
    const state = playSequence([0, 2, 4, 3, 1, 6, 7])

    expect(state.winner).toBe("warm")
    expect(state.winningLine).toEqual([1, 4, 7])
    expect(state.board[0]).toBeNull()
    expectCells(state, "warm", [1, 4, 7])
  })

  it("leaves board, turn, and queues unchanged for occupied cells", () => {
    const before = playMove(createGameState(), 0)
    const after = playMove(before, 0)

    expect(after).toBe(before)
    expect(after.currentPlayer).toBe("cool")
    expect(after.board).toEqual(before.board)
    expect(after.queues).toEqual(before.queues)
  })

  it("locks the board after a win until restart", () => {
    const won = playSequence([0, 3, 1, 4, 2])
    const after = playMove(won, 5)

    expect(after).toBe(won)
    expect(after.board[5]).toBeNull()
    expect(after.winner).toBe("warm")

    const restarted = createGameState()
    expect(restarted.winner).toBeNull()
    expect(restarted.board.every((cell) => cell === null)).toBe(true)
  })

  it("rejects out-of-range cells", () => {
    const state = createGameState()

    expect(playMove(state, -1)).toBe(state)
    expect(playMove(state, 9)).toBe(state)
  })
})
