export interface PlaceholderDef {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  borderRadius?: number;
  label?: string;
}

export interface TemplateDef {
  id: string;
  name: string;
  tag: string;
  slotCount: number;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  placeholders?: PlaceholderDef[];
  previewBg: string;
  previewAccent: string;
  hideBranding?: boolean;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'photo4_01',
    name: 'Classic Dark',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#0a0a0a',
    backgroundImage: '/templates/4/1.png',
    accentColor: '#cc7a00',
    previewBg: '#0a0a0a',
    previewAccent: '#cc7a00',
  },
  {
    id: 'photo4_02',
    name: 'Minimal',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#f5f5f5',
    backgroundImage: '/templates/4/2.png',
    accentColor: '#000000',
    previewBg: '#f5f5f5',
    previewAccent: '#000000',
  },
  {
    id: 'photo4_03',
    name: 'Forest',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#042a12',
    backgroundImage: '/templates/4/3.png',
    accentColor: '#cc7a00',
    previewBg: '#042a12',
    previewAccent: '#cc7a00',
  },
  {
    id: 'photo4_04',
    name: 'Leopard',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#c49a6c',
    backgroundImage: '/templates/4/4.png',
    accentColor: '#ffffff',
    previewBg: '#c49a6c',
    previewAccent: '#ffffff',
  },
  {
    id: 'photo4_05',
    name: 'Film Dot',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#000000',
    backgroundImage: '/templates/4/5.png',
    accentColor: '#ffffff',
    previewBg: '#000000',
    previewAccent: '#ffffff',
  },
  {
    id: 'photo4_06',
    name: 'Film Strip',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#000000',
    backgroundImage: '/templates/4/6.png',
    accentColor: '#ffffff',
    previewBg: '#000000',
    previewAccent: '#ffffff',
  },
  {
    id: 'photo4_07',
    name: 'Sweet',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#ffffff',
    backgroundImage: '/templates/4/7.png',
    accentColor: '#000000',
    previewBg: '#ffffff',
    previewAccent: '#000000',
  },
  {
    id: 'photo4_08',
    name: 'Neon Heart',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#000000',
    backgroundImage: '/templates/4/8.png',
    accentColor: '#ff1fa9',
    previewBg: '#000000',
    previewAccent: '#ff1fa9',
  },
  {
    id: 'photo4_09',
    name: 'Tropical',
    tag: 'photoism',
    slotCount: 4,
    canvasWidth: 592,
    canvasHeight: 1776,
    backgroundColor: '#0a0a0a',
    backgroundImage: '/templates/4/9.png',
    accentColor: '#ffffff',
    previewBg: '#0a0a0a',
    previewAccent: '#ffffff',
  },

  // ── 6-shot templates (2 cols × 3 rows) ──

  {
    id: 'photo6_01',
    name: 'KCON 2022',
    tag: 'photoism',
    slotCount: 6,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#8854a5',
    backgroundImage: '/templates/6/01.png',
    accentColor: '#ffffff',
    previewBg: '#8854a5',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo6_02',
    name: "Valentine's Day",
    tag: 'photoism',
    slotCount: 6,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#1e0d00',
    backgroundImage: '/templates/6/02.png',
    accentColor: '#ffffff',
    previewBg: '#1e0d00',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo6_03',
    name: 'Mono Mansion',
    tag: 'photoism',
    slotCount: 6,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#f1f0ed',
    backgroundImage: '/templates/6/03.png',
    accentColor: '#333333',
    previewBg: '#f1f0ed',
    previewAccent: '#333333',
    hideBranding: true,
  },
  {
    id: 'photo6_04',
    name: 'Harufilm',
    tag: 'photoism',
    slotCount: 6,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#c6ccd6',
    backgroundImage: '/templates/6/04.png',
    accentColor: '#444444',
    previewBg: '#c6ccd6',
    previewAccent: '#444444',
    hideBranding: true,
  },
  {
    id: 'photo6_05',
    name: 'Classic Gray',
    tag: 'photoism',
    slotCount: 6,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#ababab',
    backgroundImage: '/templates/6/05.png',
    accentColor: '#ffffff',
    previewBg: '#ababab',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo6_06',
    name: 'XOXO',
    tag: 'photoism',
    slotCount: 6,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#000000',
    backgroundImage: '/templates/6/06.png',
    accentColor: '#ffffff',
    previewBg: '#000000',
    previewAccent: '#ffffff',
    hideBranding: true,
  },

  // ── 8-shot templates (2 cols × 4 rows) ──

  {
    id: 'photo8_01',
    name: 'ENHYPEN',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#111111',
    backgroundImage: '/templates/8/01.png',
    accentColor: '#ffffff',
    previewBg: '#111111',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo8_02',
    name: 'Classic B',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#000000',
    backgroundImage: '/templates/8/02.png',
    accentColor: '#ffffff',
    previewBg: '#000000',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo8_03',
    name: 'Unframe',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#dcdbca',
    backgroundImage: '/templates/8/03.png',
    accentColor: '#333333',
    previewBg: '#dcdbca',
    previewAccent: '#333333',
    hideBranding: true,
  },
  {
    id: 'photo8_04',
    name: 'Classic D',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 880,
    canvasHeight: 1184,
    backgroundColor: '#000000',
    backgroundImage: '/templates/8/04.png',
    accentColor: '#ffffff',
    previewBg: '#000000',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo8_05',
    name: 'Blue',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#115eb3',
    backgroundImage: '/templates/8/05.png',
    accentColor: '#ffffff',
    previewBg: '#115eb3',
    previewAccent: '#ffffff',
    hideBranding: true,
  },
  {
    id: 'photo8_06',
    name: 'Film',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#ffffff',
    backgroundImage: '/templates/8/06.png',
    accentColor: '#333333',
    previewBg: '#ffffff',
    previewAccent: '#333333',
    hideBranding: true,
  },
  {
    id: 'photo8_07',
    name: 'Film Pink',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#ffc2d6',
    backgroundImage: '/templates/8/07.png',
    accentColor: '#333333',
    previewBg: '#ffc2d6',
    previewAccent: '#333333',
    hideBranding: true,
  },
  {
    id: 'photo8_08',
    name: 'Film Lavender',
    tag: 'photoism',
    slotCount: 8,
    canvasWidth: 832,
    canvasHeight: 1248,
    backgroundColor: '#d5cfed',
    backgroundImage: '/templates/8/08.png',
    accentColor: '#333333',
    previewBg: '#d5cfed',
    previewAccent: '#333333',
    hideBranding: true,
  },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;

export function getDefaultTemplateId(slotCount: number): string {
  return TEMPLATES.find((t) => t.slotCount === slotCount)?.id ?? TEMPLATES[0].id;
}

export function getTemplatesForSlotCount(slotCount: number): TemplateDef[] {
  return TEMPLATES.filter((t) => t.slotCount === slotCount);
}

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function hasStaticPlaceholders(
  t: TemplateDef
): t is TemplateDef & { placeholders: PlaceholderDef[] } {
  return Array.isArray(t.placeholders) && t.placeholders.length > 0;
}
