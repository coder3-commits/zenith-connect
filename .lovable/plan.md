# Zenith Connect — Frontend Redesign Plan

A focused, high-impact visual + UX overhaul of the existing app. No route changes, no backend changes, no removed functionality.

## Scope

All existing routes get redesigned in-place:
`/login`, `/register`, `/home`, `/wallet/fund`, `/wallet/transfer`, `/transactions`, `/notifications`, `/profile`, `/services`, `/services/airtime`, `/services/data`, `/services/electricity`, `/services/exam`, `/services/crypto`.

Backend, `src/lib/api.ts`, auth flow, `PinDialog`, and `Receipt` core logic remain untouched. Receipt visuals get a polish pass only.

## 1. Design System (foundation)

Update `src/styles.css`:
- Refined fintech palette (deep indigo primary, mint accent, soft neutrals, glass overlays)
- New tokens: `--gradient-hero`, `--gradient-mesh`, `--glass-bg`, `--glass-border`, `--shadow-soft`, `--shadow-float`, `--shadow-glow`
- Premium type scale: display (Sora), body (Plus Jakarta Sans), tabular-nums for amounts
- Motion tokens (durations, easings)
- Keyframes: `fade-in`, `slide-up`, `scale-in`, `shimmer`, `count-up-pulse`, `pull-refresh`

Introduce primitives in `src/components/ui-kit/`:
- `GlassCard`, `GradientCard`, `StatChip`, `SectionHeader`, `EmptyState`, `SkeletonRow`, `AmountDisplay` (with hide/reveal + tabular nums), `IconTile`, `SuccessAnimation`, `PageTransition`

## 2. Motion

Add `framer-motion` (already in deps if present; otherwise install). Use sparingly:
- Page transitions (fade + slide-up 200ms)
- Balance count-up
- Stagger on quick actions and service grid
- Bottom-nav active indicator spring
- Success checkmark on transfers/purchases

## 3. Screen-by-screen upgrades

**Auth (`login`, `register`)**
- Hero with animated gradient mesh + subtle blur orbs
- Floating glass form card, large inputs, inline validation, password strength meter on register
- Smooth screen transition between login ↔ register

**Home (`/home`)**
- New header: avatar + greeting + notification bell with unread dot + status pill
- Hero wallet card: gradient + glass, animated balance reveal, eye toggle, income/expense mini-chips, "Fund" + "Send" inline CTAs
- Quick actions row (6 tiles) with icon tiles + labels, ripple on press
- "Smart services" grid — illustrated cards with gradients and badges
- Recent transactions feed with grouped date headers, status dots, category icons
- Referral banner restyled as gradient promo card

**Services hub + each service**
- Unified `ServiceLayout` with hero header, contextual help chip
- Airtime/Data: network picker as logo chips, smart amount input with quick presets, summary card pinned bottom
- Electricity: disco picker grid, meter preview card, pre-pay/post-pay tabs
- Exam: plan cards with gradient borders for selected
- Crypto: coin cards with mini sparkline, market sentiment chips, portfolio summary card

**Wallet**
- Fund: payment method cards (bank transfer, card), copy-to-clipboard account row with toast, animated steps
- Transfer: recipient input with avatar circle, amount with naira big display, preview sheet, success animation → existing Receipt

**Transactions**
- Filter chips (All / In / Out / Bills / Crypto)
- Date-grouped feed, category icons, amount color coding
- Polished skeletons; rich empty state

**Notifications**
- Category tabs (All / Activity / Security / Promo)
- Unread accent bar + dot, time-ago, swipe-friendly cards

**Profile**
- Identity card with verification chip
- Sectioned list: Security, Preferences (theme toggle), Referral, KYC progress bar, Linked accounts, Support

**Receipt (visual only)**
- Brand watermark, ticket-style notches, QR placeholder block, refined typography

**BottomNav**
- Floating pill with spring-animated active indicator, icon + label, center FAB for "Send"

**OfflineBanner**
- Slide-down with subtle pulse

## 4. Performance & resilience (preserve)

- Keep TanStack Query offline-first config
- Preserve all existing loading/error states; upgrade visuals only
- Lazy-load Framer Motion features where possible; prefer CSS transitions for simple cases
- Tabular-nums + fixed widths to avoid layout shift on amounts

## Constraints respected

- No route additions/removals
- No backend changes
- `src/lib/api.ts`, auth, `PinDialog` untouched
- `Receipt` component logic untouched (style refresh only)
- Airtime/data success flows preserved

## Technical notes

- All colors via tokens in `src/styles.css` (oklch); no hard-coded hex in components
- New primitives under `src/components/ui-kit/` to avoid clashing with shadcn `ui/`
- Dark mode parity maintained
- Mobile-first, max-width 480px shell preserved; desktop shows centered shell on subtle gradient backdrop

## Out of scope

- Adding new routes/features
- Changing API shapes
- Replacing shadcn or query/router stacks
- Adding heavy chart libs (use lightweight inline SVG sparklines)

Approve and I'll execute in this order: design tokens → primitives → BottomNav/Shell → Home → Auth → Services → Wallet → Transactions/Notifications → Profile → Receipt polish.