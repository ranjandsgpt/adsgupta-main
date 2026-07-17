import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Crown, Gift, Star, Zap } from 'lucide-react';
import { useDismissState } from '../hooks/useDismissState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useViewability } from '../hooks/useViewability';
import { emitTelemetry } from '../telemetry';
import { NativeWidgetChrome } from '../primitives/NativeWidgetChrome';

const TEMPLATE_ID = 'loyalty-points';

const TIERS = [
  { id: 'silver', name: 'Silver', at: 0, icon: Star },
  { id: 'gold', name: 'Gold', at: 500, icon: Zap },
  { id: 'platinum', name: 'Platinum', at: 1000, icon: Crown },
];

const REWARDS = [
  { id: 'shipping', name: 'Free express shipping', cost: 150 },
  { id: 'voucher', name: '$10 voucher', cost: 300 },
  { id: 'early', name: 'Early drop access', cost: 600 },
];

const EARN_ACTIONS = [
  { id: 'follow', label: 'Follow the brand', points: 50 },
  { id: 'review', label: 'Rate a past order', points: 75 },
  { id: 'spin', label: 'Daily check-in', points: 25 },
];

export default function Template28LoyaltyPointsWidgetAd() {
  const reducedMotion = useReducedMotion();
  const viewabilityRef = useViewability({ templateId: TEMPLATE_ID });
  const handleDismiss = useCallback((reason) => {
    emitTelemetry('close', { templateId: TEMPLATE_ID, reason });
  }, []);
  const { dismissed, dismiss } = useDismissState({ key: TEMPLATE_ID, onDismiss: handleDismiss });

  const [points, setPoints] = useState(320);
  const [displayPoints, setDisplayPoints] = useState(320);
  const [usedActions, setUsedActions] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const rafRef = useRef(null);

  // Animated counter toward the real balance.
  useEffect(() => {
    if (reducedMotion) {
      setDisplayPoints(points);
      return undefined;
    }
    const step = () => {
      setDisplayPoints((current) => {
        if (current === points) return current;
        const delta = Math.ceil(Math.abs(points - current) / 8);
        const next = current + Math.sign(points - current) * delta;
        rafRef.current = requestAnimationFrame(step);
        return next;
      });
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [points, reducedMotion]);

  const tier = [...TIERS].reverse().find((t) => points >= t.at);
  const nextTier = TIERS.find((t) => t.at > points);
  const progress = nextTier ? Math.min(100, (points / nextTier.at) * 100) : 100;

  const earn = (action) => {
    setUsedActions((prev) => [...prev, action.id]);
    setPoints((prev) => prev + action.points);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `earn-${action.id}`, points: action.points });
  };

  const claim = (reward) => {
    if (points < reward.cost || claimedRewards.includes(reward.id)) return;
    setClaimedRewards((prev) => [...prev, reward.id]);
    setPoints((prev) => prev - reward.cost);
    emitTelemetry('click', { templateId: TEMPLATE_ID, target: `claim-${reward.id}` });
    emitTelemetry('complete', { templateId: TEMPLATE_ID, action: 'reward-claimed', reward: reward.id });
  };

  if (dismissed) return null;
  const TierIcon = tier.icon;

  return (
    <div ref={viewabilityRef} className="mx-auto w-full max-w-md">
      <NativeWidgetChrome label="Sponsored · Northloop Rewards" title="Your points, simulated live" onClose={() => dismiss('button')}>
        <div className="bg-gradient-to-br from-indigo-600 via-violet-700 to-fuchsia-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Balance</p>
              <p className="text-3xl font-black text-white" aria-live="polite">{displayPoints.toLocaleString()} pts</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur">
              <TierIcon size={14} /> {tier.name} tier
            </span>
          </div>
          <div className="mt-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-black/30" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label={nextTier ? `Progress to ${nextTier.name}` : 'Top tier reached'}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
                style={{ width: `${progress}%`, transition: reducedMotion ? 'none' : 'width 500ms ease' }}
              />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-white/80">
              {nextTier ? `${nextTier.at - points} pts to ${nextTier.name}` : 'You\u2019ve reached the top tier!'}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Earn more (demo actions)</p>
            <div className="flex flex-wrap gap-2">
              {EARN_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={usedActions.includes(action.id)}
                  onClick={() => earn(action)}
                  className="min-h-11 rounded-full border border-violet-400/40 bg-violet-400/10 px-4 text-sm font-semibold text-violet-200 hover:bg-violet-400/20 disabled:opacity-40"
                >
                  {usedActions.includes(action.id) ? `+${action.points} earned ✓` : `${action.label} +${action.points}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Redeem</p>
            <div className="space-y-2">
              {REWARDS.map((reward) => {
                const claimed = claimedRewards.includes(reward.id);
                const affordable = points >= reward.cost;
                return (
                  <div key={reward.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
                    <Gift className="shrink-0 text-fuchsia-400" size={18} />
                    <p className="flex-1 text-sm font-semibold text-white">{reward.name}</p>
                    <button
                      type="button"
                      disabled={claimed || !affordable}
                      onClick={() => claim(reward)}
                      className={`min-h-11 rounded-full px-4 text-sm font-bold ${
                        claimed
                          ? 'bg-emerald-400 text-slate-950'
                          : affordable
                            ? 'bg-white text-slate-950 hover:bg-fuchsia-100'
                            : 'bg-white/10 text-slate-500'
                      }`}
                    >
                      {claimed ? 'Claimed ✓' : `${reward.cost} pts`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </NativeWidgetChrome>
    </div>
  );
}
