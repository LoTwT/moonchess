import { computed, readonly, shallowRef } from "vue"
import {
  createGameState,
  playMove,
  type GameState,
  type Player,
} from "../utils/moonchess/game"

const playerLabels: Record<Player, string> = {
  warm: "玩家一 · 暖满月",
  cool: "玩家二 · 冷月",
}

export function useMoonChess() {
  const state = shallowRef<GameState>(createGameState())

  const currentPlayer = computed(() => state.value.currentPlayer)
  const winner = computed(() => state.value.winner)

  function play(cell: number) {
    state.value = playMove(state.value, cell)
  }

  function restart() {
    state.value = createGameState()
  }

  return {
    state: readonly(state),
    currentPlayer,
    winner,
    playerLabels,
    play,
    restart,
  }
}
