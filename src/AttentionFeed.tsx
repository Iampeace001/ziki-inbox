import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, CircleAlert, MessageSquare, ShieldCheck, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import ProposalContent from './ProposalContent';
import type { Decision } from './data';
import './attention-feed.css';

type Vote = 1 | -1;
type Review = { name: string; role: string; vote: Vote; comment: string };
type VoteFilter = 'all' | 'up' | 'down';
type Props = { tasks: Decision[]; onDecide: (task: Decision, action: string) => void; onRequestChanges: (task: Decision) => void };

const agents = { Product: 'Ember', Marketing: 'Quill', Security: 'Rook' };
const sampleComments: Record<number, string[]> = {
  2: ['Restoring this menu would unblock access to DM options.', 'Check whether the bug affects every direct message first.', 'We need a desktop reproduction before choosing a fix.', 'Include keyboard access in the acceptance criteria.'],
  107: ['Keeping the sign-up button visible makes the form easier to use.', 'Reduced spacing must still allow comfortable touch targets.', 'Check smaller windows before settling on the layout.', 'Keep the introduction if it helps first-time visitors.'],
  148: ['The broken footer link is a clear, bounded issue.', 'Confirm the correct destination before editing the link.', 'Check whether the destination is temporarily unavailable.', 'Verify the replacement page belongs to the project.'],
  204: ['One clear call to action makes the email easier to scan.', 'The main benefit could be more specific.', 'Check the tone against the brand voice.', 'Review the destination behind the call to action.'],
  205: ['A warning gives people a chance to save their work.', 'Explain whether unsaved changes will be preserved.', 'The warning should be accessible to keyboard users.', 'Show a countdown so people know how much time is left.'],
};
function reviewsFor(task: Decision): Review[] {
  const messages = sampleComments[task.id] ?? [task.summary];
  return messages.map((comment, index) => ({ name: ['Ember', 'Rook', 'Quill', 'Nova'][index] ?? 'Reviewer', role: ['Product review', 'Independent review', 'Design review', 'Quality review'][index] ?? 'Review', vote: index === 0 ? 1 : -1, comment }));
}
function readVotes(): Record<number, Vote> {
  try {
    const data: unknown = JSON.parse(localStorage.getItem('ziki-demo-votes') ?? '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(Object.entries(data).filter(([id, vote]) => /^\d+$/.test(id) && (vote === 1 || vote === -1)));
  } catch { return {}; }
}

export default function AttentionFeed({ tasks, onDecide, onRequestChanges }: Props) {
  const [selected, setSelected] = useState<Decision | null>(null);
  const [filter, setFilter] = useState<VoteFilter>('all');
  const [votes, setVotes] = useState<Record<number, Vote>>(readVotes);
  const context = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => { if (selected && !context.current?.open) context.current?.showModal(); }, [selected]);
  useEffect(() => { try { localStorage.setItem('ziki-demo-votes', JSON.stringify(votes)); } catch { /* Voting still works for this visit. */ } }, [votes]);
  function openContext(task: Decision, nextFilter: VoteFilter = 'all') { returnFocus.current = document.activeElement as HTMLElement; setFilter(nextFilter); setSelected(task); }
  function closeContext() { context.current?.close(); setSelected(null); returnFocus.current?.focus(); }
  function decide(task: Decision, action: string) { if (selected) closeContext(); onDecide(task, action); }
  function requestChanges(task: Decision) { closeContext(); onRequestChanges(task); }
  function vote(task: Decision, value: Vote) { setVotes(previous => { const next = { ...previous }; if (next[task.id] === value) delete next[task.id]; else next[task.id] = value; return next; }); }
  function counts(task: Decision) { const reviews = reviewsFor(task); return { up: reviews.filter(item => item.vote === 1).length + (votes[task.id] === 1 ? 1 : 0), down: reviews.filter(item => item.vote === -1).length + (votes[task.id] === -1 ? 1 : 0) }; }
  const selectedCounts = selected ? counts(selected) : { up: 0, down: 0 };
  const allReviews = selected ? [...reviewsFor(selected), ...(votes[selected.id] ? [{ name: 'You', role: 'Your vote', vote: votes[selected.id], comment: votes[selected.id] === 1 ? 'You support this proposal.' : 'You have concerns about this proposal.' }] : [])] : [];
  const visibleReviews = allReviews.filter(item => filter === 'all' || item.vote === (filter === 'up' ? 1 : -1));

  return <>
    <div className="attention-feed">
      <div className="feed-intro"><span><MessageSquare size={16}/> Decisions from your agents</span><span>Illustrative agent feedback</span></div>
      {tasks.map(task => {
        return <article className="attention-row" key={task.id}>
          <CircleAlert className="feed-attention-icon" size={21} aria-hidden="true"/>
          <div className="attention-row-content">
            <div className="feed-task-category">{task.section} <span>·</span> #{task.id}</div>
            <h3><span>Needs you.</span> {task.title}</h3>
            <p className="feed-task-summary">{task.summary}</p>
            <button className="read-context" type="button" onClick={() => openContext(task)}><MessageSquare size={15} aria-hidden="true"/>Read context <ChevronDown size={15} aria-hidden="true"/></button>
            <div className="feed-row-footer">
              <div className="feed-author"><span className={`agent-initials ${task.section.toLowerCase()}`}>{agents[task.section].slice(0,2).toUpperCase()}</span><span>{agents[task.section]}</span><span className="feed-author-role">{task.section} agent</span></div>
              <div className="feed-decision-actions"><button type="button" className="feed-approve" onClick={() => decide(task, task.primary)}><Check size={16}/>{task.primary}</button><button type="button" className="feed-reject" onClick={() => decide(task, 'Rejected')}><X size={16}/>Reject</button></div>
            </div>
          </div>
        </article>;
      })}
    </div>
    <dialog className="context-dialog" ref={context} aria-labelledby="context-title" onCancel={event => { event.preventDefault(); closeContext(); }} onClick={event => { if (event.target === event.currentTarget) closeContext(); }}>
      {selected && <>
        <header className="context-header"><div className="context-eyebrow"><CircleAlert size={16}/>{selected.section} · #{selected.id}<span>Needs your decision</span></div><button type="button" className="context-close" aria-label="Close context" onClick={closeContext}><X size={20}/></button><h2 id="context-title">{selected.title}</h2><p>Logged by <strong>{agents[selected.section]}</strong> · {selected.section} agent</p></header>
        <div className="context-scroll">
          <div className="context-summary"><p>{selected.summary}</p><span><CircleAlert size={15}/>{selected.request}</span></div>
          <details className="context-proposal"><summary>Proposal details <ChevronDown size={15}/></summary>
            {selected.proposal ? <ProposalContent proposal={selected.proposal}/> : selected.kind === 'design' ? <div className="context-design"><div><span>Before</span><p>The sign-up button falls below the default window.</p></div><ArrowRight size={18}/><div><span>Proposed</span><p>Reduce field spacing and shorten the introduction. Keep every field.</p></div><small>Design preview only.</small></div> : <div className="context-design"><p>Correct the footer’s Facebook destination. {selected.estimate}. Scope: {selected.scope}.</p><small>Bid approval only. No fix has been verified.</small></div>}
          </details>
          <div className="context-vote-section"><div className="context-vote-summary"><div className="vote-summary-heading"><span>Review sentiment</span><span>{allReviews.length} votes</span></div><div className="vote-chart-layout"><div className="vote-donut" role="img" aria-label={`${selectedCounts.up} upvotes and ${selectedCounts.down} downvotes out of ${allReviews.length} votes`} style={{background: `conic-gradient(var(--feed-good) 0% ${selectedCounts.up / (allReviews.length || 1) * 100}%, var(--feed-bad) ${selectedCounts.up / (allReviews.length || 1) * 100}% 100%)`}}><div className="vote-donut-center"><strong>{allReviews.length}</strong><span>votes</span></div></div><div className="vote-chart-legend"><div className="vote-up"><ThumbsUp size={17}/><span>Upvotes</span><strong>{selectedCounts.up}</strong><small>{Math.round(selectedCounts.up / (allReviews.length || 1) * 100)}%</small></div><div className="vote-down"><ThumbsDown size={17}/><span>Downvotes</span><strong>{selectedCounts.down}</strong><small>{Math.round(selectedCounts.down / (allReviews.length || 1) * 100)}%</small></div></div></div></div><div className="review-disclaimer">Sample discussion · not live agent reviews</div><div className="context-vote-tools"><div className="vote-filter" role="group" aria-label="Filter vote feedback">{([{value:'all',label:'All votes',count:allReviews.length},{value:'up',label:'Upvotes',count:selectedCounts.up},{value:'down',label:'Downvotes',count:selectedCounts.down}] as const).map(item => <button type="button" key={item.value} aria-pressed={filter===item.value} onClick={() => setFilter(item.value)}>{item.label}<span>{item.count}</span></button>)}</div><div className="your-vote" role="group" aria-label="Your local vote"><button type="button" aria-label="Upvote proposal" aria-pressed={votes[selected.id]===1} onClick={() => vote(selected,1)}><ThumbsUp size={16}/></button><button type="button" aria-label="Downvote proposal" aria-pressed={votes[selected.id]===-1} onClick={() => vote(selected,-1)}><ThumbsDown size={16}/></button></div></div></div>
          <div className="context-reviews" aria-live="polite">{visibleReviews.map((review,index) => <article className="context-review" key={`${review.name}-${index}`}><span className={`review-vote-icon ${review.vote===1?'vote-up':'vote-down'}`}>{review.vote===1?<ThumbsUp size={17}/>:<ThumbsDown size={17}/>}</span><div><div className="review-author"><strong>{review.name}</strong><span>{review.role}</span></div><p>{review.comment}</p></div></article>)}{!visibleReviews.length && <p className="no-reviews">No votes in this view.</p>}</div>
        </div>
        <footer className="context-footer"><span><ShieldCheck size={15}/>Your decision · demo only</span><div><button type="button" className="context-request" onClick={() => requestChanges(selected)}>Request changes</button><button type="button" className="context-reject" onClick={() => decide(selected,'Rejected')}><X size={17}/>Reject</button><button type="button" className="context-approve" onClick={() => decide(selected,selected.primary)}><Check size={17}/>{selected.primary}</button></div></footer>
      </>}
    </dialog>
  </>;
}
