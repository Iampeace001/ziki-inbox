import { ShieldCheck, ExternalLink } from 'lucide-react';
import type { Proposal } from './data';

export default function ProposalContent({ proposal }: { proposal: Proposal }) {
  return <div className="proposal-content">
    <div className="proposal-copy"><span className="proposal-label">{proposal.label}</span><h4>{proposal.headline}</h4><span className="proposal-label">Message</span><p>{proposal.body}</p></div>
    <div className="proposal-actions-preview"><span className="proposal-label">{proposal.actions.length === 1 ? 'Call to action' : 'Available actions'}</span><div>{proposal.actions.map(action => <span className="proposal-action-label" key={action}>{action}</span>)}</div></div>
    <p className="proposal-note"><ShieldCheck size={14} aria-hidden="true"/>{proposal.note}</p>
    {proposal.sourceUrl && <a className="proposal-source" href={proposal.sourceUrl} target="_blank" rel="noreferrer">Open original issue <ExternalLink size={14}/></a>}
  </div>;
}

