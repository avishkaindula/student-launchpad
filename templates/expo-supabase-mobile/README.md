# Expo + Supabase mobile starter

A small, clean starting point for a mobile app with user accounts and a database. It runs on iOS and Android through the **Expo Go** app (and in the browser), so you can start building before anyone in your group owns a Mac or a developer account.

What you get:

- **Sign up, sign in, sign out** with email and password
- **Forgot password** (email link) and **change password** (while signed in)
- **Magic link** sign-in (email a one-time link)
- **Protected screens**: signed-out users only ever see the sign-in screens
- **Home tab**: a list of the user's own notes from Supabase (add, delete, pull to refresh)
- **Profile tab**: email, editable display name, sign out
- **Database migration** with Row Level Security, so users can only read their own data
- Light and dark mode, TypeScript, plain React Native styles (no UI library to learn)

Built with Expo SDK 58, Expo Router, React Native and `@supabase/supabase-js` v2.

---

## Quickstart (about 5 minutes)

You need **Node.js 22 or 24 (LTS)** and the **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

### 1. Install

```bash
npm install
```

### 2. Get a Supabase project

Pick **one**:

- **A. Hosted (easiest, free):** create a project at [supabase.com/dashboard](https://supabase.com/dashboard). Your group can share it.
- **B. Local (needs Docker Desktop):** run `npx supabase start`. It prints a Project URL and a Publishable key, and creates the tables for you.

### 3. Add your keys

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable                   | Hosted project                                       | Local (`supabase start`)          |
| -------------------------- | ---------------------------------------------------- | --------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL` | Project URL (click **Connect** at the top of the dashboard) | `http://<your-computer-IP>:54321` |
| `EXPO_PUBLIC_SUPABASE_KEY` | Project Settings > API Keys > **Publishable** key    | The `Publishable` key it prints   |

> With local Supabase, use your computer's Wi-Fi IP address (for example `http://192.168.1.20:54321`), not `127.0.0.1`. On your phone, `127.0.0.1` means the phone itself.

### 4. Create the tables

- **Hosted:** open **SQL Editor** in the dashboard, paste the contents of `supabase/migrations/*_init.sql`, and click **Run**.
  Or, with the CLI: `npx supabase login`, `npx supabase link --project-ref <your-project-ref>`, then `npx supabase db push`.
- **Local:** already done by `npx supabase start`. (`npx supabase db reset` re-creates everything from the migrations.)

### 5. Auth settings (hosted projects)

In the dashboard, go to **Authentication > Sign In / Providers > Email** and, while developing, **turn off "Confirm email"**. Otherwise every new account has to click a confirmation email before it can sign in.

Then go to **Authentication > URL Configuration** and add these **Redirect URLs**:

```
myapp://**
exp://**
http://localhost:8081/**
```

(Local Supabase already has these in `supabase/config.toml`.)

### 6. Run it

```bash
npx expo start
```

Scan the QR code: with the Camera app on iPhone, or from inside Expo Go on Android. Your phone and computer must be on the same Wi-Fi. Press `w` to open the web version.

Create an account, add a note, and check the `notes` table in the Supabase dashboard (Table Editor). That's the whole loop.

---

## Project structure

```
src/
  app/                        Screens. Every file here is a route (Expo Router).
    _layout.tsx               Root: theme, AuthProvider, signed-in vs signed-out routing
    sign-in.tsx               Signed-out screens (listed under `!session` in _layout.tsx)
    sign-up.tsx
    forgot-password.tsx
    (app)/                    Only visible when signed IN
      _layout.tsx             The bottom tabs
      index.tsx               Home tab: notes list (Supabase CRUD example)
      profile.tsx             Profile tab: display name, change password, sign out
    reset-password.tsx        Set a new password (from the reset email or Profile)
  components/                 Reusable UI: Button, TextField, themed Text/View, tabs
  constants/theme.ts          Colors (light/dark), spacing
  context/auth.tsx            AuthProvider + useAuth(): session, sign in/up/out, email links
  lib/supabase.ts             The Supabase client (saves the session on the device)
  lib/database.types.ts       TypeScript types generated from the database
supabase/
  migrations/                 SQL that creates your tables and security rules
  config.toml                 Settings for local Supabase (`npx supabase start`)
app.json                      App name, icons, bundle IDs, URL scheme
.env.example                  Template for your Supabase URL and key
```

**How sign-in works:** `src/context/auth.tsx` keeps the current Supabase session in React state. `src/app/_layout.tsx` uses `Stack.Protected` to show the `(app)` screens only when there is a session, and the sign-in/sign-up/forgot-password screens only when there isn't. When you sign in or out, the app switches automatically; you never have to navigate by hand.

In any screen:

```tsx
const { user, signOut } = useAuth();
```

---

## Add a new table + screen

Example: a `tasks` list.

**1. Create a migration**

```bash
npx supabase migration new add_tasks
```

Open the new file in `supabase/migrations/` and copy the `notes` section from the init migration, renaming `notes` to `tasks`. Keep all of it: the table, the index, `enable row level security`, the four policies, and the `grant` line. Without policies, the app will get an empty list; without the grant, a "permission denied" error.

**2. Apply it**

- Local: `npx supabase migration up` (or `npx supabase db reset` to start fresh)
- Hosted: `npx supabase db push`, or paste the SQL into the SQL Editor

**3. Update the TypeScript types**

```bash
npx supabase gen types typescript --local > src/lib/database.types.ts
# hosted project instead:
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts
```

**4. Add the screen**

Copy `src/app/(app)/index.tsx` to `src/app/(app)/tasks.tsx` and change `'notes'` to `'tasks'`. The types will tell you if a column name is wrong.

**5. Add a tab**

Add a `<NativeTabs.Trigger name="tasks">` in `src/components/app-tabs.tsx` (pick an [SF Symbol](https://developer.apple.com/sf-symbols/) for iOS and a [Material Symbol](https://fonts.google.com/icons) for Android), and a matching `<TabTrigger>` in `src/components/app-tabs.web.tsx`.

Need a screen that is not a tab (for example a details page)? Put it in `src/app/(app)/` and add it as a `Stack` screen, or link to it with `router.push('/your-screen')`.

---

## Email links (confirmation, magic link, password reset)

Emails from Supabase Auth contain a link that should open your app again. The app builds that link with `Linking.createURL()`, so it depends on how the app is running:

| Running in                                         | Link looks like                          | Works? |
| -------------------------------------------------- | ---------------------------------------- | ------ |
| Development build or store build                   | `myapp://reset-password`                 | Yes    |
| Web (press `w`)                                    | `http://localhost:8081/reset-password`   | Yes    |
| Expo Go, started with `npx expo start --tunnel`    | `exp://<random-name>.<tunnel-host>/--/reset-password` | Yes |
| Expo Go in a simulator, `npx expo start --localhost` | `exp://127.0.0.1:8081/--/reset-password` | Yes  |
| Expo Go on a phone over Wi-Fi (the default)        | `exp://192.168.x.x:8081/--/reset-password` | **No**: Supabase won't redirect to a Wi-Fi IP address |

So when testing password reset or magic links **in Expo Go on a real phone**, start the dev server with `npx expo start --tunnel` (you may be asked to log in to a free Expo account). Sign-up confirmation links still confirm the account either way; if the page after clicking does not load, go back to the app and sign in.

---

## Common pitfalls

- **"Project is incompatible with this version of Expo Go"**: Expo Go only runs the latest Expo SDK. Update Expo Go from the app store. Don't change the `expo` version by hand; add libraries with `npx expo install <package>` (not `npm install`) so versions match, and run `npx expo install --fix` if things drift.
- **Never put the `service_role` / secret key in the app.** Anything in `EXPO_PUBLIC_*` is shipped inside the app and can be read by anyone. Use only the publishable (or legacy `anon`) key; Row Level Security protects your data.
- **Email links open the wrong page or a blank browser tab**: the redirect URL is missing from **Authentication > URL Configuration**, or you are on Expo Go over Wi-Fi (see the table above).
- **Not receiving emails**: Supabase's built-in email sender is only for testing. It has a low hourly limit and may only deliver to your project team's addresses. Turn off "Confirm email" while developing, add your group members to the Supabase organization, and set up custom SMTP (Authentication > Emails) before real users sign up. With local Supabase, emails go to Mailpit at http://127.0.0.1:54324 instead of a real inbox.
- **Changed `.env` but nothing happened**: stop the dev server and run `npx expo start --clear`.
- **Error "Missing Supabase settings"**: `.env` is missing or misnamed. It must be called exactly `.env`, in the project root.
- **A new table always returns an empty list**: RLS is on but there's no `select` policy for it, or the rows belong to another user.
- **Phone can't connect to the dev server** (common on campus Wi-Fi that isolates devices): use `npx expo start --tunnel`.

---

## Make it yours

Before you publish, edit `app.json`:

- `name`: the name under the app icon
- `slug`: a URL-friendly name for Expo/EAS
- `scheme`: your deep link prefix (`myapp://`). If you change it, update the redirect URLs in Supabase and in `supabase/config.toml`
- `ios.bundleIdentifier` and `android.package`: **change `com.example.myapp`** to something unique you control, like `com.yourteam.yourapp`. Stores reject `com.example`, and it is hard to change after release.
- Replace the icons in `assets/` and change `tint` in `src/constants/theme.ts` for your brand color.

Useful commands: `npm run typecheck`, `npm run lint`, `npx expo-doctor`.

---

## Next steps

- **Development build with EAS Build**: Expo Go only includes Expo's built-in native modules. To use other native libraries (or test the `myapp://` links), make a development build: `npx eas-cli@latest build --profile development`. See [docs.expo.dev/develop/development-builds/introduction](https://docs.expo.dev/develop/development-builds/introduction/).
- **Push notifications**: `npx expo install expo-notifications`, then follow [docs.expo.dev/push-notifications/overview](https://docs.expo.dev/push-notifications/overview/). Remote push needs a development build.
- **Social sign-in** (Google, GitHub, Apple): see [supabase.com/docs/guides/auth/social-login](https://supabase.com/docs/guides/auth/social-login).
- **Images and files**: Supabase Storage, [supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage).
- **Live updates** between users: Supabase Realtime, [supabase.com/docs/guides/realtime](https://supabase.com/docs/guides/realtime).
- **Publishing**: `npx eas-cli@latest build` and `npx eas-cli@latest submit` (needs Apple/Google developer accounts).
