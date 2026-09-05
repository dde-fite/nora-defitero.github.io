import type { SurfaceType } from './glass/surface';

export type GlassShapeType = 'squircle' | 'pill' | 'circle';

// Svelte 5 passes component attributes through literally (no kebab-case to
// camelCase conversion), so every multi-word prop accepts BOTH spellings:
// the camelCase Svelte-native form and the kebab-case web-component form.

export interface GlassDimensionProps {
  type?: GlassShapeType;
  radius?: number;
}

export interface GlassSurfaceProps {
  surfaceType?: SurfaceType;
  'surface-type'?: SurfaceType;
  bezelWidth?: number;
  'bezel-width'?: number;
  bezelWidthPercent?: number;
  'bezel-width-percent'?: number;
  glassThickness?: number;
  'glass-thickness'?: number;
  refractionScale?: number;
  'refraction-scale'?: number;
  specularOpacity?: number;
  'specular-opacity'?: number;
  blur?: number;
  fallbackBlur?: number;
  'fallback-blur'?: number;
  tint?: string;
  forceFallback?: boolean;
  'force-fallback'?: boolean;
}

export interface GlassContentProps {
  fontSize?: number;
  'font-size'?: number;
  fontSizePercent?: number;
  'font-size-percent'?: number;
  flexCenter?: boolean;
  'flex-center'?: boolean;
}

// LiquidButton keeps the original width/height/responsive/vw/vh props for
// its intrinsic sizing. GlassFilter always fills the parent, so these
// aren't part of GlassComponentProps.
export interface GlassButtonOnlyProps {
  width?: number;
  height?: number;
  responsive?: boolean;
  vwWidth?: number;
  'vw-width'?: number;
  vhHeight?: number;
  'vh-height'?: number;
}

export type GlassComponentProps = GlassDimensionProps &
  GlassSurfaceProps &
  GlassContentProps;

export type ButtonComponentProps = GlassComponentProps & GlassButtonOnlyProps;

// Every glass prop name in both spellings, used to separate glass props from
// forwarded DOM attributes.
export const GLASS_PROP_KEYS: readonly string[] = [
  'type',
  'radius',
  // LiquidButton-only props — GlassFilter ignores them but they still need to
  // be filtered out of forwarded DOM attributes.
  'width',
  'height',
  'responsive',
  'vwWidth',
  'vw-width',
  'vhHeight',
  'vh-height',
  'surfaceType',
  'surface-type',
  'bezelWidth',
  'bezel-width',
  'bezelWidthPercent',
  'bezel-width-percent',
  'glassThickness',
  'glass-thickness',
  'refractionScale',
  'refraction-scale',
  'specularOpacity',
  'specular-opacity',
  'blur',
  'fallbackBlur',
  'fallback-blur',
  'tint',
  'forceFallback',
  'force-fallback',
  'fontSize',
  'font-size',
  'fontSizePercent',
  'font-size-percent',
  'flexCenter',
  'flex-center',
];

// Fully resolved glass settings with defaults applied (matching the original
// attribute defaults from the web components).
export interface GlassSettings {
  type: GlassShapeType;
  radius: number | undefined;
  radiusPercent: number | undefined;
  surfaceType: SurfaceType;
  bezelWidth: number | undefined;
  bezelWidthPercent: number | undefined;
  glassThickness: number;
  refractionScale: number;
  specularOpacity: number;
  blur: number;
  fallbackBlur: number;
  tint: string;
  forceFallback: boolean;
  fontSize: number | undefined;
  fontSizePercent: number | undefined;
  flexCenter: boolean;
}

// LiquidButton's resolved settings — adds the dimension management fields
// (width/height/responsive/vw/vh) on top of GlassSettings.
export interface ButtonSettings extends GlassSettings {
  width: number | undefined;
  height: number | undefined;
  responsive: boolean;
  vwWidth: number | undefined;
  vhHeight: number | undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

// Reads the raw props object (both spellings), coerces attribute strings, and
// applies the defaults from the original components.
export function normalizeGlassProps(value: object): GlassSettings {
  const raw = value as Record<string, unknown>;
  return {
    type: (raw.type ?? 'squircle') as GlassShapeType,
    radius: asNumber(raw.radius),
    surfaceType: (raw.surfaceType ??
      raw['surface-type'] ??
      'convex_squircle') as SurfaceType,
    bezelWidth: asNumber(raw.bezelWidth ?? raw['bezel-width']),
    bezelWidthPercent: asNumber(
      raw.bezelWidthPercent ?? raw['bezel-width-percent'],
    ),
    glassThickness:
      asNumber(raw.glassThickness ?? raw['glass-thickness']) ?? 100,
    refractionScale:
      asNumber(raw.refractionScale ?? raw['refraction-scale']) ?? 1.5,
    specularOpacity:
      asNumber(raw.specularOpacity ?? raw['specular-opacity']) ?? 0.8,
    blur: asNumber(raw.blur) ?? 5,
    fallbackBlur: asNumber(raw.fallbackBlur ?? raw['fallback-blur']) ?? 15,
    tint: (raw.tint ?? 'transparent') as string,
    forceFallback:
      asBoolean(raw.forceFallback ?? raw['force-fallback']) ?? false,
    fontSize: asNumber(raw.fontSize ?? raw['font-size']),
    fontSizePercent: asNumber(raw.fontSizePercent ?? raw['font-size-percent']),
    flexCenter: asBoolean(raw.flexCenter ?? raw['flex-center']) ?? true,
  };
}

// LiquidButton's normalizer — preserves the button-specific dimension props
// (width/height/responsive/vw/vh) on top of the shared glass settings.
export function normalizeButtonProps(value: object): ButtonSettings {
  const raw = value as Record<string, unknown>;
  return {
    ...normalizeGlassProps(value),
    width: asNumber(raw.width),
    height: asNumber(raw.height),
    responsive: asBoolean(raw.responsive) ?? false,
    vwWidth: asNumber(raw.vwWidth ?? raw['vw-width']),
    vhHeight: asNumber(raw.vhHeight ?? raw['vh-height']),
  };
}