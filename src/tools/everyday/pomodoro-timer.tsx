"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Callout, Field, StatGrid, Switch, TextInput, ToolPanel } from "@/components/ui";

const PHASES = {
  focus: { label: "Focus", command: "Work on one thing until the bell." },
  short: { label: "Short break", command: "Stand up, look away from the screen." },
  long: { label: "Long break", command: "Walk, drink water, leave the desk." },
} as const;

type Phase = keyof typeof PHASES;

export default function PomodoroTimer() {
  const [focusMinutes, setFocusMinutes] = useState("25");
  const [shortMinutes, setShortMinutes] = useState("5");
  const [longMinutes, setLongMinutes] = useState("15");
  const [rounds, setRounds] = useState("4");
  const [autoStart, setAutoStart] = useState(false);

  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const endRef = useRef<number | null>(null);

  const durations = {
    focus: Math.max(1, Number(focusMinutes) || 25) * 60,
    short: Math.max(1, Number(shortMinutes) || 5) * 60,
    long: Math.max(1, Number(longMinutes) || 15) * 60,
  };
  const roundsTarget = Math.max(1, Number(rounds) || 4);

  const advance = (from: Phase) => {
    if (from === "focus") {
      const nextCompleted = completed + 1;
      setCompleted(nextCompleted);
      const nextPhase: Phase = nextCompleted % roundsTarget === 0 ? "long" : "short";
      setPhase(nextPhase);
      setRemaining(durations[nextPhase]);
      return;
    }
    setPhase("focus");
    setRemaining(durations.focus);
  };

  useEffect(() => {
    if (!running) return;
    endRef.current = Date.now() + remaining * 1000;
    const interval = window.setInterval(() => {
      const left = Math.max(0, Math.round(((endRef.current ?? 0) - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(interval);
        setRunning(false);
        advance(phase);
      }
    }, 250);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  const clock = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const total = durations[phase];
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <ToolPanel>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Focus (min)" htmlFor="pomo-focus">
          <TextInput id="pomo-focus" type="number" min={1} max={120} value={focusMinutes} onChange={(event) => setFocusMinutes(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Short break" htmlFor="pomo-short">
          <TextInput id="pomo-short" type="number" min={1} max={60} value={shortMinutes} onChange={(event) => setShortMinutes(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Long break" htmlFor="pomo-long">
          <TextInput id="pomo-long" type="number" min={1} max={60} value={longMinutes} onChange={(event) => setLongMinutes(event.target.value)} className="font-mono" />
        </Field>
        <Field label="Focus rounds before a long break" htmlFor="pomo-rounds">
          <TextInput id="pomo-rounds" type="number" min={1} max={12} value={rounds} onChange={(event) => setRounds(event.target.value)} className="font-mono" />
        </Field>
      </div>

      <div className="mt-3">
        <Switch checked={autoStart} onChange={setAutoStart} label="Start the next phase automatically" description="Otherwise the timer waits for you to press start." />
      </div>

      <div className="mt-6 border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent-text)]">{PHASES[phase].label}</p>
        <p className="mt-2 font-mono text-6xl tabular-nums text-[var(--text)]">{clock}</p>
        <div className="mx-auto mt-4 h-1 w-full max-w-sm bg-[var(--border)]">
          <div className="h-full bg-[var(--ring)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm text-[var(--text-muted)]">{PHASES[phase].command}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => {
            if (!running) {
              setRemaining(durations[phase]);
            }
            setRunning((value) => !value);
          }}
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={() => {
            setRunning(false);
            advance(phase);
            if (autoStart) setRunning(true);
          }}
        >
          Skip phase
        </Button>
        <Button
          onClick={() => {
            setRunning(false);
            setPhase("focus");
            setRemaining(durations.focus);
            setCompleted(0);
          }}
        >
          Reset round
        </Button>
      </div>

      <div className="mt-6">
        <StatGrid
          columns={3}
          items={[
            { label: "Focus sessions finished", value: String(completed) },
            { label: "Next long break after", value: `${roundsTarget} rounds` },
            { label: "Focused time", value: `${(completed * Number(focusMinutes || 25)).toFixed(0)} min` },
          ]}
        />
      </div>

      {running ? null : completed > 0 ? (
        <Callout tone="success">Timer stopped after {completed} completed session{completed === 1 ? "" : "s"}. Press start to begin the next phase.</Callout>
      ) : null}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        The Pomodoro technique works because a 25-minute block is short enough to begin and a five-minute break is short
        enough to keep momentum. The durations are adjustable because the evidence supports breaks, not a specific
        interval — the fixed 25/5 legend is a starting point. Keeping the tab open is required; the timer is local.
      </p>
    </ToolPanel>
  );
}
