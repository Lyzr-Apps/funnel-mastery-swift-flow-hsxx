// ─── Purple & Teal Theme Constants ─────────────────────────
export const T = {
  primary: 'hsl(262,83%,58%)',
  primaryHover: 'hsl(262,83%,52%)',
  accent: 'hsl(174,72%,40%)',
  accentHover: 'hsl(174,72%,35%)',
  bg: 'hsl(250,25%,98%)',
  card: 'hsl(250,25%,96%)',
  sidebar: 'hsl(250,22%,95%)',
  border: 'hsl(250,20%,88%)',
  secondary: 'hsl(250,20%,92%)',
  secondaryHover: 'hsl(250,20%,88%)',
  muted: 'hsl(250,18%,90%)',
  fg: 'hsl(250,30%,12%)',
  fgSecondary: 'hsl(250,25%,18%)',
  mutedFg: 'hsl(250,15%,50%)',
  gradient: 'linear-gradient(135deg, hsl(250,30%,97%) 0%, hsl(260,25%,95%) 35%, hsl(240,20%,96%) 70%, hsl(270,20%,97%) 100%)',
} as const

export const AGENT_IDS = {
  CONTENT_ORCHESTRATOR: '699a247e738daf1ab82e84fe',
  IMAGE_CREATOR: '699a24ad8a81cf15f59e03b0',
  DISTRIBUTION: '699a24ca520a48afa0342d47',
  EMAIL_AUTOMATION: '699a24cb8a81cf15f59e03b4',
  ANALYTICS: '699a24ae4274f089c16d43f7',
} as const

export const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', color: '#E4405F' },
  { id: 'pinterest', label: 'Pinterest', color: '#BD081C' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'tiktok', label: 'TikTok', color: '#000000' },
  { id: 'x', label: 'X', color: '#000000' },
]

export const PRODUCTS = [
  'Coloring Book Journey',
  'Adoptee Checklist',
  'Guide',
  'Journal',
  'Tedswoodworking+ Affiliate',
]

export const SEQUENCE_TYPES = ['welcome', 'pitch', 'follow-up', 'abandoned_funnel', 'upsell', 'bonus_delivery', 'newsletter']
