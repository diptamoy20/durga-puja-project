# Frontend

React 18 + TypeScript on Vite. Talks to the API Gateway and nothing else.

```bash
npm install
copy .env.example .env
npm run dev          # http://localhost:5173
```

| Command | Effect |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then produce `dist/` |
| `npm run preview` | Serve the built bundle locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint over `src` |

## Layout

```
src/
├── components/
│   ├── ui/            Button, Input, Card, Modal, Alert, Badge, Pagination, Toaster
│   ├── layout/        Sidebar, Topbar, PageHeader
│   ├── users/         feature-specific pieces
│   └── ErrorBoundary.tsx
├── pages/             one folder per area: auth, users, roles, account
├── layouts/           AuthLayout (centred card) and DashboardLayout (app shell)
├── routes/            route table and the permission guards
├── services/          axios instance and one module per API area
├── store/             Redux Toolkit store, slices and typed hooks
├── hooks/             useAuth, useDebounce, useToast
├── types/             shared interfaces, mirroring the API contract
├── constants/         routes, permissions, navigation, storage keys
├── utils/             tokenStorage
└── styles/global.css  design tokens and component styles
```

`@/` is aliased to `src/`, so imports stay absolute and do not turn into
`../../../`.

## API layer

Everything goes through one axios instance in `services/api.ts`, configured
from `VITE_API_URL`. Three things happen there so that no component has to
think about them:

**The envelope is unwrapped.** The gateway returns
`{ success, message, data, meta }`. `unwrap()` and `unwrapList()` return just
the payload, so a service method reads as you would expect:

```typescript
get: (id: number): Promise<User> => unwrap(api.get(`/users/${id}`)),
```

**Expired tokens are refreshed transparently.** A 401 with code
`TOKEN_EXPIRED` triggers a refresh and the original request is retried once.
Concurrent 401s share a single in-flight refresh — without that, a page loading
several widgets would fire a burst of refreshes and token rotation would
invalidate all but the first. Only expired tokens are retried; wrong
credentials fail immediately, as they should.

**Errors are normalised.** Every rejection is an `ApiError` with `message`,
`code` and `status`, whether it came from the server, a timeout or a dead
connection. `errorMessage(error, fallback)` gets a displayable string out of
anything.

Add a new area by adding a service module, not by calling axios from a
component:

```typescript
// services/articleService.ts
import api, { unwrap } from './api';

export const articleService = {
  list: () => unwrapList<Article>(api.get('/articles')),
  publish: (id: number) => unwrap<Article>(api.post(`/articles/${id}/publish`)),
};
```

## State

Redux Toolkit, three slices:

| Slice | Holds |
| --- | --- |
| `auth` | The signed-in user, permissions and session status |
| `users` | The user table, its query, pagination and save status |
| `ui` | Sidebar state and the toast queue |

Use the typed hooks from `store/hooks.ts` rather than the raw react-redux ones —
`useAppDispatch` understands thunks, so `dispatch(login(…))` typechecks and
`.unwrap()` is available.

Two conventions in the slices are deliberate:

- **Separate status fields per concern.** `listStatus` and `saveStatus` are
  distinct, so a failed save does not blank a loaded table.
- **Query state lives in the store.** `fetchUsers` merges its argument over the
  stored query, so a component can change the page or the search alone without
  restating every filter.

Local component state is still the right choice for anything one page owns: a
modal's open flag, a form's values, a dropdown's selection.

## Routing and access control

`routes/index.tsx` is the whole route table. Pages are lazily imported, so the
login screen does not download the admin bundle.

Two guards wrap the routes:

- `ProtectedRoute` requires a session, and optionally permissions. It records
  the attempted path, so signing in returns you there rather than to the
  dashboard.
- `PublicOnlyRoute` keeps a signed-in user off the login and register pages.

```tsx
<Route
  path={ROUTES.USERS}
  element={
    <ProtectedRoute permissions={[PERMISSIONS.VIEW_USERS]}>
      <UsersListPage />
    </ProtectedRoute>
  }
/>
```

These guards are for usability, not security. The gateway enforces the same
rules, so bypassing the client just produces a 403.

**Gate on permissions, never on role names.** `useAuth().can(...)` checks
permission keys and short-circuits for Super Admin. Hard-coding
`user.roles.includes('Portal Administrator')` breaks the moment roles are
reorganised on the server.

```tsx
const { can } = useAuth();

{can(PERMISSIONS.CREATE_USERS) && <Button onClick={create}>New user</Button>}
```

The sidebar is generated from `constants/navigation.ts` using the same checks,
so a user never sees a link to a page they cannot open.

## Styling

Plain CSS with custom properties in `styles/global.css` — no framework, so
there is no build step beyond Vite and no class-name dictionary to learn.
Tokens are defined at `:root`; use them rather than literal values:

```css
.thing {
  padding: var(--space-4);
  color: var(--colour-ink);
  border-radius: var(--radius-md);
}
```

Layout is mobile-first. The sidebar is an overlay drawer below 1024px and a
permanent column above it, driven by a `matchMedia` listener in
`DashboardLayout` rather than by CSS alone, because the open state also has to
be correct for the toggle button and the overlay.

## Forms

React Hook Form, with validation declared on the field:

```tsx
<Input
  label="Email address"
  type="email"
  required
  error={errors.email?.message}
  {...register('email', {
    required: 'Enter your email address.',
    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
  })}
/>
```

`Input`, `Select` and `Textarea` use `forwardRef`, which is what lets
`register()` attach to them, and they wire up `aria-invalid` and
`aria-describedby` so errors are announced rather than only shown in red.

Client validation is a convenience. The server validates the same payload with
DTOs, and its message is what gets surfaced if the two disagree.

## Adding a page

1. Create the component under `pages/`.
2. Add its path to `constants/routes.ts`.
3. Add a lazy import and a `<Route>` in `routes/index.tsx`, with the permission
   the gateway requires for that endpoint.
4. If it belongs in the sidebar, add it to `constants/navigation.ts`.
5. Call the API through a service module in `services/`.

## Environment

Only `VITE_`-prefixed variables reach the browser, and they are **baked into
the built bundle** — so nothing secret can go in `.env`. No database URL, no
JWT secret, no microservice ports. The gateway URL is all the client needs.

```env
VITE_API_URL=http://localhost:5050/api/v1
VITE_APP_NAME="Durga Puja Global Connect"
WEB_PORT=5173
```

Vite reads `.env` at startup, so restart the dev server after changing it.
