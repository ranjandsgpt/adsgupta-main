import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { MorphContainer } from '../primitives/MorphContainer';
import { Batch05Shell, MorphOverlay, buttonClass, trackClick, useMorph } from './Batch05Shell';

const ID = 'banner-chat-morph';

export default function Template64BannerChatMorph() {
  const { expanded, setMorph } = useMorph(ID);
  const [messages, setMessages] = useState([{ from: 'brand', text: 'Hi—what are you shopping for today?' }]);
  const [draft, setDraft] = useState('');
  const send = (text) => {
    const value = text.trim();
    if (!value) return;
    setMessages((items) => [...items, { from: 'you', text: value }, { from: 'brand', text: 'Great choice. Here are three curated options for you.' }]);
    setDraft('');
    trackClick(ID, 'send-message');
  };

  return (
    <>
      <Batch05Shell templateId={ID} title="Banner to Chat Morph" className="mx-auto max-w-2xl" onClosed={() => { if (expanded) setMorph(false, 'dismiss'); }}>
        <MorphContainer className="bg-gradient-to-r from-indigo-950 to-cyan-950 p-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Concierge</p>
              <h3 className="text-xl font-black">Need a recommendation?</h3>
            </div>
            <button type="button" className={`${buttonClass} flex items-center gap-2 bg-cyan-300 text-slate-950`} onClick={() => setMorph(true, 'open-chat')}>
              <MessageCircle size={18} /> Chat now
            </button>
          </div>
        </MorphContainer>
      </Batch05Shell>

      {expanded && (
        <MorphOverlay label="Sponsored chat" onClose={() => setMorph(false, 'collapse-chat')} className="bg-gradient-to-b from-indigo-950 to-cyan-950 text-white">
          <div className="relative z-10 flex h-full flex-col p-4 pt-14">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-300">Sponsored</p>
              <h3 className="font-bold">Product concierge</h3>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl bg-black/25 p-3" aria-live="polite">
              {messages.map((message, index) => (
                <p key={`${message.from}-${index}`} className={`w-fit max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.from === 'you' ? 'ml-auto bg-cyan-300 text-slate-950' : 'bg-white/10'}`}>
                  {message.text}
                </p>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Running shoes', 'Weekend bag'].map((chip) => (
                <button key={chip} type="button" className={`${buttonClass} bg-white/10 text-sm text-white hover:bg-white/20`} onClick={() => send(chip)}>{chip}</button>
              ))}
            </div>
            <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
              <label htmlFor="chat-draft" className="sr-only">Message</label>
              <input
                id="chat-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-h-11 min-w-0 flex-1 rounded-xl bg-white px-3 text-slate-950 outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="Ask a question"
              />
              <button type="submit" aria-label="Send message" className={`${buttonClass} bg-cyan-300 text-slate-950`}><Send size={18} /></button>
            </form>
          </div>
        </MorphOverlay>
      )}
    </>
  );
}
