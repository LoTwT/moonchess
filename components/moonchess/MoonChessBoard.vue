<script setup lang="ts">
import { computed } from "vue"
import type { Player, ReadonlyGameState } from "../../utils/moonchess/game"

const props = defineProps<{
  state: ReadonlyGameState
  playerLabels: Record<Player, string>
}>()

const emit = defineEmits<{
  cellClick: [cell: number]
}>()

const oldestCells = computed(() => {
  return new Set(
    Object.values(props.state.queues)
      .filter((queue) => queue.length === 3)
      .map((queue) => queue[0]?.cell)
      .filter((cell): cell is number => typeof cell === "number"),
  )
})

function cellLabel(index: number) {
  const occupant = props.state.board[index]
  const row = Math.floor(index / 3) + 1
  const column = (index % 3) + 1

  if (occupant) {
    return `${row} 行 ${column} 列,${props.playerLabels[occupant]}已落月`
  }

  if (props.state.winner) {
    return `${row} 行 ${column} 列,空位,对局已结束`
  }

  return `${row} 行 ${column} 列,空位,${props.playerLabels[props.state.currentPlayer]}可落月`
}
</script>

<template>
  <div class="board-shell">
    <div
      class="board-grid"
      :class="{ 'is-won': state.winner }"
      role="grid"
      aria-label="3x3 月亮棋盘"
    >
      <button
        v-for="(occupant, index) in state.board"
        :key="index"
        type="button"
        class="board-cell"
        :class="{
          'is-empty': !occupant,
          'is-winning': state.winningLine?.includes(index),
        }"
        role="gridcell"
        :aria-label="cellLabel(index)"
        :disabled="Boolean(occupant) || Boolean(state.winner)"
        @click="emit('cellClick', index)"
      >
        <span
          v-if="occupant"
          class="moon-piece"
          :class="[
            occupant,
            { 'is-oldest': oldestCells.has(index) },
          ]"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.board-shell {
  width: min(82vw, 520px);
  aspect-ratio: 1;
  padding: clamp(14px, 3vw, 24px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: clamp(24px, 5vw, 34px);
  background: rgba(255, 255, 255, 0.07);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 28px 70px -36px rgba(0, 0, 0, 0.9);
}

.board-grid {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.board-cell {
  position: relative;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: inherit;
  background: rgba(8, 12, 30, 0.38);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    inset 0 -18px 32px -24px rgba(0, 0, 0, 0.94);
}

.board-cell:nth-child(1) {
  border-radius: 18px 6px 6px;
}

.board-cell:nth-child(3) {
  border-radius: 6px 18px 6px 6px;
}

.board-cell:nth-child(7) {
  border-radius: 6px 6px 6px 18px;
}

.board-cell:nth-child(9) {
  border-radius: 6px 6px 18px;
}

.board-cell.is-empty:not(:disabled) {
  cursor: pointer;
}

.board-cell.is-empty:not(:disabled):hover,
.board-cell.is-empty:not(:disabled):focus-visible {
  z-index: 1;
  outline: none;
  border-color: rgba(255, 230, 173, 0.72);
  box-shadow:
    inset 0 0 0 1px rgba(255, 230, 173, 0.34),
    0 0 26px rgba(255, 207, 115, 0.16);
}

.board-cell.is-winning {
  border-color: rgba(255, 230, 173, 0.86);
  background: rgba(255, 207, 115, 0.12);
}

.moon-piece {
  position: relative;
  width: min(62%, 86px);
  aspect-ratio: 1;
  border-radius: 50%;
  animation: moon-rise 420ms ease-out both;
}

.moon-piece.warm {
  background: radial-gradient(circle at 36% 30%, #fffaf0 0%, #ffe6ad 38%, #e7b262 72%, #b97f33 100%);
  box-shadow:
    0 0 30px 6px rgba(255, 207, 115, 0.42),
    inset -6px -8px 16px rgba(120, 72, 20, 0.5),
    inset 4px 5px 10px rgba(255, 255, 255, 0.7);
}

.moon-piece.cool {
  background: radial-gradient(circle at 36% 30%, #ffffff 0%, #c4dcff 40%, #7aa2e8 74%, #4e6ab0 100%);
  box-shadow:
    0 0 30px 6px rgba(143, 182, 255, 0.38),
    inset -6px -8px 16px rgba(30, 46, 96, 0.55),
    inset 4px 5px 10px rgba(255, 255, 255, 0.7);
}

.moon-piece.is-oldest::before {
  content: "";
  position: absolute;
  inset: -9px;
  border: 1.5px dashed rgba(255, 255, 255, 0.56);
  border-radius: inherit;
}

@keyframes moon-rise {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.85);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .moon-piece {
    animation-duration: 1ms;
  }
}
</style>
