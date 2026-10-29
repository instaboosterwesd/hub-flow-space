<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Ported Aviator game
- The app is a single-page Aviator-style flight game ported from github.com/instaboosterwesd/workspace (artifacts/main-app). All game logic, styles, and assets live in src/routes/index.tsx, src/styles.css, and src/assets/aviator/ — keep them together.
- Player balances are stored per user ID in Firebase (src/lib/balance.ts); the game reads/writes them through that module only. The /api page is password-gated and /api/balance is a public read-only lookup by userId.
