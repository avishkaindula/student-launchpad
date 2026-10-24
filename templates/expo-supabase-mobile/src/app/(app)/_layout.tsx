import AppTabs from '@/components/app-tabs';

// Everything in src/app/(app) is only reachable when signed in (see src/app/_layout.tsx).
// The tabs themselves are defined in src/components/app-tabs.tsx (iOS/Android)
// and src/components/app-tabs.web.tsx (web).
export default function AppLayout() {
  return <AppTabs />;
}
