"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flag,
  History,
  TrendingUp,
  Trophy,
  Video,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logSet } from "@/lib/workouts/actions";
import { getYouTubeEmbedUrl } from "@/lib/workouts/youtube";
import { safeHttpUrl } from "@/lib/utils/safe-url";
import { cn } from "@/lib/utils";
import type { Exercise, WorkoutLog } from "@/types/database";
import type { Locale } from "@/lib/i18n/config";
import type {
  LastSessionSummary,
  PrSummary,
} from "@/lib/workouts/queries";
import { RestTimer } from "./rest-timer";

interface Props {
  locale: Locale;
  exercises: Exercise[];
  existingLogs: WorkoutLog[];
  lastSessions: Record<string, LastSessionSummary>;
  lifetimePrs: Record<string, PrSummary>;
  today: string;
}

interface SetEntry {
  set_number: number;
  weight_kg: number;
  reps_done: number;
  persisted: boolean;
}

type LogsByExercise = Map<string, SetEntry[]>;

function buildLogMap(
  exercises: Exercise[],
  existingLogs: WorkoutLog[],
): LogsByExercise {
  const map: LogsByExercise = new Map();
  exercises.forEach((ex) => map.set(ex.id, []));
  existingLogs.forEach((log) => {
    const list = map.get(log.exercise_id);
    if (list) {
      list.push({
        set_number: log.set_number,
        weight_kg: log.weight_kg ?? 0,
        reps_done: log.reps_done ?? 0,
        persisted: true,
      });
    }
  });
  return map;
}

// Pull the first numeric value from strings like "8", "8-10", "AMRAP 12".
function parseTargetReps(reps: string): number | null {
  const match = reps.match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
}

export function WorkoutSession({
  locale,
  exercises,
  existingLogs,
  lastSessions,
  lifetimePrs,
  today,
}: Props) {
  const [logs, setLogs] = useState<LogsByExercise>(() =>
    buildLogMap(exercises, existingLogs),
  );
  const [currentIdx, setCurrentIdx] = useState(() => {
    // Start on the first exercise that still has pending sets.
    const initial = buildLogMap(exercises, existingLogs);
    const idx = exercises.findIndex(
      (ex) => (initial.get(ex.id) ?? []).length < ex.sets,
    );
    return idx === -1 ? 0 : idx;
  });
  const [timerInfo, setTimerInfo] = useState<{
    seconds: number;
    exerciseName: string;
  } | null>(null);
  const [finished, setFinished] = useState(false);

  const startedAtRef = useRef<number>(Date.now());

  const markSet = useCallback((exerciseId: string, entry: SetEntry) => {
    setLogs((prev) => {
      const next = new Map(prev);
      const list = [...(next.get(exerciseId) ?? [])];
      const idx = list.findIndex((s) => s.set_number === entry.set_number);
      if (idx >= 0) list[idx] = entry;
      else list.push(entry);
      next.set(exerciseId, list);
      return next;
    });
  }, []);

  const totalVolume = useMemo(() => {
    let vol = 0;
    logs.forEach((sets) => {
      sets.forEach((s) => {
        if (s.persisted) vol += s.weight_kg * s.reps_done;
      });
    });
    return vol;
  }, [logs]);

  const totalSets = useMemo(() => {
    let count = 0;
    logs.forEach((sets) => {
      count += sets.filter((s) => s.persisted).length;
    });
    return count;
  }, [logs]);

  const targetTotalSets = useMemo(
    () => exercises.reduce((sum, ex) => sum + ex.sets, 0),
    [exercises],
  );

  const allComplete = useMemo(
    () => exercises.every((ex) => (logs.get(ex.id) ?? []).length >= ex.sets),
    [exercises, logs],
  );

  // Move to the next exercise that still has pending sets when an exercise
  // is completed; if we're already past the end, surface the finish CTA.
  const advance = useCallback(() => {
    const startFrom = currentIdx + 1;
    for (let i = 0; i < exercises.length; i += 1) {
      const idx = (startFrom + i) % exercises.length;
      const ex = exercises[idx];
      if ((logs.get(ex.id) ?? []).length < ex.sets) {
        setCurrentIdx(idx);
        return;
      }
    }
  }, [currentIdx, exercises, logs]);

  if (finished) {
    return (
      <WorkoutSummary
        locale={locale}
        exercises={exercises}
        logs={logs}
        lastSessions={lastSessions}
        lifetimePrs={lifetimePrs}
        totalVolume={totalVolume}
        totalSets={totalSets}
        durationMs={Date.now() - startedAtRef.current}
        onBack={() => setFinished(false)}
      />
    );
  }

  const current = exercises[currentIdx];
  if (!current) return null;

  return (
    <div className="space-y-4 pb-24">
      {timerInfo ? (
        <RestTimer
          key={`${timerInfo.exerciseName}-${timerInfo.seconds}-${Date.now()}`}
          seconds={timerInfo.seconds}
          exerciseName={timerInfo.exerciseName}
          locale={locale}
          onComplete={() => setTimerInfo(null)}
          onSkip={() => setTimerInfo(null)}
        />
      ) : null}

      <SessionProgress
        exercises={exercises}
        logs={logs}
        currentIdx={currentIdx}
        onSelect={setCurrentIdx}
        totalSets={totalSets}
        targetTotalSets={targetTotalSets}
        locale={locale}
      />

      <ExerciseCard
        exercise={current}
        index={currentIdx}
        total={exercises.length}
        locale={locale}
        today={today}
        completedSets={logs.get(current.id) ?? []}
        lastSession={lastSessions[current.id] ?? null}
        onSetLogged={(entry) => {
          markSet(current.id, entry);
          setTimerInfo({
            seconds: current.rest_seconds,
            exerciseName: current.name,
          });
          // Trigger a short tap-style vibration to acknowledge the save.
          try {
            navigator.vibrate?.(15);
          } catch {
            // Vibration API not available
          }
          const justFinishedExercise =
            (logs.get(current.id)?.length ?? 0) + 1 >= current.sets;
          if (justFinishedExercise) {
            // Defer so the rest timer paints first.
            setTimeout(advance, 50);
          }
        }}
      />

      <SessionFooter
        locale={locale}
        currentIdx={currentIdx}
        total={exercises.length}
        allComplete={allComplete}
        onPrev={() => setCurrentIdx((i) => Math.max(0, i - 1))}
        onNext={() => setCurrentIdx((i) => Math.min(exercises.length - 1, i + 1))}
        onFinish={() => setFinished(true)}
      />
    </div>
  );
}

function SessionProgress({
  exercises,
  logs,
  currentIdx,
  onSelect,
  totalSets,
  targetTotalSets,
  locale,
}: {
  exercises: Exercise[];
  logs: LogsByExercise;
  currentIdx: number;
  onSelect: (idx: number) => void;
  totalSets: number;
  targetTotalSets: number;
  locale: Locale;
}) {
  const pct = targetTotalSets > 0
    ? Math.min(100, Math.round((totalSets / targetTotalSets) * 100))
    : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {locale === "ar"
            ? `تمرين ${currentIdx + 1} من ${exercises.length}`
            : `Exercise ${currentIdx + 1} of ${exercises.length}`}
        </span>
        <span className="tabular-nums">
          {totalSets} / {targetTotalSets}{" "}
          {locale === "ar" ? "سيت" : "sets"}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {exercises.map((ex, idx) => {
          const completed = (logs.get(ex.id) ?? []).length >= ex.sets;
          const active = idx === currentIdx;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelect(idx)}
              aria-current={active ? "step" : undefined}
              aria-label={ex.name}
              className={cn(
                "mx-1 inline-flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : completed
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70",
              )}
            >
              {completed ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  total,
  locale,
  today,
  completedSets,
  lastSession,
  onSetLogged,
}: {
  exercise: Exercise;
  index: number;
  total: number;
  locale: Locale;
  today: string;
  completedSets: SetEntry[];
  lastSession: LastSessionSummary | null;
  onSetLogged: (entry: SetEntry) => void;
}) {
  const nextSetNumber = completedSets.length + 1;
  const allDone = completedSets.length >= exercise.sets;
  const embedUrl = useMemo(
    () => getYouTubeEmbedUrl(exercise.video_url),
    [exercise.video_url],
  );
  const safeVideoUrl = useMemo(
    () => safeHttpUrl(exercise.video_url),
    [exercise.video_url],
  );

  const targetReps = useMemo(
    () => parseTargetReps(exercise.reps),
    [exercise.reps],
  );

  // Suggested values for the next pending set:
  // 1. Previous set in this same session (auto-fill), else
  // 2. Same set number from the last session, else
  // 3. Last set of the last session as a fallback.
  const suggestion = useMemo(() => {
    const prevInSession = completedSets[completedSets.length - 1];
    if (prevInSession) {
      return {
        weight: prevInSession.weight_kg,
        reps: prevInSession.reps_done,
        source: "session" as const,
      };
    }
    if (lastSession && lastSession.sets.length > 0) {
      const sameSet = lastSession.sets.find(
        (s) => s.set_number === nextSetNumber,
      );
      const fallback = lastSession.sets[lastSession.sets.length - 1];
      const ref = sameSet ?? fallback;
      return {
        weight: ref.weight_kg ?? 0,
        reps: ref.reps_done ?? 0,
        source: "history" as const,
      };
    }
    return null;
  }, [completedSets, lastSession, nextSetNumber]);

  // Progressive-overload nudge: if the last session hit the target rep count
  // on every set, suggest bumping the weight up by 2.5kg this session.
  const overloadHint = useMemo(() => {
    if (completedSets.length > 0) return null;
    if (!lastSession || lastSession.sets.length === 0) return null;
    if (!targetReps) return null;
    const allHit = lastSession.sets.every(
      (s) => (s.reps_done ?? 0) >= targetReps,
    );
    if (!allHit) return null;
    const suggested = lastSession.bestWeight + 2.5;
    return { suggested };
  }, [completedSets.length, lastSession, targetReps]);

  const [weight, setWeight] = useState(() =>
    suggestion ? String(suggestion.weight) : "",
  );
  const [reps, setReps] = useState(() =>
    suggestion ? String(suggestion.reps) : targetReps ? String(targetReps) : "",
  );
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the user advances past this exercise and comes back, or after they
  // log a set, refresh the inputs to reflect the new suggestion.
  useEffect(() => {
    if (allDone) return;
    if (suggestion) {
      setWeight(String(suggestion.weight));
      setReps(String(suggestion.reps));
    } else {
      setWeight("");
      setReps(targetReps ? String(targetReps) : "");
    }
    // We intentionally key on the completedSets length + exercise id only so
    // that user edits in the inputs aren't clobbered as they type.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSets.length, exercise.id]);

  const [showVideo, setShowVideo] = useState(false);

  async function handleLog() {
    setError(null);
    setPending(true);
    const result = await logSet({
      exercise_id: exercise.id,
      set_number: nextSetNumber,
      weight_kg: weight,
      reps_done: reps,
      log_date: today,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error ?? "Could not log set.");
      return;
    }
    onSetLogged({
      set_number: nextSetNumber,
      weight_kg: Number(weight),
      reps_done: Number(reps),
      persisted: true,
    });
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && weight && reps && !isPending) {
      e.preventDefault();
      void handleLog();
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {locale === "ar"
                ? `تمرين ${index + 1} من ${total}`
                : `Exercise ${index + 1} of ${total}`}
            </p>
            <CardTitle className="font-display text-2xl leading-tight">
              {exercise.name}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {exercise.sets} × {exercise.reps}
              </span>
              {" · "}
              {locale === "ar" ? "راحة" : "rest"} {exercise.rest_seconds}s
            </p>
          </div>
          {embedUrl || safeVideoUrl ? (
            <button
              type="button"
              onClick={() => setShowVideo((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Video className="h-3.5 w-3.5" />
              {showVideo
                ? locale === "ar"
                  ? "إخفاء"
                  : "Hide"
                : locale === "ar"
                  ? "الفيديو"
                  : "Video"}
            </button>
          ) : null}
        </div>

        {showVideo && embedUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-black">
            <iframe
              src={embedUrl}
              title={exercise.name}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : showVideo && safeVideoUrl ? (
          <a
            href={safeVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {locale === "ar" ? "افتح الفيديو" : "Open video"}
          </a>
        ) : null}

        {exercise.notes ? (
          <p className="rounded-md bg-primary/5 px-3 py-2 text-xs italic leading-relaxed text-muted-foreground">
            {exercise.notes}
          </p>
        ) : null}

        {lastSession ? (
          <div className="flex items-center gap-2 rounded-md border border-border/40 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
            <History className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">
              {locale === "ar" ? "آخر مرة:" : "Last time:"}{" "}
              <span className="font-semibold text-foreground">
                {lastSession.sets
                  .slice(0, 4)
                  .map(
                    (s) =>
                      `${formatNumber(s.weight_kg ?? 0)}×${s.reps_done ?? 0}`,
                  )
                  .join(" · ")}
                {lastSession.sets.length > 4 ? " …" : ""}
              </span>
            </span>
          </div>
        ) : null}

        {overloadHint ? (
          <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {locale === "ar"
                ? `آخر مرة كملت كل العدّات — جرب ${formatNumber(overloadHint.suggested)}kg المرة دي 💪`
                : `Hit every rep last time — try ${formatNumber(overloadHint.suggested)}kg today 💪`}
            </span>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        <SetsTable
          exercise={exercise}
          locale={locale}
          completedSets={completedSets}
          lastSession={lastSession}
        />

        {allDone ? (
          <div className="flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-medium text-primary">
            <Check className="h-4 w-4" />
            {locale === "ar" ? "كل المجموعات تمت!" : "All sets complete!"}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {locale === "ar"
                ? `سيت ${nextSetNumber}`
                : `Set ${nextSetNumber}`}
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`weight-${exercise.id}`}
                  className="text-xs text-muted-foreground"
                >
                  {locale === "ar" ? "الوزن (كجم)" : "Weight (kg)"}
                </label>
                <Input
                  id={`weight-${exercise.id}`}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyDown={handleKey}
                  className="h-12 text-center text-lg tabular-nums"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`reps-${exercise.id}`}
                  className="text-xs text-muted-foreground"
                >
                  {locale === "ar" ? "العدّات" : "Reps"}
                </label>
                <Input
                  id={`reps-${exercise.id}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="0"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  onKeyDown={handleKey}
                  className="h-12 text-center text-lg tabular-nums"
                />
              </div>
              <Button
                size="lg"
                className="h-12 px-4"
                disabled={isPending || !weight || !reps}
                onClick={handleLog}
              >
                <Check className="h-4 w-4" />
                {isPending
                  ? "…"
                  : locale === "ar"
                    ? "خلصت السيت"
                    : "Log set"}
              </Button>
            </div>
            {error ? (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SetsTable({
  exercise,
  locale,
  completedSets,
  lastSession,
}: {
  exercise: Exercise;
  locale: Locale;
  completedSets: SetEntry[];
  lastSession: LastSessionSummary | null;
}) {
  const rows = Array.from({ length: exercise.sets }, (_, i) => i + 1);
  return (
    <div className="overflow-hidden rounded-lg border border-border/40">
      <table className="w-full text-sm">
        <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="w-12 px-3 py-2 text-start">
              {locale === "ar" ? "سيت" : "Set"}
            </th>
            <th className="px-3 py-2 text-start">
              {locale === "ar" ? "آخر مرة" : "Last"}
            </th>
            <th className="px-3 py-2 text-end">
              {locale === "ar" ? "النهارده" : "Today"}
            </th>
            <th className="w-10 px-3 py-2" aria-label="status" />
          </tr>
        </thead>
        <tbody>
          {rows.map((setNumber) => {
            const done = completedSets.find((s) => s.set_number === setNumber);
            const lastForSet =
              lastSession?.sets.find((s) => s.set_number === setNumber) ?? null;
            return (
              <tr
                key={setNumber}
                className={cn(
                  "border-t border-border/40",
                  done && "bg-primary/5",
                )}
              >
                <td className="px-3 py-2 font-semibold tabular-nums">
                  {setNumber}
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                  {lastForSet
                    ? `${formatNumber(lastForSet.weight_kg ?? 0)}kg × ${lastForSet.reps_done ?? 0}`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-end font-medium tabular-nums">
                  {done
                    ? `${formatNumber(done.weight_kg)}kg × ${done.reps_done}`
                    : "—"}
                </td>
                <td className="px-3 py-2 text-end">
                  {done ? (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SessionFooter({
  locale,
  currentIdx,
  total,
  allComplete,
  onPrev,
  onNext,
  onFinish,
}: {
  locale: Locale;
  currentIdx: number;
  total: number;
  allComplete: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  const atFirst = currentIdx === 0;
  const atLast = currentIdx >= total - 1;
  return (
    <div
      className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+4rem)] z-30 border-t border-border/60 bg-background/95 backdrop-blur md:static md:mt-4 md:rounded-xl md:border md:bg-card md:py-3"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="container flex items-center justify-between gap-2 py-3 md:py-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={atFirst}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {locale === "ar" ? "السابق" : "Prev"}
        </Button>
        <Button
          variant={allComplete ? "default" : "outline"}
          size="sm"
          onClick={onFinish}
          className="gap-1"
        >
          <Flag className="h-4 w-4" />
          {locale === "ar"
            ? allComplete
              ? "خلص التمرين"
              : "إنهاء"
            : allComplete
              ? "Finish workout"
              : "Finish"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={atLast}
          className="gap-1"
        >
          {locale === "ar" ? "التالي" : "Next"}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}

function WorkoutSummary({
  locale,
  exercises,
  logs,
  lastSessions,
  lifetimePrs,
  totalVolume,
  totalSets,
  durationMs,
  onBack,
}: {
  locale: Locale;
  exercises: Exercise[];
  logs: LogsByExercise;
  lastSessions: Record<string, LastSessionSummary>;
  lifetimePrs: Record<string, PrSummary>;
  totalVolume: number;
  totalSets: number;
  durationMs: number;
  onBack: () => void;
}) {
  // Per-exercise comparison vs the previous session (volume) + lifetime PR
  // detection (heaviest weight or best estimated 1RM).
  const breakdown = useMemo(
    () =>
      exercises.map((ex) => {
        const sets = logs.get(ex.id) ?? [];
        const persisted = sets.filter((s) => s.persisted);
        const volume = persisted.reduce(
          (sum, s) => sum + s.weight_kg * s.reps_done,
          0,
        );
        const bestWeight = persisted.reduce(
          (m, s) => (s.weight_kg > m ? s.weight_kg : m),
          0,
        );
        const bestE1rm = persisted.reduce((m, s) => {
          const e = s.reps_done > 0 ? s.weight_kg * (1 + s.reps_done / 30) : 0;
          return e > m ? e : m;
        }, 0);

        const last = lastSessions[ex.id] ?? null;
        const lastVolume = last
          ? last.sets.reduce(
              (sum, s) =>
                sum + (s.weight_kg ?? 0) * (s.reps_done ?? 0),
              0,
            )
          : 0;
        const volumeDelta = lastVolume > 0 ? volume - lastVolume : 0;

        const pr = lifetimePrs[ex.id] ?? null;
        const isWeightPr =
          persisted.length > 0 && (!pr || bestWeight > pr.bestWeight);
        const isE1rmPr =
          persisted.length > 0 && (!pr || bestE1rm > pr.bestE1rm + 0.01);

        return {
          ex,
          completedCount: persisted.length,
          volume,
          volumeDelta,
          bestWeight,
          isWeightPr,
          isE1rmPr,
        };
      }),
    [exercises, logs, lastSessions, lifetimePrs],
  );

  const prCount = breakdown.filter((b) => b.isWeightPr || b.isE1rmPr).length;
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

  return (
    <div className="space-y-4 pb-12">
      <Card>
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            {locale === "ar" ? "خلصت الحصة 💪" : "Workout complete 💪"}
          </p>
          <CardTitle className="font-display text-3xl">
            {locale === "ar" ? "شغل نضيف!" : "Nice work!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <SummaryStat
              value={formatNumber(totalVolume)}
              label={locale === "ar" ? "حجم الحمل (كجم)" : "Volume (kg)"}
            />
            <SummaryStat
              value={String(totalSets)}
              label={locale === "ar" ? "سيتس متعملة" : "Sets done"}
            />
            <SummaryStat
              value={`${durationMinutes}'`}
              label={locale === "ar" ? "المدة" : "Duration"}
            />
          </div>

          {prCount > 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
              <Trophy className="h-4 w-4" />
              {locale === "ar"
                ? `${prCount} ${prCount === 1 ? "PR جديد" : "PR جديدة"} 🏆`
                : `${prCount} new ${prCount === 1 ? "PR" : "PRs"} 🏆`}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {locale === "ar" ? "تفاصيل التمارين" : "Per-exercise breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {breakdown.map((b) => (
            <div
              key={b.ex.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border/40 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{b.ex.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {b.completedCount}/{b.ex.sets}{" "}
                  {locale === "ar" ? "سيت" : "sets"}
                  {" · "}
                  {formatNumber(b.volume)} kg
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 text-xs">
                {b.volumeDelta !== 0 ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 tabular-nums",
                      b.volumeDelta > 0 ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <TrendingUp
                      className={cn(
                        "h-3.5 w-3.5",
                        b.volumeDelta < 0 && "rotate-180",
                      )}
                    />
                    {b.volumeDelta > 0 ? "+" : ""}
                    {formatNumber(b.volumeDelta)} kg
                  </span>
                ) : null}
                {b.isWeightPr || b.isE1rmPr ? (
                  <span className="inline-flex items-center gap-1 text-accent">
                    <Trophy className="h-3.5 w-3.5" />
                    {locale === "ar" ? "PR" : "PR"}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <Dumbbell className="h-4 w-4" />
          {locale === "ar" ? "رجوع للتمرين" : "Back to workout"}
        </Button>
        <Link
          href="/client/checkin"
          className={buttonVariants({ variant: "default" })}
        >
          {locale === "ar" ? "اعمل تشيك إن دلوقتي" : "Submit today's check-in"}
        </Link>
      </div>
    </div>
  );
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-secondary/30 p-3">
      <p className="font-display text-2xl font-bold tabular-nums text-primary">
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
