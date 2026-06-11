<script setup lang="ts">
import { computed, ref, watch } from "vue"
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

// 月落 moonfall: 引擎一次性把第 4 颗落子 + 移除最早那颗，被移除的月在棋盘上已消失，
// 这里用一层瞬时 overlay 把"那颗最早的月"补回原格做西沉/亏蚀动效。
interface FallingMoon {
  key: string
  cell: number
  player: Player
}
const falling = ref<FallingMoon[]>([])

watch(
  () => props.state.lastMove,
  (move) => {
    const removed = move?.removed
    if (!removed) return
    const key = `${removed.id}-${props.state.turn}`
    falling.value = [...falling.value, { key, cell: removed.cell, player: removed.player }]
  },
)

function endFall(key: string) {
  falling.value = falling.value.filter((m) => m.key !== key)
}

function cellPos(cell: number) {
  return { gridColumn: (cell % 3) + 1, gridRow: Math.floor(cell / 3) + 1 }
}

// 胜线连线：从首格中心到末格中心，画一条发光线（高对比，不靠模糊）。
const winLine = computed(() => {
  const line = props.state.winningLine
  if (!line || line.length < 2) return null
  const first = line[0]!
  const last = line[line.length - 1]!
  const center = (i: number) => ({
    x: ((i % 3) + 0.5) * (100 / 3),
    y: (Math.floor(i / 3) + 0.5) * (100 / 3),
  })
  const a = center(first)
  const b = center(last)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI
  return { left: `${a.x}%`, top: `${a.y}%`, width: `${len}%`, angle: `${angle}deg` }
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

      <!-- 月落瞬时层：被 FIFO 移除的月在原格西沉/亏蚀淡出 -->
      <div class="fall-layer" aria-hidden="true">
        <span
          v-for="moon in falling"
          :key="moon.key"
          class="moon-piece is-falling"
          :class="moon.player"
          :style="cellPos(moon.cell)"
          @animationend="endFall(moon.key)"
        >
          <span class="wane" />
        </span>
      </div>

      <!-- 胜线发光连线 -->
      <div
        v-if="winLine"
        class="win-line"
        aria-hidden="true"
        :style="{
          left: winLine.left,
          top: winLine.top,
          width: winLine.width,
          '--angle': winLine.angle,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.board-shell {
  width: min(82vw, 520px, 56vh);
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

/* 月落瞬时层 */
.fall-layer {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  pointer-events: none;
  z-index: 2;
}

.moon-piece.is-falling {
  place-self: center;
  animation: moonfall 520ms cubic-bezier(0.4, 0, 0.7, 1) forwards;
}

/* 亏蚀：一道阴影从一侧吃过月面（用 opacity，GPU 友好、零 reflow） */
.moon-piece.is-falling .wane {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(105deg, transparent 38%, rgba(4, 6, 16, 0.82) 64%);
  opacity: 0;
  animation: wane 520ms ease-in forwards;
}

@keyframes moonfall {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(14px) scale(0.86);
  }
}

@keyframes wane {
  0% {
    opacity: 0;
  }
  60% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}

/* 胜线发光连线 */
.win-line {
  position: absolute;
  height: 4px;
  transform-origin: 0 50%;
  transform: translateY(-50%) rotate(var(--angle));
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 230, 173, 0), rgba(255, 230, 173, 0.95) 18%, rgba(255, 247, 227, 1) 50%, rgba(255, 230, 173, 0.95) 82%, rgba(255, 230, 173, 0));
  box-shadow: 0 0 16px 3px rgba(255, 207, 115, 0.7);
  pointer-events: none;
  z-index: 3;
  animation: win-line 520ms ease-out both;
}

@keyframes win-line {
  0% {
    opacity: 0;
    transform: translateY(-50%) rotate(var(--angle)) scaleX(0.2);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) rotate(var(--angle)) scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .moon-piece {
    animation-duration: 1ms;
  }

  /* 月落降级：不下沉、不亏蚀动画，仅快速淡出；哪颗要走已由 is-oldest 虚环提前标清，状态不丢 */
  .moon-piece.is-falling {
    animation: moonfall-rm 140ms linear forwards;
  }

  .moon-piece.is-falling .wane {
    animation: none;
    opacity: 0;
  }

  .win-line {
    animation-duration: 1ms;
  }

  @keyframes moonfall-rm {
    to {
      opacity: 0;
    }
  }
}
</style>
