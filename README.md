# Moon Chess

Moon Chess is a Nuxt/Vue implementation of the 3x3 local two-player moon placement game.

## Rules

- The board has 9 cells in a 3x3 grid.
- Player one places the warm moon first, then players alternate turns.
- A player can have at most 3 moons on the board.
- On a player's 4th placement, that player's oldest moon is removed.
- The win check happens after the current player's FIFO removal.
- The first player with 3 moons in one of the 8 lines wins.
- Occupied cells are ignored, and a won board is locked until restart.

## Development

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm generate
```

## Cloudflare Pages

- Build command: `pnpm generate`
- Output directory: `.output/public`
