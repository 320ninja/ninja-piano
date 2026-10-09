// Theme palette carried over from the Real Estate / Travel apps, plus a Ninja default.
// [name, primary, accent, tint1, tint2, deep]
export const THEMES = {
  ninja:    ['Ninja Violet',   '#6d5dfc', '#22c55e', '#e0dcff', '#dcfce7', '#120e2e'],
  crimson:  ['Crimson Sky',    '#e11d48', '#7c3aed', '#ffe4e6', '#ede9fe', '#1f1235'],
  ocean:    ['Ocean Breeze',   '#0284c7', '#06b6d4', '#bae6fd', '#cffafe', '#0c2a43'],
  coral:    ['Coral Reef',     '#ff5a5f', '#00a699', '#ffd6cc', '#ccfbf1', '#2b1d1a'],
  sakura:   ['Sakura Bloom',   '#db2777', '#9333ea', '#fbcfe8', '#e9d5ff', '#3b0d2e'],
  forest:   ['Rainforest',     '#15803d', '#eab308', '#bbf7d0', '#fef08a', '#0f2e1c'],
  himalaya: ['Himalaya',       '#4338ca', '#0891b2', '#c7d2fe', '#a5f3fc', '#1e1b4b'],
  desert:   ['Desert Gold',    '#ea580c', '#b45309', '#fed7aa', '#fde68a', '#3a1d08'],
  lavender: ['Lavender Fields','#7c3aed', '#ec4899', '#ddd6fe', '#fbcfe8', '#2e1065'],
  tropical: ['Tropical Punch', '#059669', '#f97316', '#a7f3d0', '#fed7aa', '#063b2b'],
  arctic:   ['Arctic Glow',    '#0369a1', '#6366f1', '#e0f2fe', '#c7d2fe', '#0c1a2b'],
  sunset:   ['Bali Sunset',    '#dc2626', '#f59e0b', '#fecdd3', '#fde68a', '#3b0d0d'],
  royal:    ['Royal Gold',     '#a16207', '#1e3a8a', '#fef3c7', '#c7d2fe', '#1c1917'],
  mint:     ['Mint Lagoon',    '#0d9488', '#8b5cf6', '#99f6e4', '#ddd6fe', '#0f2e2b'],
  midnight: ['Midnight City',  '#60a5fa', '#f472b6', '#dbeafe', '#fce7f3', '#0b1120'],
  aurora:   ['Aurora Night',   '#34d399', '#a78bfa', '#d1fae5', '#ede9fe', '#022c22'],
};

export const applyTheme = (themeId, mode) => {
  const [, p, a, t1, t2, deep] = THEMES[themeId] || THEMES.ninja;
  const root = document.documentElement;
  root.style.setProperty('--p', p);
  root.style.setProperty('--a', a);
  root.style.setProperty('--t1', t1);
  root.style.setProperty('--t2', t2);
  root.style.setProperty('--deep', deep);
  const dark = mode === 'dark' || (mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.mode = dark ? 'dark' : 'light';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0b0f1c' : '#f6f5ff');
};
