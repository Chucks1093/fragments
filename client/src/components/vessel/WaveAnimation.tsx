import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';

type Mode = 'playing' | 'paused' | 'done';
type Pt = { x: number; y: number };

type WhipState = {
	y: number[]; // anchor y values across full width
	color: string; // current interpolated color
};

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

// smooth color interpolation in RGB space
function lerpColor(color1: string, color2: string, t: number): string {
	const hex1 = color1.replace('#', '');
	const hex2 = color2.replace('#', '');

	const r1 = parseInt(hex1.substring(0, 2), 16);
	const g1 = parseInt(hex1.substring(2, 4), 16);
	const b1 = parseInt(hex1.substring(4, 6), 16);

	const r2 = parseInt(hex2.substring(0, 2), 16);
	const g2 = parseInt(hex2.substring(2, 4), 16);
	const b2 = parseInt(hex2.substring(4, 6), 16);

	const r = Math.round(lerp(r1, r2, t));
	const g = Math.round(lerp(g1, g2, t));
	const b = Math.round(lerp(b1, b2, t));

	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// smooth curve through points using cubic beziers
function buildSmoothCubicPath(points: Pt[], tension = 0.58) {
	if (points.length < 2) return '';
	const t = clamp(tension, 0, 1);

	let d = `M ${points[0].x} ${points[0].y}`;

	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;

		const dx1 = (p2.x - p0.x) * t;
		const dy1 = (p2.y - p0.y) * t;

		const dx2 = (p3.x - p1.x) * t;
		const dy2 = (p3.y - p1.y) * t;

		const c1x = p1.x + dx1 / 3;
		const c1y = p1.y + dy1 / 3;

		const c2x = p2.x - dx2 / 3;
		const c2y = p2.y - dy2 / 3;

		d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
	}

	return d;
}

const makeAnchorsX = (count: number, width: number) => {
	const step = width / (count - 1);
	return Array.from({ length: count }, (_, i) => i * step);
};

export default function WhipProgressSmooth() {
	const W = 400;
	const H = 140;

	const baseYPlay = 70;
	const baseYPause = 90;

	const POINTS = 28;

	const purple = '#7c3aed';
	const gray = '#9ca3af';

	const progressSpeed = 10;

	// tuned for ultra-smooth tail settling
	const whipDuration = 0.9;
	const whipTension = 0.65;
	const whipBend = 18;
	const whipSharpness = 2.0;

	const anchorsX = useMemo(() => makeAnchorsX(POINTS, W), []);

	const pathRef = useRef<SVGPathElement | null>(null);
	const progressRef = useRef(0);
	const tickRef = useRef<(() => void) | null>(null);

	const [mode, setMode] = useState<Mode>('playing');
	const [progressUI, setProgressUI] = useState(0);

	const stateRef = useRef<WhipState>({
		y: Array.from({ length: POINTS }, () => baseYPlay),
		color: purple,
	});

	const renderPath = () => {
		const pts: Pt[] = anchorsX.map((x, i) => ({
			x,
			y: stateRef.current.y[i],
		}));
		const d = buildSmoothCubicPath(pts, whipTension);
		pathRef.current?.setAttribute('d', d);
	};

	const renderProgressReveal = () => {
		const p = clamp(progressRef.current, 0, 100);
		const length = W;
		const visible = (p / 100) * length;

		const path = pathRef.current;
		if (!path) return;

		path.style.strokeDasharray = `${length}`;
		path.style.strokeDashoffset = `${length - visible}`;
	};

	const setFlat = (y: number) => {
		stateRef.current.y = Array.from({ length: POINTS }, () => y);
		renderPath();
	};

	// smooth progress loop
	useEffect(() => {
		if (mode !== 'playing') return;

		tickRef.current = () => {
			const dt = gsap.ticker.deltaRatio(60) / 60;

			progressRef.current += progressSpeed * dt;
			if (progressRef.current >= 100) {
				progressRef.current = 100;
				setMode('done');
				if (tickRef.current) gsap.ticker.remove(tickRef.current);
			}

			setProgressUI(progressRef.current);
			setFlat(baseYPlay);
			renderProgressReveal();
		};

		gsap.ticker.add(tickRef.current);

		return () => {
			if (tickRef.current) gsap.ticker.remove(tickRef.current);
		};
	}, [mode]);

	// ultra-smooth whip - both directions now use LTR (left to right)
	const runWhip = (opts: {
		fromY: number;
		toY: number;
		fromColor: string;
		toColor: string;
		direction: 'rtl' | 'ltr';
		onDone: () => void;
	}) => {
		const { fromY, toY, fromColor, toColor, direction, onDone } = opts;

		const path = pathRef.current;
		if (!path) return;

		renderProgressReveal();

		const proxy = { p: 0 };
		const sign = toY > fromY ? 1 : -1;

		gsap.to(proxy, {
			p: 1,
			duration: whipDuration,
			ease: 'power1.inOut',
			onUpdate() {
				const p = proxy.p;

				// smooth color transition
				const currentColor = lerpColor(fromColor, toColor, p);
				stateRef.current.color = currentColor;
				path.setAttribute('stroke', currentColor);

				const yArr = stateRef.current.y;
				for (let i = 0; i < POINTS; i++) {
					const t = i / (POINTS - 1);
					const local = direction === 'rtl' ? 1 - t : t;

					// smoother influence spread
					const rawInfluence = (p - local) * whipSharpness;
					const influence = clamp(rawInfluence, 0, 1);

					// double smoothstep for ultra-smooth settling
					let smoothInfluence =
						influence * influence * (3 - 2 * influence);
					smoothInfluence =
						smoothInfluence * smoothInfluence * (3 - 2 * smoothInfluence);

					// base movement
					const y = lerp(fromY, toY, smoothInfluence);

					// gentler bend with smooth tail falloff
					const bendIntensity = Math.sin(influence * Math.PI);
					const tailSoftness = 1 - Math.pow(smoothInfluence, 1.5);
					const bend =
						sign * whipBend * bendIntensity * tailSoftness * 0.6;

					yArr[i] = y + bend;
				}

				renderPath();
			},
			onComplete() {
				// perfectly flat final state
				stateRef.current.y = Array.from({ length: POINTS }, () => toY);
				stateRef.current.color = toColor;
				path.setAttribute('stroke', toColor);
				renderPath();
				renderProgressReveal();
				onDone();
			},
		});
	};

	const pause = () => {
		if (mode !== 'playing') return;

		if (tickRef.current) gsap.ticker.remove(tickRef.current);

		setMode('paused');

		// start from RIGHT, travel to left, going DOWN
		runWhip({
			fromY: baseYPlay,
			toY: baseYPause,
			fromColor: purple,
			toColor: gray,
			direction: 'rtl', // right to left
			onDone: () => {},
		});
	};

	const play = () => {
		if (mode !== 'paused') return;

		// start from LEFT, travel to right, going UP
		runWhip({
			fromY: baseYPause,
			toY: baseYPlay,
			fromColor: gray,
			toColor: purple,
			direction: 'ltr', // left to right
			onDone: () => {
				setMode('playing');
			},
		});
	};

	const reset = () => {
		if (tickRef.current) gsap.ticker.remove(tickRef.current);
		gsap.globalTimeline.clear();

		progressRef.current = 0;
		setProgressUI(0);

		setMode('playing');

		const path = pathRef.current;
		if (path) {
			path.setAttribute('stroke', purple);
			stateRef.current.color = purple;
		}

		stateRef.current.y = Array.from({ length: POINTS }, () => baseYPlay);
		renderPath();
		renderProgressReveal();
	};

	// initial render
	useEffect(() => {
		const path = pathRef.current;
		if (path) {
			path.setAttribute('stroke', purple);
			path.setAttribute('stroke-width', '2.5');
			path.setAttribute('fill', 'none');
			path.setAttribute('stroke-linecap', 'round');
			path.setAttribute('stroke-linejoin', 'round');
		}

		stateRef.current.y = Array.from({ length: POINTS }, () => baseYPlay);
		stateRef.current.color = purple;
		renderPath();
		renderProgressReveal();
	}, []);

	return (
		<div className="mb-6">
			<div className="text-sm mb-2">Progress: {progressUI.toFixed(1)}%</div>

			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<path ref={pathRef} />
			</svg>
		</div>
	);
}
