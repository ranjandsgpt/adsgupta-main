export const DEMO_TAB_ROUTES = [
  {
    id: 'games',
    label: 'Games',
    shortLabel: 'Games',
    path: '/games',
    documentTitle: 'Games | DemoAI',
  },
  {
    id: 'creative-template',
    label: 'Creative Template',
    shortLabel: 'Creative',
    path: '/creatives',
    documentTitle: 'Creative Template | DemoAI',
  },
  {
    id: 'monetization',
    label: 'Monetization Lab',
    shortLabel: 'Monetize',
    path: '/monetizationlab',
    documentTitle: 'Monetization Lab | DemoAI',
  },
  {
    id: 'ai-lab',
    label: 'AI Lab',
    shortLabel: 'AI Lab',
    path: '/ailab',
    documentTitle: 'AI Lab | DemoAI',
  },
];

export function documentTitleFromPath(pathname) {
  if (pathname.startsWith('/games')) return 'Games | DemoAI';
  const match = DEMO_TAB_ROUTES.find((tab) => tab.path === pathname);
  return match?.documentTitle ?? 'DemoAI | by AdsGupta';
}

export function tabIdFromPath(pathname) {
  if (pathname.startsWith('/games')) return 'games';
  const match = DEMO_TAB_ROUTES.find((tab) => tab.path === pathname);
  return match?.id ?? null;
}

export function pathFromTabId(tabId) {
  const match = DEMO_TAB_ROUTES.find((tab) => tab.id === tabId);
  return match?.path ?? '/games';
}
