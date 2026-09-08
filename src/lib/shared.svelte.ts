import type { ScrollSmoother } from "gsap/ScrollSmoother";

export const scroll = $state<{
	smoother: ScrollSmoother | undefined;
	scrollTop: number;
}>({
	smoother: undefined,
	scrollTop: 0
});
