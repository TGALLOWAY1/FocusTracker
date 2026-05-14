import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Card } from "../ui/Card";

function JourneyMark() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="emptyJourneyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B7CF6" />
          <stop offset="100%" stopColor="#5FD68A" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="40" fill="url(#emptyJourneyGrad)" opacity="0.12" />
      <path
        d="M22 70 L42 38 L54 56 L66 42 L78 70 Z"
        fill="#3A3568"
        opacity="0.85"
      />
      <path d="M42 38 L48 48 L36 56 Z" fill="#5B4DCB" opacity="0.9" />
      <circle cx="44" cy="34" r="2" fill="#F5C76E" />
      <path
        d="M42 36 L44 32 L46 36"
        stroke="#F5C76E"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InsightsEmptyState() {
  return (
    <Card className="flex flex-col items-center text-center gap-4 py-12">
      <JourneyMark />
      <div className="flex flex-col gap-1.5 max-w-md">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">
          Your focus journey starts here.
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Once you complete a focus session, your reflections and patterns will
          appear here — a calm record of where your attention has been.
        </p>
      </div>
      <Link
        to="/today"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-purple text-white hover:bg-brand-purpleDeep transition-colors"
      >
        <Sparkles size={14} />
        Start a focus session
      </Link>
    </Card>
  );
}
