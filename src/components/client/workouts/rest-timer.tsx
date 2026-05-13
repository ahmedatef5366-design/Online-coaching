"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

interface Props {
  seconds: number;
  exerciseName: string;
  onComplete: () => void;
  onSkip: () => void;
}

const RING_SIZE = 120;
const RING_STROKE = 6;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Web Audio not available — graceful fallback
  }
}

function tryVibrate() {
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    // Vibration API not available
  }
}

export function RestTimer({
  seconds,
  exerciseName,
  onComplete,
  onSkip,
}: Props) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(seconds);
  const done = remaining <= 0;
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const beeped = useRef(false);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startRef.current) / 1000;
    const left = Math.max(0, seconds - elapsed);
    setRemaining(Math.ceil(left));
    if (left <= 0) {
      if (!beeped.current) {
        beeped.current = true;
        beep();
        tryVibrate();
      }
    } else {
      frameRef.current = requestAnimationFrame(tick);
    }
  }, [seconds]);

  useEffect(() => {
    startRef.current = performance.now();
    beeped.current = false;
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [tick]);

  const progress = done ? 0 : remaining / seconds;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-xl">
        <p className="text-sm text-muted-foreground">
          {t("client.workout_session.timer_rest_period")} · {exerciseName}
        </p>
        <div className="relative flex items-center justify-center">
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="-rotate-90"
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="hsl(var(--border))"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={done ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-300 ease-linear"
            />
          </svg>
          <span className="absolute text-3xl font-bold tabular-nums">
            {done ? t("client.workout_session.timer_go") : remaining}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            {t("client.workout_session.timer_skip")}
          </Button>
          {done ? (
            <Button onClick={onComplete}>
              {t("client.workout_session.timer_next_set")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
