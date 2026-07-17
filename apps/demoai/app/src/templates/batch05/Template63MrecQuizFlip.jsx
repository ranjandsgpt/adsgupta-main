import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, buttonClass, trackClick } from './Batch05Shell';

const ID = 'mrec-quiz-flip';

export default function Template63MrecQuizFlip() {
  const [answer, setAnswer] = useState(null);
  const choose = (value) => {
    setAnswer(value);
    trackClick(ID, 'answer', { answer: value });
  };

  return (
    <Batch05Shell templateId={ID} title="MREC to Quiz Flip" className="mx-auto max-w-md">
      <MorphContainer className="min-h-[300px] bg-gradient-to-br from-amber-300 to-orange-500 p-6 text-slate-950">
        {answer === null ? (
          <>
            <p className="text-xs font-black uppercase tracking-[.2em]">One-tap quiz</p>
            <h3 className="mt-4 text-3xl font-black">Which habit saves the most household energy?</h3>
            <div className="mt-6 grid gap-2">
              {['Cold-water washing', 'Shorter emails', 'Dark phone wallpaper'].map((option) => <button key={option} type="button" className={`${buttonClass} bg-white/80 text-left hover:bg-white`} onClick={() => choose(option)}>{option}</button>)}
            </div>
          </>
        ) : (
          <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white">{answer === 'Cold-water washing' ? <Check size={30} /> : '!'}</span>
            <h3 className="mt-4 text-3xl font-black">{answer === 'Cold-water washing' ? 'Correct.' : 'Good guess.'}</h3>
            <p className="mt-2">Cold cycles can significantly reduce the energy used to heat wash water.</p>
            <button type="button" className={`${buttonClass} mt-5 flex items-center gap-2 bg-slate-950 text-white`} onClick={() => setAnswer(null)}><RotateCcw size={18} /> Try again</button>
          </div>
        )}
      </MorphContainer>
    </Batch05Shell>
  );
}
