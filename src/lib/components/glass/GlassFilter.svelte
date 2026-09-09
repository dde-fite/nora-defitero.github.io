<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import {
    buildGlassFilter,
    debounce,
    nextFilterId,
    resolveBezelWidth,
    resolveDimensions,
    resolveFontSize,
  } from './filter';
  import { supportsBackdropFilterUrl } from './support';
  import {
    GLASS_PROP_KEYS,
    normalizeGlassProps,
    type GlassComponentProps,
  } from './types';

  interface GlassFilterProps
    extends GlassComponentProps,
      HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
  }

  let { ...props }: GlassFilterProps = $props();

  const glass = $derived(normalizeGlassProps(props));
  const className = $derived(props.class);
  const style = $derived(props.style);
  const children = $derived(props.children);

  // Everything that isn't a glass prop or a reserved Svelte prop is forwarded
  // to the root element (id, data-*, event handlers, ...).
  const rest = $derived.by((): Record<string, any> => {
    const raw = props as unknown as Record<string, unknown>;
    const out: Record<string, any> = {};
    for (const key of Object.keys(raw)) {
      if (key === 'class' || key === 'style' || key === 'children') continue;
      if (GLASS_PROP_KEYS.includes(key)) continue;
      out[key] = raw[key];
    }
    return out;
  });

  // Stable per instance; the SVG filter id and the backdrop-filter reference
  // must agree across every rebuild.
  const filterId = nextFilterId();

  let viewport = $state(
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 },
  );

  // GlassFilter always fills its parent, so the dimensions that feed the
  // filter pipeline come from the actual rendered element. A ResizeObserver
  // keeps `measured` in sync whenever the element or its parent resizes.
  let element = $state<HTMLDivElement | undefined>();
  let measured = $state({ width: 0, height: 0 });

  $effect(() => {
    const el = element;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      measured.width = Math.round(rect.width);
      measured.height = Math.round(rect.height);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  });

  // Track the viewport while in responsive mode; the resize listener is
  // debounced so we don't rebuild the (expensive) displacement maps every tick.
  $effect(() => {
    if (typeof window === 'undefined') return;
    if (!glass.responsive) return;
    const onResize = debounce(() => {
      viewport.width = window.innerWidth;
      viewport.height = window.innerHeight;
    }, 150);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  // Derive geometry from the measured size when available. Before the first
  // measurement we report zero dimensions so the filter build short-circuits
  // (no map is generated for a 0×0 canvas) and the border-radius stays at 0
  // until the real size is known.
  const dims = $derived.by(() => {
    if (measured.width < 1 || measured.height < 1) {
      return { width: 0, height: 0, radius: 0 };
    }
    return resolveDimensions({
      ...glass,
      width: measured.width,
      height: measured.height,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
    });
  });

  const bezel = $derived(
    resolveBezelWidth({
      ...glass,
      width: dims.width,
      height: dims.height,
    }),
  );

  const useBackdrop = $derived(
    typeof window !== 'undefined' &&
      !glass.forceFallback &&
      supportsBackdropFilterUrl(),
  );

  // Full filter rebuild whenever any geometry/rendering prop changes.
  const result = $derived.by(() => {
    if (
      typeof ImageData === 'undefined' ||
      typeof document === 'undefined' ||
      !useBackdrop
    ) {
      return null;
    }
    if (dims.width < 1 || dims.height < 1) {
      return null;
    }
    return buildGlassFilter({
      filterId,
      width: dims.width,
      height: dims.height,
      radius: dims.radius,
      bezelWidth: bezel,
      glassThickness: glass.glassThickness,
      refractionScale: glass.refractionScale,
      specularOpacity: glass.specularOpacity,
      blur: glass.blur,
      surfaceType: glass.surfaceType,
    });
  });

  const fontSizeValue = $derived(
    resolveFontSize({
      ...glass,
      minDimension: Math.min(dims.width, dims.height),
    }),
  );

  const rootClass = $derived(
    ['glass-element', className].filter(Boolean).join(' '),
  );
</script>

<div
  bind:this={element}
  class={rootClass}
  {style}
  style:width="100%"
  style:height="100%"
  style:border-radius={`${dims.radius}px`}
  style:font-size={fontSizeValue ? `${fontSizeValue}px` : undefined}
  style:--glass-tint={glass.tint}
  style:--fallback-blur={`${glass.fallbackBlur}px`}
  style:--liquid-backdrop-filter={
    useBackdrop ? `url(#${filterId})` : undefined
  }
  style:--slot-display={glass.flexCenter ? 'flex' : 'block'}
  style:--slot-justify={glass.flexCenter ? 'center' : 'flex-start'}
  style:--slot-align={glass.flexCenter ? 'center' : 'flex-start'}
  class:use-backdrop-filter={useBackdrop}
  class:fallback-blur={!useBackdrop}
  {...rest}
>
  {#if useBackdrop && result}
    <svg class="glass-filter-svg" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id={filterId}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          color-interpolation-filters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={result.blur}
            result="blurred"
          />
          <feImage
            href={result.displacementUrl}
            x="0"
            y="0"
            width={dims.width}
            height={dims.height}
            result="displacement_map"
            preserveAspectRatio="none"
          />
          <feDisplacementMap
            in="blurred"
            in2="displacement_map"
            scale={result.scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feColorMatrix
            in="displaced"
            type="saturate"
            values="1.3"
            result="displaced_saturated"
          />
          <feImage
            href={result.specularUrl}
            x="0"
            y="0"
            width={dims.width}
            height={dims.height}
            result="specular_layer"
            preserveAspectRatio="none"
          />
          <feComponentTransfer in="specular_layer" result="specular_faded">
            <feFuncA type="linear" slope={result.specularAlpha} />
          </feComponentTransfer>
          <feBlend
            in="specular_faded"
            in2="displaced_saturated"
            mode="screen"
          />
        </filter>
      </defs>
    </svg>
  {/if}
  <div class="glass-inner"></div>
  {#if children}
    <div class="content-slot">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .glass-element {
    position: relative;
    overflow: hidden;
    transform-origin: 50% 50%;
    will-change: transform;
    backface-visibility: hidden;
  }
  .glass-filter-svg {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .glass-inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    z-index: 3;
    pointer-events: none;
    background-color: var(--glass-tint, transparent);
  }
  .use-backdrop-filter .glass-inner {
    backdrop-filter: var(--liquid-backdrop-filter);
    -webkit-backdrop-filter: var(--liquid-backdrop-filter);
  }
  .fallback-blur .glass-inner {
    backdrop-filter: blur(var(--fallback-blur, 15px)) saturate(1.2);
    -webkit-backdrop-filter: blur(var(--fallback-blur, 15px)) saturate(1.2);
    background-color: rgba(0, 0, 0, 0);
    filter: saturate(110%);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  }
  .content-slot {
    display: var(--slot-display, flex);
    justify-content: var(--slot-justify, center);
    align-items: var(--slot-align, center);
    width: 100%;
    height: 100%;
    z-index: 4;
    position: relative;
  }
</style>