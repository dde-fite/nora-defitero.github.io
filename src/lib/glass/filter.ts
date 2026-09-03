// High-level helpers shared by the glass components: the full filter build,
// dimension/bezel/font-size resolution, and a couple of small utilities.
import {
  calculateDisplacementMap1D,
  calculateDisplacementMap2D,
  calculateSpecularHighlight,
  imageDataToDataURL,
} from './refraction';
import { SurfaceEquations, type SurfaceType } from './surface';

export const REFRACTIVE_INDEX = 1.5;

let filterCounter = 0;

// Stable, unique filter id per component instance so multiple GlassFilters
// on one page never collide inside backdrop-filter url(#...) references.
export function nextFilterId(): string {
  filterCounter += 1;
  return `glass-filter-${filterCounter}`;
}

export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let timeout: number | undefined;
  return function executedFunction(...args: Args) {
    const later = () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      func(...args);
    };
    if (timeout !== undefined) window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

export interface GlassFilterParams {
  width: number;
  height: number;
  radius: number;
  bezelWidth: number;
  glassThickness: number;
  refractionScale: number;
  specularOpacity: number;
  blur: number;
  surfaceType: SurfaceType;
  specularAngle?: number;
  displacementScale?: number;
  filterId?: string;
}

export interface GlassFilterResult {
  filterId: string;
  displacementUrl: string;
  specularUrl: string;
  scale: number;
  blur: number;
  specularAlpha: number;
  maximumDisplacement: number;
}

// Runs the full refraction pipeline and returns the values to plug into the SVG filter.
export function buildGlassFilter(params: GlassFilterParams): GlassFilterResult {
  const surfaceFn = SurfaceEquations[params.surfaceType];

  // Compute the 1D refraction profile along the bezel cross-section.
  const precomputed = calculateDisplacementMap1D(
    params.glassThickness,
    params.bezelWidth,
    surfaceFn,
    REFRACTIVE_INDEX,
  );
  const maximumDisplacement = Math.max(...precomputed.map(Math.abs));

  // Expand the 1D profile into a full 2D ImageData for feDisplacementMap.
  const displacementData = calculateDisplacementMap2D(
    params.width,
    params.height,
    params.width,
    params.height,
    params.radius,
    params.bezelWidth,
    maximumDisplacement || 1,
    precomputed,
  );

  // Generate the rim specular highlight.
  const specularData = calculateSpecularHighlight(
    params.width,
    params.height,
    params.radius,
    params.bezelWidth,
    params.specularAngle ?? Math.PI / 3,
  );

  const displacementUrl = imageDataToDataURL(displacementData);
  const specularUrl = imageDataToDataURL(specularData);

  return {
    filterId: params.filterId ?? nextFilterId(),
    displacementUrl,
    specularUrl,
    scale:
      params.displacementScale ?? maximumDisplacement * params.refractionScale,
    blur: params.blur,
    specularAlpha: params.specularOpacity,
    maximumDisplacement,
  };
}

// Just the peak displacement magnitude, used by the animated button to derive
// its per-frame feDisplacementMap scale without recomputing the full pipeline.
export function computeMaximumDisplacement(
  glassThickness: number,
  bezelWidth: number,
  surfaceType: SurfaceType,
): number {
  const precomputed = calculateDisplacementMap1D(
    glassThickness,
    bezelWidth,
    SurfaceEquations[surfaceType],
    REFRACTIVE_INDEX,
  );
  return Math.max(...precomputed.map(Math.abs));
}

export interface DimensionInput {
  type: 'squircle' | 'pill' | 'circle';
  responsive?: boolean;
  width?: number;
  height?: number;
  radius?: number;
  radiusPercent?: number;
  vwWidth?: number;
  vhHeight?: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface ResolvedDimensions {
  width: number;
  height: number;
  radius: number;
}

// Mirrors the original init() dimension resolution: responsive mode reads from
// the viewport (with per-type defaults), fixed mode reads px values with
// per-type defaults.
export function resolveDimensions(input: DimensionInput): ResolvedDimensions {
  const { type } = input;
  const isResponsive = input.responsive;
  const attrRadius = input.radius;
  const vwWidth = input.vwWidth;
  const vhHeight = input.vhHeight;
  const vwIsSet = typeof vwWidth === 'number' && !Number.isNaN(vwWidth);
  const vhIsSet = typeof vhHeight === 'number' && !Number.isNaN(vhHeight);
  let width: number;
  let height: number;
  let radius: number;

  if (isResponsive) {
    if (vwIsSet && vhIsSet) {
      width = Math.round((input.viewportWidth * vwWidth) / 100);
      height = Math.round((input.viewportHeight * vhHeight) / 100);
    } else if (vwIsSet) {
      width = Math.round((input.viewportWidth * vwWidth) / 100);
      switch (type) {
        case 'circle':
          height = width;
          break;
        case 'pill':
          height = Math.round(width * 0.4);
          break;
        default:
          height = width;
          break;
      }
    } else {
      switch (type) {
        case 'pill':
          width = Math.round(input.viewportWidth * 0.97);
          height = Math.round(input.viewportHeight * 0.84);
          break;
        case 'circle': {
          const size = Math.round(
            Math.min(input.viewportWidth, input.viewportHeight) * 0.5,
          );
          width = size;
          height = size;
          break;
        }
        default:
          width = Math.round(input.viewportWidth * 0.5);
          height = Math.round(input.viewportHeight * 0.5);
          break;
      }
    }

    const radiusPercent = input.radiusPercent;
    if (typeof radiusPercent === 'number' && !Number.isNaN(radiusPercent)) {
      radius = Math.round(Math.min(width, height) * (radiusPercent / 100));
    } else if (typeof attrRadius === 'number' && !Number.isNaN(attrRadius)) {
      radius = Math.round(attrRadius);
    } else {
      switch (type) {
        case 'pill':
          radius = Math.round(height / 2);
          break;
        case 'circle':
          radius = Math.round(width / 2);
          break;
        default:
          radius = Math.round(Math.min(width, height) * 0.25);
          break;
      }
    }
  } else {
    switch (type) {
      case 'pill':
        width = input.width || 200;
        height = input.height || 80;
        radius =
          typeof attrRadius === 'number' && !Number.isNaN(attrRadius)
            ? attrRadius
            : height / 2;
        break;
      case 'circle': {
        const size = input.width || input.height || 120;
        width = size;
        height = size;
        radius =
          typeof attrRadius === 'number' && !Number.isNaN(attrRadius)
            ? attrRadius
            : size / 2;
        break;
      }
      case 'squircle':
      default: {
        width = input.width || 120;
        height = input.height || 120;
        radius =
          typeof attrRadius === 'number' && !Number.isNaN(attrRadius)
            ? attrRadius
            : Math.min(width, height) * 0.25;
        break;
      }
    }
  }

  return { width, height, radius };
}

export interface BezelWidthInput {
  responsive?: boolean;
  bezelWidth?: number;
  bezelWidthPercent?: number;
  width: number;
  height: number;
}

// The bezel is the rim region where the refraction effect actually shows.
export function resolveBezelWidth(input: BezelWidthInput): number {
  const { responsive, bezelWidth, bezelWidthPercent, width, height } = input;
  if (
    responsive &&
    typeof bezelWidthPercent === 'number' &&
    !Number.isNaN(bezelWidthPercent)
  ) {
    return Math.round(Math.min(width, height) * (bezelWidthPercent / 100));
  }
  if (typeof bezelWidth === 'number' && !Number.isNaN(bezelWidth)) {
    return Math.round(bezelWidth);
  }
  return responsive ? Math.round(Math.min(width, height) * 0.038) : 20;
}

export interface FontSizeInput {
  responsive?: boolean;
  fontSize?: number;
  fontSizePercent?: number;
  minDimension: number;
}

export function resolveFontSize(input: FontSizeInput): number | undefined {
  const { responsive, fontSize, fontSizePercent, minDimension } = input;
  if (
    responsive &&
    typeof fontSizePercent === 'number' &&
    !Number.isNaN(fontSizePercent)
  ) {
    return Math.round(minDimension * (fontSizePercent / 100));
  }
  if (typeof fontSize === 'number' && !Number.isNaN(fontSize)) {
    return fontSize;
  }
  return undefined;
}