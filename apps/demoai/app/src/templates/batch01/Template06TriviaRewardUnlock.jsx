import React, { useState } from 'react';
import { CheckCircle2, Gift, RotateCcw, XCircle } from 'lucide-react';
import BatchTemplateFrame, { track } from './BatchTemplateFrame';

const ID = 'trivia-reward-unlock';
const REWARD_THRESHOLD = 2;

const QUESTIONS = [
  {
    prompt: 'Red Planet Coffee roasts its signature blend to match which planet\u2019s famous hue?',
    options: ['Mercury', 'Venus', 'Mars'],
    answer: 'Mars',
    emoji: '\u2615',
  },
  {
    prompt: 'A double shot of Red Planet espresso is pulled in roughly how many seconds?',
    options: ['5 seconds', '25 seconds', '2 minutes'],
    answer: '25 seconds',
    emoji: '\u23F1\uFE0F',
  },
  {
    prompt: 'Which brewing method does Red Planet recommend for its Crater Dark roast?',
    options: ['Cold brew', 'Instant granules', 'Microwave steeping'],
    answer: 'Cold brew',
    emoji: '\uD83E\uDDCA',
  },
];

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ answered, total, reducedMotion }) {
  const progress = answered / total;
  return (
    <div className="relative h-14 w-14 shrink-0" role="img" aria-label={`${answered} of ${total} questions answered`}>
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          style={reducedMotion ? undefined : { transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black" aria-hidden="true">
        {answered}/{total}
      </span>
    </div>
  );
}

function TriviaQuiz({ reducedMotion }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[questionIndex];
  const answered = Boolean(selected);
  const rewardUnlocked = score >= REWARD_THRESHOLD;

  const choose = (option) => {
    if (answered) return;
    const correct = option === question.answer;
    setSelected(option);
    if (correct) setScore((current) => current + 1);
    track(ID, 'click', { target: 'answer', question: questionIndex + 1, answer: option, correct });
  };

  const next = () => {
    track(ID, 'click', { target: questionIndex < QUESTIONS.length - 1 ? 'next-question' : 'see-results' });
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelected('');
    } else {
      setFinished(true);
      track(ID, 'complete', {
        score,
        total: QUESTIONS.length,
        rewardUnlocked: score >= REWARD_THRESHOLD,
        reward: score >= REWARD_THRESHOLD ? 'free-cold-brew' : null,
      });
    }
  };

  const restart = () => {
    track(ID, 'click', { target: 'restart' });
    setQuestionIndex(0);
    setSelected('');
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-950 p-6 text-center ${reducedMotion ? '' : 'animate-fade-in'}`}>
        {rewardUnlocked ? (
          <Gift className={`mx-auto text-amber-300 ${reducedMotion ? '' : 'animate-bounce'}`} size={60} />
        ) : (
          <p className="text-5xl" aria-hidden="true">&#9749;</p>
        )}
        <h3 className="mt-4 text-2xl font-black">{score}/{QUESTIONS.length} correct</h3>
        <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left" aria-label="Question results">
          {QUESTIONS.map((entry, index) => (
            <li key={entry.answer} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold">
              <span>Question {index + 1}</span>
              <span className="text-slate-300">{entry.answer}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 min-h-6 text-sm font-semibold" aria-live="polite">
          {rewardUnlocked
            ? 'Reward unlocked — a free Crater Dark cold brew is waiting for you!'
            : `Get at least ${REWARD_THRESHOLD}/${QUESTIONS.length} to unlock the free cold brew. Try again!`}
        </p>
        <button
          type="button"
          onClick={restart}
          className="mx-auto mt-4 flex min-h-11 items-center gap-2 rounded-full bg-white px-6 font-black text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          <RotateCcw size={18} aria-hidden="true" /> Play again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-950 p-5">
        <ProgressRing answered={questionIndex + (answered ? 1 : 0)} total={QUESTIONS.length} reducedMotion={reducedMotion} />
        <div className="min-w-0 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Question {questionIndex + 1} of {QUESTIONS.length} <span aria-hidden="true">{question.emoji}</span>
          </p>
          <h3 className="mt-1 text-lg font-black leading-snug">{question.prompt}</h3>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {question.options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === question.answer;
          const revealCorrect = answered && isCorrect;
          return (
            <button
              key={option}
              type="button"
              onClick={() => choose(option)}
              disabled={answered}
              aria-pressed={isSelected}
              className={`flex min-h-11 items-center justify-between rounded-xl border px-4 text-left font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${reducedMotion ? '' : 'transition-colors duration-300'} ${
                isSelected
                  ? isCorrect
                    ? 'border-emerald-400 bg-emerald-400/15'
                    : 'border-rose-400 bg-rose-400/15'
                  : revealCorrect
                    ? 'border-emerald-400/60 bg-emerald-400/10'
                    : 'border-white/10 bg-white/5'
              } ${answered && !isSelected && !revealCorrect ? 'opacity-60' : ''}`}
            >
              {option}
              {isSelected && (isCorrect
                ? <CheckCircle2 className={`text-emerald-300 ${reducedMotion ? '' : 'animate-pulse'}`} aria-hidden="true" />
                : <XCircle className={`text-rose-300 ${reducedMotion ? '' : 'animate-pulse'}`} aria-hidden="true" />)}
            </button>
          );
        })}
      </div>
      <p className="mt-3 min-h-6 text-center text-sm font-semibold" aria-live="polite">
        {!answered
          ? `Score at least ${REWARD_THRESHOLD}/${QUESTIONS.length} to unlock a free cold brew.`
          : selected === question.answer
            ? 'Correct!'
            : `Not quite — the answer is ${question.answer}.`}
      </p>
      {answered && (
        <button
          type="button"
          onClick={next}
          className="mx-auto mt-2 flex min-h-11 items-center justify-center rounded-full bg-white px-6 font-black text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          {questionIndex < QUESTIONS.length - 1 ? 'Next question' : 'See results'}
        </button>
      )}
    </div>
  );
}

export default function Template06TriviaRewardUnlock() {
  return (
    <BatchTemplateFrame templateId={ID} title="Trivia Reward Unlock" subtitle="Answer 3 brand questions to unlock a reward">
      {({ reducedMotion }) => <TriviaQuiz reducedMotion={reducedMotion} />}
    </BatchTemplateFrame>
  );
}
