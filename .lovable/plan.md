## Goal

Refactor the integration layer behind the existing Zentrix screens. No visual, layout, copy, or workflow changes. All 15 current routes keep rendering identically; only their data-access code is replaced with a typed, centralized service layer.

## What changes

### 1. New `src/api/` layer (typed, axios-based)

Replace ad-hoc `fetch` in `src/lib/api.ts` with an axios instance + per-domain service modules.

```
src/api/
  axios.ts          # single instance, baseURL, timeout, interceptors
  client.ts         # thin wrapper exposing get/post/put/del with envelope unwrap
  auth.api.ts       # login, register, me, logout, refresh
  wallet.api.ts     # balance, banks, verifyAccount, transfer, fund
  transaction.api.ts# list, detail
  vas.api.ts        # airtime, data, electricity, exam
  crypto.api.ts     # rates, buy, sell
  notification.api.ts
  profile.api.ts
  admin.api.ts      # stub for future admin surface, isolated from user client
```

- `axios.ts`: `baseURL = import.meta.env.VITE_API_URL`, 20s timeout, JSON headers, request interceptor attaches `Bearer <token>` from `tokenStore`, response interceptor maps errors via `formatApiError()` and triggers global 401 logout, surfaces 429/5xx/network through standardized `ApiError`.
- Each `*.api.ts` exports pure async functions with typed inputs/outputs from `src/types/`. Components never construct URLs.

### 2. Token + auth state (`src/store/`)

Introduce a small Zustand store (already idiomatic, no Redux churn).

```
src/store/
  authStore.ts      # token, user, isAuthenticated, hydrate(), login(), logout()
  index.ts
```

- Persists token+user to `localStorage` under the existing `zentrix.token` / `zentrix.user` keys so current sessions survive.
- `tokenStore` (separate, sync, no React) used by axios interceptor to avoid circular import.
- 401 from interceptor → `authStore.logout()` + redirect to `/login` once.

### 3. Typed models (`src/types/`)

```
src/types/
  api.ts            # ApiEnvelope<T>, ApiError, Paginated<T>
  user.ts           # User, KycStatus
  wallet.ts         # Wallet, Bank, TransferPayload, TransferResult
  transaction.ts    # Transaction, TxnStatus, TxnType
  vas.ts            # AirtimePayload, DataPlan, ElectricityPayload, ExamPayload
  notification.ts
```

### 4. React Query hooks (`src/hooks/queries/`)

One hook per endpoint, single source of truth for keys + options. Components call hooks, not API functions directly.

```
src/hooks/queries/
  useWallet.ts          # useWalletBalance, useBanks, useVerifyAccount, useTransfer, useFundWallet
  useTransactions.ts
  useNotifications.ts
  useProfile.ts
  useVas.ts             # useBuyAirtime, useBuyData, usePayElectricity, usePayExam
  useCrypto.ts
  useAuth.ts            # useLogin, useRegister, useMe
  keys.ts               # queryKeys factory — central, typed
```

- Mutations call `qc.invalidateQueries({ queryKey: queryKeys.wallet.balance() })` etc.
- Existing `QueryClient` defaults (staleTime, offlineFirst, persistence) preserved.

### 5. Transaction safety

- All financial mutations (transfer, fund, airtime, data, electricity, exam, crypto) go through a `useSafeMutation` wrapper that:
  - generates an idempotency key (`crypto.randomUUID()`) sent as `Idempotency-Key` header
  - disables re-fire while `isPending`
  - clears any PIN from memory in `onSettled`
  - returns normalized `{ status, reference, fee, timestamp }`
- Buttons already use `disabled={m.isPending}` — keep visual, just wire to the wrapper.

### 6. Forms: React Hook Form + Zod

Migrate validation logic in `login`, `register`, `wallet.transfer`, `wallet.fund`, and the four VAS routes to RHF + Zod schemas under `src/schemas/`. Inputs, labels, placement, and error rendering stay identical — only the wiring changes (`register()` instead of manual `useState`, `formState.errors[x]?.message` replaces inline checks). Visible UI unchanged.

### 7. Global error handling

`src/lib/errors.ts`:
- `formatApiError(err): string` — extracts backend `message`, falls back to friendly text per status.
- React Query `QueryCache` + `MutationCache` `onError` → single `toast.error(formatApiError(e))` (skip if mutation defines its own onError).
- Never logs tokens or request bodies containing `pin`/`password`.

### 8. Route protection

Extract current per-route `beforeLoad` token check into `requireAuth({ context, location })` helper in `src/lib/guards.ts`. Each protected route calls it. Behavior identical to today (redirect to `/login`), just deduplicated. Admin routes (future) get separate `requireAdmin` guard reading `authStore.user.roles`.

### 9. App startup

`src/app/bootstrap.ts` runs once from `__root.tsx` `RootComponent`:
1. hydrate `authStore` from localStorage
2. if token present, fire `useMe` via `queryClient.prefetchQuery` to validate session; on 401 the interceptor clears auth
3. render `<Outlet />`

No visual splash added — matches current behavior (instant render with cached data).

### 10. Environment + security

- Add `.env.example` documenting `VITE_API_URL`.
- Remove the hardcoded `https://api.zentrix.app/api/v1` fallback from runtime code; keep only as `.env.example` default.
- PIN inputs: confirm `PinDialog` clears state on close and never logs.
- Strip any `console.log` that includes request/response bodies.

## What does NOT change

- Every file under `src/routes/**` keeps the same JSX tree, classNames, copy, and component composition.
- `src/components/**` untouched except for `Receipt` if it imports from `@/lib/api` (only the import path changes).
- `src/styles.css`, `BottomNav`, `MobileShell`, `ScreenHeader`, `PullToRefresh`, `CacheStatus`, `PinDialog` — unchanged.
- Routing tree, URLs, navigation flows — unchanged.
- `QueryClient` config, persistence, offline-first behavior — preserved.

## Compatibility shim

`src/lib/api.ts` is rewritten to re-export from `src/api/client.ts` so any missed call site keeps compiling during the migration; flagged with `@deprecated` JSDoc.

## Out of scope (call out)

- No new admin UI — only `admin.api.ts` stub + guard, since no admin screens exist yet.
- No backend changes.
- No new dependencies beyond `axios`, `zustand`, `react-hook-form`, `@hookform/resolvers` (zod is already used).

## Order of execution

1. Install deps (`axios`, `zustand`, `react-hook-form`, `@hookform/resolvers`).
2. Add `src/types/`, `src/api/`, `src/store/`, `src/hooks/queries/`, `src/schemas/`, `src/lib/guards.ts`, `src/lib/errors.ts`.
3. Rewrite `src/lib/api.ts` as compat shim.
4. Migrate routes one batch at a time (auth → wallet → vas → notifications/profile), verifying build between batches.
5. Wire global error + startup bootstrap last.
