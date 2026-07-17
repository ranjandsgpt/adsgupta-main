export const DEMO_TAB_ROUTES = [
  { id: 'monetization', label: 'Monetization Lab', path: '/monetizationlab' },
  { id: 'ai-lab', label: 'AI Lab', path: '/ailab' },
  { id: 'creative-template', label: 'Creative Template', path: '/creatives' },
  { id: 'games', label: 'Games', path: '/games' },
];

export function tabIdFromPath(pathname) {
  const match = DEMO_TAB_ROUTES.find((tab) => tab.path === pathname);
  return match?.id ?? null;
}

export function pathFromTabId(tabId) {
  const match = DEMO_TAB_ROUTES.find((tab) => tab.id === tabId);
  return match?.path ?? '/monetizationlab';
}
