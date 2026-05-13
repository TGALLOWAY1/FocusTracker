import { useEffect } from "react";
import {
  Pause,
  Play,
  Pencil,
  Leaf,
  Smartphone,
  BellOff,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { useFocusStore, type SessionStatus } from "../../state/focusStore";
import { useFocusProjectName } from "../../state/useFocusProjectName";
import { formatMMSS } from "../../utils/time";

function StatusDot({ status }: { status: SessionStatus }) {
  const color =
    status === "running"
      ? "bg-accent-green shadow-[0_0_0_4px_rgba(95,214,138,0.18)]"
      : status === "paused"
      ? "bg-accent-yellow shadow-[0_0_0_4px_rgba(245,199,110,0.18)]"
      : "bg-text-muted";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

function SunsetBackdrop() {
  return (
    <svg
      viewBox="0 0 800 440"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1B3E" />
          <stop offset="30%" stopColor="#3A2A5C" />
          <stop offset="58%" stopColor="#6E4671" />
          <stop offset="78%" stopColor="#B97565" />
          <stop offset="92%" stopColor="#9B5263" />
          <stop offset="100%" stopColor="#241936" />
        </linearGradient>
        <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A3A6A" />
          <stop offset="100%" stopColor="#2A2348" />
        </linearGradient>
        <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F1A3A" />
          <stop offset="100%" stopColor="#10122A" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.72" r="0.4">
          <stop offset="0%" stopColor="rgba(255, 200, 150, 0.35)" />
          <stop offset="60%" stopColor="rgba(255, 200, 150, 0)" />
        </radialGradient>
      </defs>

      <rect width="800" height="440" fill="url(#sky)" />
      <rect width="800" height="440" fill="url(#glow)" />

      {/* distant mountain range */}
      <path
        d="M 0 290 L 70 220 L 140 250 L 220 200 L 300 240 L 380 195 L 460 235 L 540 205 L 620 245 L 700 215 L 800 240 L 800 440 L 0 440 Z"
        fill="url(#mtnBack)"
        opacity="0.85"
      />

      {/* foreground mountain silhouette */}
      <path
        d="M 0 340 L 60 295 L 120 320 L 200 270 L 280 300 L 360 255 L 440 285 L 520 245 L 600 285 L 680 260 L 760 300 L 800 285 L 800 440 L 0 440 Z"
        fill="url(#mtnFront)"
      />

      {/* left pine trees */}
      <g fill="#0A0B22">
        <path d="M 30 360 L 38 330 L 46 360 Z" />
        <path d="M 50 365 L 60 320 L 70 365 Z" />
        <path d="M 75 370 L 82 345 L 89 370 Z" />
        <path d="M 95 372 L 105 335 L 115 372 Z" />
      </g>

      {/* right pine trees */}
      <g fill="#0A0B22">
        <path d="M 680 365 L 690 325 L 700 365 Z" />
        <path d="M 710 372 L 720 340 L 730 372 Z" />
        <path d="M 735 368 L 745 330 L 755 368 Z" />
        <path d="M 760 374 L 770 345 L 780 374 Z" />
      </g>
    </svg>
  );
}

type CircularTimerProps = {
  remainingSec: number;
  totalSec: number;
  status: SessionStatus;
};

function CircularTimer({ remainingSec, totalSec, status }: CircularTimerProps) {
  const size = 280;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const elapsed = totalSec - remainingSec;
  const dashOffset = circumference * (elapsed / Math.max(1, totalSec));

  const ringColor = status === "paused" ? "#F5C76E" : "#5FD68A";
  const labelColor = status === "paused" ? "text-accent-yellow" : "text-accent-green";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s linear, stroke 0.3s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[68px] leading-none font-semibold tracking-tight text-white tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
          {formatMMSS(remainingSec)}
        </div>
        <div
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${labelColor}`}
        >
          <Leaf size={14} />
          <span>{status === "paused" ? "Paused" : "Focus Time"}</span>
        </div>
      </div>
    </div>
  );
}

type FlagCellProps = {
  Icon: LucideIcon;
  label: string;
  value: string;
  valueClass: string;
};

function FlagCell({ Icon, label, value, valueClass }: FlagCellProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-text-secondary leading-tight">{label}</div>
        <div className={`text-sm font-semibold leading-tight mt-0.5 ${valueClass}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function FlagsStrip() {
  const flags = useFocusStore((s) => s.flags);
  return (
    <div className="grid grid-cols-3 divide-x divide-border-subtle border-t border-border-subtle">
      <FlagCell
        Icon={Smartphone}
        label="Focus Mode"
        value={flags.focusMode ? "On" : "Off"}
        valueClass={flags.focusMode ? "text-text-primary" : "text-text-muted"}
      />
      <FlagCell
        Icon={BellOff}
        label="Notifications"
        value={flags.notificationsMuted ? "Muted" : "On"}
        valueClass={flags.notificationsMuted ? "text-brand-purple" : "text-text-muted"}
      />
      <FlagCell
        Icon={Ban}
        label="Distractions"
        value={flags.distractionsBlocked ? "Blocked" : "Open"}
        valueClass={flags.distractionsBlocked ? "text-accent-red" : "text-text-muted"}
      />
    </div>
  );
}

function IdleState() {
  const start = useFocusStore((s) => s.start);
  const project = useFocusProjectName();
  const durationSec = useFocusStore((s) => s.durationSec);
  return (
    <div className="relative h-[420px] flex flex-col items-center justify-center text-center px-8">
      <SunsetBackdrop />
      <div className="relative z-10">
        <div className="text-xs uppercase tracking-wider text-white/70 mb-2">
          Ready when you are
        </div>
        <div className="text-3xl font-semibold text-white">
          Start a focus session
        </div>
        <div className="text-sm text-white/70 mt-2">
          {project} &middot; {Math.round(durationSec / 60)} min
        </div>
        <button
          type="button"
          onClick={start}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-green text-bg-base text-sm font-semibold hover:bg-accent-green/90 transition-colors"
        >
          <Play size={16} />
          Start Focus Session
        </button>
      </div>
    </div>
  );
}

function ActiveState() {
  const status = useFocusStore((s) => s.status);
  const project = useFocusProjectName();
  const task = useFocusStore((s) => s.task);
  const remainingSec = useFocusStore((s) => s.remainingSec);
  const durationSec = useFocusStore((s) => s.durationSec);
  const nextBreak = useFocusStore((s) => s.nextBreak);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const end = useFocusStore((s) => s.end);

  const paused = status === "paused";

  return (
    <div className="relative">
      <SunsetBackdrop />

      <div className="relative z-10 px-6 pt-4 pb-5">
        {/* header row */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <StatusDot status={status} />
            <span>Focus Session</span>
          </div>
          <button
            type="button"
            onClick={end}
            className="px-4 py-2 rounded-lg bg-black/30 hover:bg-black/45 border border-white/10 text-sm font-medium text-white transition-colors backdrop-blur-sm"
          >
            End Session
          </button>
        </div>

        {/* working on */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">
            Working on
          </div>
          <div className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold text-white">
            <span>{project}</span>
            <Pencil size={14} className="text-white/55" />
          </div>
          <div className="mt-1 text-sm text-white/70">{task}</div>
        </div>

        {/* timer */}
        <div className="mt-6 flex items-center justify-center">
          <CircularTimer
            remainingSec={remainingSec}
            totalSec={durationSec}
            status={status}
          />
        </div>

        {/* pause / resume */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={paused ? resume : pause}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium text-white transition-colors backdrop-blur-sm"
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
            <span>{paused ? "Resume" : "Pause"}</span>
          </button>

          <div className="text-xs text-white/65">
            Up Next:{" "}
            <span className="text-white font-medium">{nextBreak.label}</span>{" "}
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 text-[11px] text-white/85">
              {nextBreak.minutes} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FocusSessionCard() {
  const status = useFocusStore((s) => s.status);
  const tick = useFocusStore((s) => s.tick);

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [status, tick]);

  return (
    <section
      id="focus-session-card"
      className="bg-bg-card border border-border-subtle rounded-2xl shadow-card overflow-hidden scroll-mt-6"
    >
      {status === "idle" ? <IdleState /> : <ActiveState />}
      <FlagsStrip />
    </section>
  );
}
