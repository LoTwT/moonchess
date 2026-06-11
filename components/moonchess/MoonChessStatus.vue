<script setup lang="ts">
import type { Player, ReadonlyGameState } from "../../utils/moonchess/game"

defineProps<{
  state: ReadonlyGameState
  playerLabels: Record<Player, string>
}>()

defineEmits<{
  restart: []
}>()
</script>

<template>
  <aside class="status-card" aria-live="polite">
    <div class="status-main">
      <p class="status-label">
        {{ state.winner ? "胜利" : "当前回合" }}
      </p>
      <p class="status-value">
        {{ playerLabels[state.winner ?? state.currentPlayer] }}
      </p>
    </div>

    <dl class="status-counts">
      <div>
        <dt>{{ playerLabels.warm }}</dt>
        <dd>{{ state.queues.warm.length }} / 3</dd>
      </div>
      <div>
        <dt>{{ playerLabels.cool }}</dt>
        <dd>{{ state.queues.cool.length }} / 3</dd>
      </div>
    </dl>

    <button type="button" class="restart-button" @click="$emit('restart')">
      再来一局
    </button>
  </aside>
</template>

<style scoped>
.status-card {
  width: min(100%, 760px);
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 18px;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.07);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.26),
    0 22px 54px -34px rgba(0, 0, 0, 0.82);
}

.status-label,
.status-value {
  margin: 0;
}

.status-label {
  color: rgba(234, 240, 255, 0.62);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.status-value {
  margin-top: 2px;
  color: #eaf0ff;
  font-size: 1.12rem;
  font-weight: 700;
}

.status-counts {
  display: flex;
  gap: 14px;
  margin: 0;
}

.status-counts div {
  min-width: 92px;
}

.status-counts dt,
.status-counts dd {
  margin: 0;
}

.status-counts dt {
  color: rgba(234, 240, 255, 0.62);
  font-size: 0.76rem;
}

.status-counts dd {
  margin-top: 2px;
  font-weight: 700;
}

.restart-button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  color: #eaf0ff;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.restart-button:hover,
.restart-button:focus-visible {
  border-color: rgba(255, 230, 173, 0.7);
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 207, 115, 0.18);
}

@media (max-width: 720px) {
  .status-card {
    grid-template-columns: 1fr;
  }

  .status-counts {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
