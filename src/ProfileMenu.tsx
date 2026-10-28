import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ArrowRight, ChevronDown, CircleCheck, ExternalLink, X } from 'lucide-react';
import type { ThemeMode } from './useTheme';

type Panel = 'Profile' | 'Activity & Approvals' | 'Escalations' | 'Settings' | 'Report issue';
type Props = {
  mode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  onNotify: (message: string) => void;
  onSignOut: () => void;
  records: { id: number; action: string; feedback?: string }[];
};

export default function ProfileMenu({ mode, onSelectTheme, onNotify, onSignOut, records }: Props) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [report, setReport] = useState('');
  const [photo, setPhoto] = useState(() => {
    try { const saved = localStorage.getItem('ziki-profile-photo') ?? ''; return /^data:image\/(png|jpeg|webp);base64,/.test(saved) ? saved : ''; } catch { return ''; }
  });
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) { if (!container.current?.contains(event.target as Node)) setOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  useEffect(() => { if (panel && !panelRef.current?.open) panelRef.current?.showModal(); }, [panel]);
  function closePanel() { panelRef.current?.close(); setPanel(null); trigger.current?.focus(); }
  function openPanel(value: Panel) { setOpen(false); setPanel(value); }
  function savePhoto(value: string) {
    setPhoto(value);
    try { if (value) localStorage.setItem('ziki-profile-photo', value); else localStorage.removeItem('ziki-profile-photo'); onNotify(value ? 'Profile photo updated in this browser.' : 'Profile photo removed.'); }
    catch { onNotify('Photo updated for this visit. Browser storage is full or unavailable.'); }
  }
  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { onNotify('Choose a JPG, PNG, or WebP photo under 2 MB.'); return; }
    const reader = new FileReader();
    reader.onerror = () => onNotify('Could not read this photo. Please choose another file.');
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const value = reader.result;
      const image = new Image();
      image.onload = () => savePhoto(value);
      image.onerror = () => onNotify('This image could not be opened. Please choose another photo.');
      image.src = value;
    };
    reader.readAsDataURL(file);
  }
  function saveReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report.trim()) return;
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('ziki-demo-reports') ?? '[]');
      const items = Array.isArray(saved) ? saved.slice(-19) : [];
      localStorage.setItem('ziki-demo-reports', JSON.stringify([...items, { message: report.trim(), createdAt: new Date().toISOString() }]));
      setReport(''); closePanel(); onNotify('Issue saved in this browser. Nothing was sent to Ziki.');
    } catch { onNotify('Could not save your report. Keep a copy and try again.'); }
  }
  const avatar = (alt = '') => <span className="profile-avatar">{photo ? <img src={photo} alt={alt}/> : 'AA'}</span>;
  const themeOptions = <div className="profile-theme-options" role="group" aria-label="Theme">{(['system', 'light', 'dark'] as const).map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => onSelectTheme(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>;

  return <div className="profile-menu" ref={container}>
    <button type="button" ref={trigger} className="profile-trigger" aria-label="Open Abdulmuiz’s profile" aria-expanded={open} aria-controls="profile-dropdown" onClick={() => setOpen(value => !value)}>
      {avatar('Abdulmuiz’s profile')}<span className="profile-trigger-name">Abdulmuiz Abdulsalam</span><ChevronDown size={15} aria-hidden="true"/>
    </button>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={choosePhoto} aria-label="Choose profile photo"/>
    {open && <section className="profile-dropdown reference-profile" id="profile-dropdown" aria-label="Your profile">
      <div className="profile-identity">{avatar()}<div><strong>Abdulmuiz Abdulsalam</strong><span className="member-badge">Member</span></div></div>
      <button className="profile-menu-link" type="button" onClick={() => openPanel('Profile')}>Profile</button>
      <div className="profile-theme"><span className="profile-theme-label">Theme</span>{themeOptions}</div>
      <hr/>
      <button className="profile-menu-link" type="button" onClick={() => openPanel('Activity & Approvals')}>Activity &amp; Approvals</button>
      <button className="profile-menu-link" type="button" onClick={() => openPanel('Escalations')}>Escalations</button>
      <button className="profile-menu-link" type="button" onClick={() => openPanel('Settings')}>Settings</button>
      <a className="profile-menu-link" href="https://ziki.dev/llms.txt" target="_blank" rel="noreferrer">Documentation <ExternalLink size={14}/></a>
      <button className="profile-menu-link" type="button" onClick={() => openPanel('Report issue')}>Report issue</button>
      <hr/>
      <button className="profile-menu-link profile-signout" type="button" onClick={() => { setOpen(false); onSignOut(); }}>Sign out</button>
    </section>}
    <dialog className="feedback-dialog profile-panel" ref={panelRef} aria-labelledby="profile-panel-title" onCancel={event => { event.preventDefault(); closePanel(); }} onClick={event => { if (event.target === event.currentTarget) closePanel(); }}>
      <div className="dialog-heading"><h2 id="profile-panel-title">{panel}</h2><button className="icon-button" type="button" aria-label="Close profile panel" onClick={closePanel}><X size={18}/></button></div>
      {(panel === 'Profile' || panel === 'Settings') && <><div className="profile-identity">{avatar()}<div><strong>Abdulmuiz Abdulsalam</strong><span className="member-badge">Member</span></div></div><div className="profile-panel-actions"><button className="button primary" type="button" onClick={() => fileInput.current?.click()}>{photo ? 'Change photo' : 'Add your photo'}<ArrowRight size={15}/></button>{photo && <button className="button secondary" type="button" onClick={() => savePhoto('')}>Remove photo</button>}</div><p className="input-note">JPG, PNG or WebP · Max 2 MB. Saved in this browser.</p>{panel === 'Settings' && <div className="profile-theme"><span className="profile-theme-label">Theme</span>{themeOptions}</div>}</>}
      {panel === 'Activity & Approvals' && <><p className="profile-panel-description">Your decisions in this demo.</p>{records.length ? <ul className="profile-activity">{records.map(item => <li key={item.id}><strong>#{item.id} · {item.action}</strong>{item.feedback && <p>{item.feedback}</p>}</li>)}</ul> : <div className="profile-empty"><CircleCheck size={25}/><p>No decisions recorded yet.</p></div>}</>}
      {panel === 'Escalations' && <div className="profile-empty"><CircleCheck size={27}/><h3>No escalations</h3><p>Nothing needs escalation in this demo.</p></div>}
      {panel === 'Report issue' && <form onSubmit={saveReport}><label htmlFor="report-message">What went wrong?</label><textarea id="report-message" value={report} onChange={event => setReport(event.target.value)} maxLength={2000} required placeholder="Describe the issue…"/><p className="input-note">This report is saved locally. Nothing is sent to Ziki.</p><div className="dialog-actions"><button className="button primary" disabled={!report.trim()} type="submit">Save report</button></div></form>}
    </dialog>
  </div>;
}
