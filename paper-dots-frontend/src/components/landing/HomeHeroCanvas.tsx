"use client";

import { useEffect, useRef } from "react";

const PALETTE = ["#c5e89a", "#9ed06c", "#ffd9c2", "#f4a97f", "#a9cf7c", "#dcf0c2"];
const POP = "#ff5d8f";
const KINDS = ["dot", "ring", "arc", "tri", "heart", "snow", "quad"] as const;
type ShapeKind = (typeof KINDS)[number];

interface Shape {
    kind: ShapeKind;
    x: number;
    y: number;
    r: number;
    col: string;
    rot: number;
    vr: number;
    vx: number;
    vy: number;
    op: number;
}

function rnd(a: number, b: number) {
    return a + Math.random() * (b - a);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawHeart(ctx: CanvasRenderingContext2D, s: number) {
    const k = s / 24;
    ctx.beginPath();
    ctx.moveTo(0, 7 * k);
    ctx.bezierCurveTo(-2 * k, 3 * k, -9 * k, -1 * k, -9 * k, -7 * k);
    ctx.bezierCurveTo(-9 * k, -12 * k, -4 * k, -13 * k, 0, -8 * k);
    ctx.bezierCurveTo(4 * k, -13 * k, 9 * k, -12 * k, 9 * k, -7 * k);
    ctx.bezierCurveTo(9 * k, -1 * k, 2 * k, 3 * k, 0, 7 * k);
    ctx.closePath();
    ctx.fill();
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = s.op;
    const c = s.col;
    const r = s.r;
    if (s.kind === "dot") {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.5, 0, 7);
        ctx.fill();
    } else if (s.kind === "ring") {
        ctx.strokeStyle = c;
        ctx.lineWidth = r * 0.16;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.46, 0, 7);
        ctx.stroke();
    } else if (s.kind === "arc") {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 0.5);
        ctx.lineTo(r * 0.5, -r * 0.5);
        ctx.arc(-r * 0.5, -r * 0.5, r, 0, Math.PI / 2);
        ctx.closePath();
        ctx.fill();
    } else if (s.kind === "tri") {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.55);
        ctx.lineTo(r * 0.5, r * 0.45);
        ctx.lineTo(-r * 0.5, r * 0.45);
        ctx.closePath();
        ctx.fill();
    } else if (s.kind === "quad") {
        ctx.fillStyle = c;
        const q = r * 0.42;
        roundRect(ctx, -q, -q, q * 2, q * 2, q * 0.32);
        ctx.fill();
    } else if (s.kind === "heart") {
        ctx.fillStyle = c;
        drawHeart(ctx, r * 0.9);
    } else if (s.kind === "snow") {
        ctx.strokeStyle = c;
        ctx.lineWidth = Math.max(1, r * 0.06);
        ctx.lineCap = "round";
        for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -r * 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -r * 0.32);
            ctx.lineTo(-r * 0.13, -r * 0.42);
            ctx.moveTo(0, -r * 0.32);
            ctx.lineTo(r * 0.13, -r * 0.42);
            ctx.stroke();
        }
    }
    ctx.restore();
}

/** Mockup's ambient hero background: a slow drifting field of the site's tool shapes
 *  (dots, arcs, hearts, snowflakes...), ported 1:1 from home-desktop.html's inline script. */
export default function HomeHeroCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let w = 0;
        let h = 0;
        let shapes: Shape[] = [];
        let raf = 0;
        let running = true;

        function make(): Shape {
            const kind = KINDS[(Math.random() * KINDS.length) | 0];
            const big = Math.random() < 0.28;
            return {
                kind,
                x: rnd(0, w),
                y: rnd(0, h),
                r: big ? rnd(34, 64) : rnd(12, 30),
                col: kind === "heart" && Math.random() < 0.5 ? POP : PALETTE[(Math.random() * PALETTE.length) | 0],
                rot: rnd(0, Math.PI * 2),
                vr: rnd(-0.0015, 0.0015),
                vx: rnd(-0.09, 0.09),
                vy: rnd(-0.16, -0.05),
                op: rnd(0.1, 0.3),
            };
        }

        function size() {
            if (!canvas) return;
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function seed() {
            shapes = [];
            const n = Math.round(Math.min(46, (w * h) / 26000));
            for (let i = 0; i < n; i++) shapes.push(make());
        }

        function tick() {
            if (!ctx) return;
            ctx.clearRect(0, 0, w, h);
            const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.7);
            g.addColorStop(0, "rgba(238,247,226,0)");
            g.addColorStop(1, "rgba(220,240,194,0.25)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            for (const s of shapes) {
                s.x += s.vx;
                s.y += s.vy;
                s.rot += s.vr;
                if (s.y < -70) {
                    s.y = h + 60;
                    s.x = rnd(0, w);
                }
                if (s.x < -70) s.x = w + 60;
                if (s.x > w + 70) s.x = -60;
                drawShape(ctx, s);
            }
            if (running) raf = requestAnimationFrame(tick);
        }

        function start() {
            if (reduce) return;
            running = true;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(tick);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(raf);
        }

        function handleResize() {
            size();
            seed();
        }

        function handleVisibility() {
            if (document.hidden) stop();
            else start();
        }

        size();
        seed();
        if (reduce) tick();
        else start();

        window.addEventListener("resize", handleResize);
        document.addEventListener("visibilitychange", handleVisibility);

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) start();
                else stop();
            },
            { threshold: 0.02 },
        );
        io.observe(canvas);

        return () => {
            stop();
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibility);
            io.disconnect();
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />;
}
