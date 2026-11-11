# Source boundaries

Stage 3A implements only the application shell and temporary welcome feature:

```text
App.tsx
index.ts
src/
  app/
    bootstrap/     environment parser, runtime configuration and safety tests
    navigation/    typed root native stack and navigation container
    providers/     environment context and safe-area provider
  features/
    welcome/
      index.ts
      presentation/WelcomeScreen.tsx
  shared/
    theme/         neutral temporary styles, not approved Figma tokens
    ui/            safe-area screen shell
```

`app/` is composition/wiring, not an Expo Router route tree. React Navigation owns
navigation; Expo Router is not installed. `index.ts` registers the root explicitly.
The native stack currently has one route, `Welcome`, without route data or auth.

For later approved features, add `domain/`, `application/`, `data/` and
`presentation/` only when code needs them. Export a small feature API from its
`index.ts`; consumers must not depend on feature-internal screens or adapters.
Domain code stays independent of React, native modules and backend SDKs. Screens
call feature application services/hooks; repository adapters implement domain
ports. App bootstrap wires concrete dependencies. Shared UI must not import app,
feature or infrastructure modules; ESLint enforces that boundary now.

The planned feature owners are `auth`, `onboarding`, `home`, `scan`, `acne`,
`hairstyles`, `environment`, `routines`, `progress`, `journal`, `profile`, `settings`
and `legal`. Planned infrastructure owners are `supabase`, `auth`, `ai`, `media`,
`location`, `notifications`, `persistence` and `observability`. `shared/domain` and
`shared/lib` are reserved for genuinely shared contracts/utilities.

These future directories have been prepared locally without placeholder files.
Git does not preserve empty directories; create each with its first real
implementation in the relevant approved stage. The documented ownership contract
persists in a clean clone. No stub repositories, pretend auth providers, feature
routes or SDK integrations are introduced to make the tree appear complete.

Future native module sources belong in root `modules/`, reproducible Expo config
plugins in `plugins/`, approved model artifacts in `assets/models/`, and native/E2E
fixtures in `tests/`. Those areas require separate approval and contain no files
in Stage 3A. Keep heavy inference/image processing outside JS/UI threads behind
asynchronous ports; do not infer native AI compatibility from the current build.

Query/session/form/store providers are deliberately deferred until their consumers
are approved. The current providers perform no network requests or persistence.
