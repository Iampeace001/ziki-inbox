import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, CheckCheck, ChevronDown, ChevronRight, CircleCheck, CircleDot, Clock3, ExternalLink, LayoutGrid, LoaderCircle, MessageSquare, Moon, RotateCcw, ShieldCheck, Sparkles, Sun, X, Zap } from 'lucide-react';

type Decision = { id: number; kind: 'design' | 'authorization'; title: string; summary: string; request: string; primary: string; secondary: string; estimate?: string };
type DecisionRecord = { id: number; action: string; feedback?: string };
type Outcome = { id: number; title: string; summary: string; category: string; time: string; type: 'cta' | 'calculator' };
const decisions: Decision[] = [
  { id: 107, kind: 'design', title: 'A sign-up form that fits the window', summary: 'A more compact layout keeps every field and the sign-up button visible. No scrolling needed.', request: 'Approve the proposed layout before implementation.', primary: 'Approve layout', secondary: 'Request changes' },
  { id: 148, kind: 'authorization', title: 'Fix the broken Facebook link', summary: 'The footer sends visitors to an unavailable page. Your agent is ready to propose a correction.', request: 'Allow your agent to submit a bid for this fix.', primary: 'Allow bid', secondary: 'Skip issue', estimate: '15 min estimated' },
];
const outcomes: Outcome[] = [
  { id: 199, title: 'The CTA arrow is on the right side', summary: '“Get started for free” now has the arrow in its intended position.', category: 'UI improvement', time: 'Example outcome', type: 'cta' },
  { id: 203, title: 'Pricing comparisons, made easier', summary: 'An interactive calculator helps visitors compare Slack and Zedu pricing.', category: 'New feature', time: 'Example outcome', type: 'calculator' },
];
const storageKey = 'ziki-demo-decisions-v1';
const feedbackSuggestions = [
  'Keep the introduction. Reduce the spacing between fields instead.',
  'Keep buttons and fields large enough to tap comfortably.',
  'Show an alternative layout before I approve the design.',
];
function readSaved(): DecisionRecord[] {
  try { const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); return Array.isArray(saved) ? saved.filter((item): item is DecisionRecord => typeof item === 'object' && item !== null && 'id' in item && typeof item.id === 'number' && 'action' in item && typeof item.action === 'string') : []; } catch { return []; }
}

function Brand() { return <a className="brand" href="#" aria-label="Ziki home"><Zap fill="currentColor" strokeWidth={1.5} size={29}/><span>ziki</span></a>; }

function OutcomePreview({ type }: { type: Outcome['type'] }) {
  return type === 'cta' ? <div className="cta-preview"><span className="preview-caption">Corrected placement</span><span className="sample-cta">Get started for free <ArrowRight size={17}/></span></div> : <div className="calculator-preview"><div><span className="mini-logo">S</span><span>Slack</span><div className="mini-bars"><span/><span/><span/></div></div><div><span className="mini-logo zedu">Z</span><span>Zedu</span><div className="mini-bars blue"><span/><span/></div></div><span className="preview-caption">Interactive comparison</span></div>;
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const [records, setRecords] = useState<DecisionRecord[]>(readSaved);
  const [filter, setFilter] = useState<'overview' | 'decisions' | 'completed'>('overview');
  const [dialog, setDialog] = useState<Decision | null>(null);
  const [toast, setToast] = useState('');
  const [feedback, setFeedback] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTrigger = useRef<HTMLElement | null>(null);
  const pending = decisions.filter(decision => !records.some(record => record.id === decision.id));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#080f20' : '#f4f7fc');
    try { localStorage.setItem('ziki-theme', theme); } catch { /* Keep the switch working without storage. */ }
  }, [theme]);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(records)); } catch { /* The preview still works when storage is unavailable. */ } }, [records]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 6500); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { if (dialog && !dialogRef.current?.open) dialogRef.current?.showModal(); }, [dialog]);
  function closeDialog() { dialogRef.current?.close(); setDialog(null); setFeedback(''); dialogTrigger.current?.focus(); }
  function record(decision: Decision, action: string, message?: string) {
    setRecords(previous => [...previous.filter(item => item.id !== decision.id), { id: decision.id, action, ...(message ? { feedback: message } : {}) }]);
    setToast(`${action} for #${decision.id}. Saved in this demo only.`);
    if (dialog) closeDialog();
  }
  function openFeedback(decision: Decision) { dialogTrigger.current = document.activeElement as HTMLElement; setDialog(decision); }
  function submitFeedback(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (dialog && feedback.trim()) record(dialog, 'Changes requested', feedback.trim()); }
  const showDecisions = filter !== 'completed';
  const showCompleted = filter !== 'decisions';

  return <div className="app">
    <header className="topbar"><div className="topbar-inner"><Brand/><span className="nav-divider"/><span className="workspace">Zedu <ChevronDown size={14}/></span><nav className="main-nav" aria-label="Workspace"><span className="active"><CircleDot size={16}/> Product</span><span><ShieldCheck size={16}/> Workspace</span></nav><div className="account"><button type="button" className="theme-toggle" onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button><span className="avatar" aria-label="Abdulmuiz">AA</span></div></div></header>
    <main>
      <div className="breadcrumbs"><span>Product</span><ChevronRight size={13}/><span>Inbox</span></div>
      <div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> YOUR AGENTS, AT A GLANCE</div><h1>Results &amp; decisions<span className="heading-dot">.</span></h1><p>{pending.length > 0 ? 'Your agents did the work. Here’s what needs you.' : 'You’re all caught up. Your agents will take it from here.'}</p></div><span className="demo-badge"><span/> Interactive demo</span></div>
      <div className="summary-strip" aria-label="Work summary"><div><span className="summary-icon needs"><CircleDot size={18}/></span><strong>{pending.length}</strong><span>need your decision</span></div><div><span className="summary-icon done"><CheckCheck size={19}/></span><strong>2</strong><span>completed outcomes</span></div><div><span className="summary-icon working"><LoaderCircle size={18}/></span><strong>1</strong><span>continuing automatically</span></div></div>
      <div className="view-bar"><div className="view-tabs" aria-label="View results">{([{ id: 'overview', label: 'Overview', icon: LayoutGrid }, { id: 'decisions', label: 'Needs you', icon: CircleDot }, { id: 'completed', label: 'Completed', icon: CheckCheck }] as const).map(({ id, label, icon: Icon }) => <button key={id} className={filter === id ? 'selected' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}><Icon size={15}/>{label}{id === 'decisions' && <span className="tab-count">{pending.length}</span>}</button>)}</div><span className="view-note">Only the things that matter</span></div>
      {showDecisions && <section className="decision-section" aria-labelledby="decisions-heading"><div className="section-heading"><div><h2 id="decisions-heading">A little input. A lot moves forward.</h2><p>Your decisions unblock the next step.</p></div><span className="section-count">{pending.length} {pending.length === 1 ? 'decision' : 'decisions'}</span></div>
        {pending.length ? <div className="decision-grid">{pending.map(decision => <article className="decision-card" key={decision.id}><div className="card-top"><span className={`type-label ${decision.kind}`}><span className="type-icon">{decision.kind === 'design' ? <LayoutGrid size={14}/> : <ShieldCheck size={14}/>}</span>{decision.kind === 'design' ? 'Design approval' : 'Work authorization'}</span><span className="issue-number">#{decision.id}</span></div><h3>{decision.title}</h3><p className="decision-summary">{decision.summary}</p>{decision.kind === 'design' ? <details className="comparison"><summary>See proposed change <ChevronDown size={14}/></summary><div className="comparison-content"><div><span>Before</span><div className="form-mini before"><i/><i/><i/><span>Sign up ↓ below window</span></div></div><ArrowRight size={15}/><div><span>Proposed</span><div className="form-mini after"><i/><i/><i/><span>Sign up <Check size={11}/></span></div></div><p>Reduce field spacing and shorten the introduction. All fields stay. This is an illustrative proposal.</p></div></details> : <div className="estimate"><Clock3 size={14}/>{decision.estimate}<span>·</span><span>Scope: footer link only</span></div>}<div className="your-call"><span>Your call</span><p>{decision.request}</p></div><div className="card-actions"><button className="button primary" onClick={() => record(decision, decision.kind === 'design' ? 'Layout approved' : 'Bid authorized')}><Check size={16}/>{decision.primary}</button><button className="button secondary" onClick={() => decision.kind === 'design' ? openFeedback(decision) : record(decision, 'Issue skipped')}>{decision.secondary}{decision.kind === 'design' && <MessageSquare size={14}/>}</button></div></article>)}</div> : <div className="caught-up"><span><CheckCheck size={28}/></span><h3>Nothing waiting on you.</h3><p>All decisions have been handled. We’ll surface the next one here.</p><button className="button secondary" onClick={() => setFilter('completed')}>See completed outcomes <ArrowRight size={15}/></button></div>}
      </section>}
      {showCompleted && <section className="outcomes-section" aria-labelledby="outcomes-heading"><div className="section-heading"><div><h2 id="outcomes-heading">Done. And ready for you.</h2><p>The outcome up front. The evidence, if you want it.</p></div><span className="no-action"><CircleCheck size={14}/> No action needed</span></div><div className="outcomes-list">{outcomes.map(outcome => <article className="outcome" key={outcome.id}><div className="outcome-content"><div className="outcome-meta"><span><CircleCheck size={13}/> Resolved</span><span className="meta-dot">·</span><span>{outcome.category}</span><span className="issue-number">#{outcome.id}</span></div><h3>{outcome.title}</h3><p>{outcome.summary}</p><details className="evidence"><summary>View outcome details <ArrowRight size={13}/></summary><div className="evidence-content"><strong>What this preview shows</strong><p>{outcome.type === 'cta' ? 'The arrow follows the button label in the proposed result.' : 'A compact visual representation of the pricing comparison feature.'}</p><p>The supplied screenshot lists this issue as resolved. Production screenshots, test results, and a linked fix were not provided.</p><a href={`https://ziki.dev/issues/${outcome.id}`} target="_blank" rel="noreferrer">Open original issue <ExternalLink size={12}/></a></div></details></div><OutcomePreview type={outcome.type}/></article>)}</div></section>}
      <aside className="background-work"><span className="background-icon"><Sparkles size={18}/></span><div><strong>Still moving, without you lifting a finger.</strong><p>1 issue continuing automatically. We’ll bring it here when there’s a result or a decision.</p></div><span className="working-label"><span className="live-dot"/> In progress</span></aside>
      <footer className="page-footer"><span>Demo content based on your Ziki screenshots. No live agents or API connection.</span><button onClick={() => { setRecords([]); setFilter('overview'); setToast('Demo reset. Both decisions are available again.'); }}><RotateCcw size={12}/>Reset demo</button></footer>
    </main>
    {toast && <div className="toast" role="status"><CircleCheck size={18}/><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16}/></button></div>}
    <dialog ref={dialogRef} className="feedback-dialog" onCancel={event => { event.preventDefault(); closeDialog(); }} onClick={event => { if (event.target === event.currentTarget) closeDialog(); }} aria-labelledby="feedback-title">
      <form onSubmit={submitFeedback}>
        <div className="dialog-heading"><span className="type-label"><MessageSquare size={16}/> Design feedback</span><button type="button" className="icon-button" aria-label="Close feedback" onClick={closeDialog}><X size={19}/></button></div>
        <h2 id="feedback-title">What would you change?</h2>
        <p>Choose a suggestion or write your own for issue #{dialog?.id}.</p>
        <div className="suggestions-heading"><Sparkles size={15}/><span>Quick suggestions</span></div>
        <p className="suggestions-hint">Click a suggestion to send it immediately.</p>
        <div className="feedback-suggestions" aria-label="Send a suggested change">
          {feedbackSuggestions.map(suggestion => <button type="button" key={suggestion} className="suggestion-button" aria-label={`Send suggestion: ${suggestion}`} onClick={() => { if (dialog) record(dialog, 'Changes requested', suggestion); }}><span>{suggestion}</span><ArrowRight size={17}/></button>)}
        </div>
        <details className="custom-feedback" key={dialog?.id ?? 'closed'}>
          <summary><MessageSquare size={15}/> Customise message <ChevronDown size={15}/></summary>
          <div className="custom-feedback-content">
            <label htmlFor="feedback">Your message</label>
            <textarea id="feedback" value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="Tell your agent what you’d like to change…" required maxLength={2000}/>
            <div className="custom-send"><button className="button primary" type="submit" disabled={!feedback.trim()}>Send custom message <ArrowDown size={14}/></button></div>
          </div>
        </details>
        <span className="input-note">Saved locally in this demo. Nothing is sent to Ziki.</span>
        <div className="dialog-actions"><button type="button" className="button secondary" onClick={closeDialog}><ArrowLeft size={14}/>Cancel</button></div>
      </form>
    </dialog>
  </div>;
}
