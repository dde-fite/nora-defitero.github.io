<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import {
    buildGlassFilter,
    computeMaximumDisplacement,
    debounce,
    nextFilterId,
    resolveBezelWidth,
    resolveDimensions,
    resolveFontSize,
  } from './filter';
  import {
    calculateSpecularHighlight,
    imageDataToDataURL,
  } from './refraction';
  import { supportsBackdropFilterUrl } from './support';
  import {
    GLASS_PROP_KEYS,
    normalizeButtonProps,
    type ButtonComponentProps,
  } from './types';

  type SpringTiming = 'real' | 'fixed';

  interface GlassButtonProps
    extends ButtonComponentProps,
      HTMLAttributes<HTMLDivElement> {
    springTiming?: SpringTiming;
    'spring-timing'?: SpringTiming;
    children?: Snippet;
  }

  // Simple spring physics driving the hover/press animations. stiffness
  // controls how snappy it is, damping controls how much it overshoots.
  class Spring {
    value: number;
    target: number;
    velocity = 0;
    stiffness: number;
    damping: number;

    constructor(value: number, stiffness = 300, damping = 20) {
      this.value = value;
      this.target = value;
      this.stiffness = stiffness;
      this.damping = damping;
    }

    setTarget(target: number) {
      this.target = target;
    }

    // Euler integration step, call every frame with delta time.
    update(dt: number) {
      const force = (this.target - this.value) * this.stiffness;
      const dampingForce = this.velocity * this.damping;
      this.velocity += (force - dampingForce) * dt;
      this.value += this.velocity * dt;
      // Snap to rest if close enough, avoids infinite micro-oscillation.
      if (
        Math.abs(this.target - this.value) < 0.0001 &&
        Math.abs(this.velocity) < 0.001
      ) {
        this.value = this.target;
        this.velocity = 0;
      }
      return this.value;
    }

    isSettled() {
      return (
        Math.abs(this.target - this.value) < 0.0001 &&
        Math.abs(this.velocity) < 0.001
      );
    }
  }

  let { ...props }: GlassButtonProps = $props();

  const glass = $derived(normalizeButtonProps(props));
  const className = $derived(props.class);
  const style = $derived(props.style);
  const children = $derived(props.children);
  const springTiming = $derived(
    (props.springTiming ?? props['spring-timing'] ?? 'real') as SpringTiming,
  );

  const rest = $derived.by((): Record<string, any> => {
    const raw = props as unknown as Record<string, unknown>;
    const out: Record<string, any> = {};
    for (const key of Object.keys(raw)) {
      if (key === 'class' || key === 'style' || key === 'children') continue;
      if (key === 'springTiming' || key === 'spring-timing') continue;
      if (GLASS_PROP_KEYS.includes(key)) continue;
      out[key] = raw[key];
    }
    return out;
  });

  const filterId = nextFilterId();

  let viewport = $state(
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 },
  );

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

  const dims = $derived(
    resolveDimensions({
      ...glass,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
    }),
  );

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

  // Peak displacement magnitude for the per-frame scale in the animation loop.
  const maximumDisplacement = $derived.by(() => {
    if (typeof document === 'undefined') return 0;
    return computeMaximumDisplacement(
      glass.glassThickness,
      bezel,
      glass.surfaceType,
    );
  });

  // Base filter maps at the rest specular angle; the loop overrides scale and
  // regenerates the specular layer per frame.
  const filterResult = $derived.by(() => {
    if (
      typeof ImageData === 'undefined' ||
      typeof document === 'undefined' ||
      !useBackdrop
    ) {
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
      specularAngle: Math.PI / 3,
    });
  });

  const fontSizeValue = $derived(
    resolveFontSize({
      ...glass,
      minDimension: Math.min(dims.width, dims.height),
    }),
  );

  // One reactive object per spring; the animation loop mutates these and the
  // template-derived styles follow.
  const springs = $state({
    scale: new Spring(1, 150, 6),
    shadowOffsetX: new Spring(0, 500, 40),
    shadowOffsetY: new Spring(4, 500, 40),
    shadowBlur: new Spring(12, 500, 40),
    shadowAlpha: new Spring(0.15, 500, 40),
    // Boosts refraction distortion on press.
    refractionBoost: new Spring(0.8, 100, 5),
    // Rotates the specular highlight around the edge on hover/press.
    specularAngle: new Spring(Math.PI / 3, 300, 30),
  });

  let hovering = false;
  let pressed = false;
  let rafId: number | null = null;
  let lastTimestamp = 0;
  let lastFilterScale: number | null = null;
  let lastSpecularAngle: number | null = null;

  let svgEl = $state<SVGSVGElement | undefined>();

  // Kick off the rAF loop only if it isn't already running.
  function startAnimationLoop() {
    if (rafId === null) {
      lastTimestamp = 0;
      lastFilterScale = null;
      lastSpecularAngle = null;
      rafId = requestAnimationFrame(animationLoop);
    }
  }

  function animationLoop(timestamp: number) {
    if (lastTimestamp === 0) lastTimestamp = timestamp;

    // "fixed" timing uses a constant dt, useful for deterministic testing.
    const useFixedTiming = springTiming === 'fixed';
    const rawDt = useFixedTiming
      ? Math.min(0.032, 1 / 60)
      : Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;

    // Set spring targets based on the current interaction state.
    if (pressed) {
      springs.scale.setTarget(0.98);
      springs.shadowOffsetY.setTarget(8);
      springs.shadowBlur.setTarget(16);
      springs.shadowAlpha.setTarget(0.25);
      springs.refractionBoost.setTarget(1.5);
      springs.specularAngle.setTarget((-Math.PI * 4) / 3);
    } else if (hovering) {
      springs.scale.setTarget(1.05);
      springs.shadowOffsetY.setTarget(16);
      springs.shadowBlur.setTarget(24);
      springs.shadowAlpha.setTarget(0.22);
      springs.refractionBoost.setTarget(1.0);
      springs.specularAngle.setTarget(-Math.PI / 3);
    } else {
      springs.scale.setTarget(1);
      springs.shadowOffsetY.setTarget(4);
      springs.shadowBlur.setTarget(12);
      springs.shadowAlpha.setTarget(0.15);
      springs.refractionBoost.setTarget(0.8);
      springs.specularAngle.setTarget(Math.PI / 3);
    }

    // Sub-step the spring integration for stability at high stiffness.
    const MAX_SUBSTEP = 1 / 120;
    const springList = Object.values(springs);
    let remaining = rawDt;
    while (remaining > 0) {
      const stepDt = Math.min(remaining, MAX_SUBSTEP);
      for (const s of springList) s.update(stepDt);
      remaining -= stepDt;
    }

    if (useBackdrop && svgEl) {
      // Only update the SVG filter scale when it shifts enough to matter.
      const dynamicRefractionScale =
        glass.refractionScale * springs.refractionBoost.value;
      const newFilterScale = maximumDisplacement * dynamicRefractionScale;
      if (Math.abs(newFilterScale - (lastFilterScale ?? -1)) > 0.5) {
        const map = svgEl.querySelector('feDisplacementMap');
        if (map) map.setAttribute('scale', String(newFilterScale));
        lastFilterScale = newFilterScale;
      }

      // Regenerate the specular highlight only when the angle changes meaningfully.
      let specularAngle = springs.specularAngle.value % (Math.PI * 2);
      if (specularAngle > Math.PI) specularAngle -= Math.PI * 2;
      if (specularAngle < -Math.PI) specularAngle += Math.PI * 2;
      const angleDiff = Math.abs(
        specularAngle - (lastSpecularAngle ?? Math.PI / 3),
      );
      if (angleDiff > 0.08) {
        const specularData = calculateSpecularHighlight(
          dims.width,
          dims.height,
          dims.radius,
          bezel,
          specularAngle,
        );
        const specularUrl = imageDataToDataURL(specularData);
        const img = svgEl.querySelector('feImage[result="specular_layer"]');
        if (img) img.setAttribute('href', specularUrl);
        lastSpecularAngle = specularAngle;
      }
    }

    const allSettled = Object.values(springs).every((s) => s.isSettled());

    // Clamp the specular angle once settled to prevent accumulated float drift.
    if (allSettled && springs.specularAngle.value > Math.PI * 2) {
      const normalized = springs.specularAngle.value % (Math.PI * 2);
      springs.specularAngle.value = normalized;
      springs.specularAngle.target = normalized;
    }

    // Self-terminate when all springs have settled; restarts on the next interaction.
    if (!allSettled) {
      rafId = requestAnimationFrame(animationLoop);
    } else {
      rafId = null;
    }
  }

  function onMouseEnter() {
    hovering = true;
    startAnimationLoop();
  }

  function onMouseLeave() {
    hovering = false;
    startAnimationLoop();
  }

  function onMouseDown() {
    pressed = true;
    startAnimationLoop();
  }

  // Stop the rAF loop on destroy (no leaked animation frames).
  $effect(() => {
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  });

  // Listen on window so releasing outside the button still clears press state.
  $effect(() => {
    if (typeof window === 'undefined') return;
    const onWindowMouseUp = () => {
      if (pressed) {
        pressed = false;
        startAnimationLoop();
      }
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  });

  // Whenever the base filter rebuilds, restart the loop and clear the
  // per-frame snapshots so the boost-adjusted scale and specular angle
  // reapply to the freshly rendered SVG.
  $effect(() => {
    filterResult;
    lastFilterScale = null;
    lastSpecularAngle = null;
    if (typeof window !== 'undefined') startAnimationLoop();
  });

  const scaleTransform = $derived.by(() => {
    const roundedScale = Math.round(springs.scale.value * 10000) / 10000;
    return roundedScale === 1 ? undefined : `scale(${roundedScale})`;
  });

  const shadowStyle = $derived.by(() => {
    const ox = Math.round(springs.shadowOffsetX.value * 10) / 10;
    const oy = Math.round(springs.shadowOffsetY.value * 10) / 10;
    const ob = Math.round(springs.shadowBlur.value * 10) / 10;
    const oa = Math.round(springs.shadowAlpha.value * 1000) / 1000;
    return `${ox}px ${oy}px ${ob}px rgba(0, 0, 0, ${oa})`;
  });

  const rootClass = $derived(
    ['glass-button', className].filter(Boolean).join(' '),
  );
</script>

<div
  class={rootClass}
  {style}
  style:width={`${dims.width}px`}
  style:height={`${dims.height}px`}
  style:border-radius={`${dims.radius}px`}
  style:--button-font-size={fontSizeValue ? `${fontSizeValue}px` : undefined}
  style:--glass-tint={glass.tint}
  style:--fallback-blur={`${glass.fallbackBlur}px`}
  style:--liquid-backdrop-filter={
    useBackdrop ? `url(#${filterId})` : undefined
  }
  style:transform={scaleTransform}
  style:box-shadow={shadowStyle}
  class:use-backdrop-filter={useBackdrop}
  class:fallback-blur={!useBackdrop}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onmousedown={onMouseDown}
  {...rest}
>
  {#if useBackdrop && filterResult}
    <svg
      class="glass-filter-svg"
      aria-hidden="true"
      focusable="false"
      bind:this={svgEl}
    >
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
            stdDeviation={filterResult.blur}
            result="blurred"
          />
          <feImage
            href={filterResult.displacementUrl}
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
            scale={filterResult.scale}
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
            href={filterResult.specularUrl}
            x="0"
            y="0"
            width={dims.width}
            height={dims.height}
            result="specular_layer"
            preserveAspectRatio="none"
          />
          <feComponentTransfer in="specular_layer" result="specular_faded">
            <feFuncA type="linear" slope={filterResult.specularAlpha} />
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
  <div class="glass-inner">
    <div class="flex gap-4 items-center justify-center text-xl text-primary font-display font-light">
      {#if children}
        {@render children()}
      {:else}
        Button
      {/if}
    </div>
  </div>
</div>

<style>
  .glass-button {
    position: relative;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    display: inline-block;
    transform-origin: 50% 50%;
  }
  .glass-filter-svg {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .glass-inner {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--glass-tint, transparent);
  }
  .use-backdrop-filter .glass-inner {
    backdrop-filter: var(--liquid-backdrop-filter);
    -webkit-backdrop-filter: var(--liquid-backdrop-filter);
  }
  .fallback-blur .glass-inner {
    backdrop-filter: blur(var(--fallback-blur, 15px)) saturate(1.2);
    -webkit-backdrop-filter: blur(var(--fallback-blur, 15px)) saturate(1.2);
    background-color: var(--btn-bg, rgba(0, 0, 0, 0));
    filter: saturate(110%);
    box-shadow: inset 0 0 0 1px var(--btn-border, rgba(255, 255, 255, 0.25));
  }
</style>