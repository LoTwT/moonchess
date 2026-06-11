<script setup lang="ts">
import { computed, shallowRef } from "vue"
import MoonChessBoard from "./MoonChessBoard.vue"
import MoonChessStatus from "./MoonChessStatus.vue"
import { useMoonChess } from "../../composables/useMoonChess"

const started = shallowRef(false)

const {
  state,
  playerLabels,
  play,
  restart,
} = useMoonChess()

const heading = computed(() => {
  if (!started.value) {
    return "月亮棋"
  }

  if (state.value.winner) {
    return `${playerLabels[state.value.winner]}获胜`
  }

  return `${playerLabels[state.value.currentPlayer]}回合`
})

function startGame() {
  started.value = true
  restart()
}

function restartGame() {
  restart()
  started.value = true
}
</script>

<template>
  <main class="moon-shell">
    <section class="moon-hero" aria-labelledby="moon-title">
      <p class="moon-kicker">Moon Chess</p>
      <h1 id="moon-title" class="moon-title">
        {{ heading }}
      </h1>
      <p class="moon-copy">
        本地双人轮流落月。三连成线即胜,每方天上最多 3 颗月亮。
      </p>

      <button
        v-if="!started"
        type="button"
        class="moon-action"
        @click="startGame"
      >
        开始本地双人
      </button>
    </section>

    <section v-if="started" class="moon-game" aria-label="月亮棋对局">
      <MoonChessStatus
        :state="state"
        :player-labels="playerLabels"
        @restart="restartGame"
      />
      <MoonChessBoard
        :state="state"
        :player-labels="playerLabels"
        @cell-click="play"
      />
    </section>
  </main>
</template>

<style scoped>
.moon-shell {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 24px;
  padding: 32px clamp(18px, 5vw, 64px);
  color: #eaf0ff;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 230, 173, 0.14), transparent 34%),
    radial-gradient(120% 90% at 50% 8%, #1a2348 0%, #0c1230 42%, #060814 78%, #03040b 100%);
}

.moon-hero {
  display: grid;
  gap: 10px;
  align-content: start;
}

.moon-kicker {
  margin: 0;
  color: rgba(234, 240, 255, 0.62);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.moon-title {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 600;
  line-height: 0.95;
}

.moon-copy {
  max-width: 34rem;
  margin: 0;
  color: rgba(234, 240, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.moon-action {
  width: fit-content;
  min-height: 44px;
  margin-top: 10px;
  padding: 0 20px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  color: #eaf0ff;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 38px -22px rgba(0, 0, 0, 0.8);
  cursor: pointer;
}

.moon-action:hover,
.moon-action:focus-visible {
  border-color: rgba(255, 230, 173, 0.7);
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 207, 115, 0.18);
}

.moon-game {
  min-height: 0;
  display: grid;
  gap: 20px;
  align-content: center;
  justify-items: center;
}
</style>
