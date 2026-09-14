'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Volume2, VolumeX, X } from 'lucide-react';
import { assetRoot, email, projects, showreelId, socialLinks, type Project } from './data';
import { LottieArtwork } from './LottieArtwork';
import { SpiralGallery } from './SpiralGallery';
import { MediaPlayer } from './MediaPlayer';

interface Context { entered: boolean; menu: boolean; mode: 'spiral' | 'list'; setMode: (mode: 'spiral' | 'list') => void; sound: (name: string) => void; setMediaPlaying: (playing: boolean) => void; }
const PortfolioContext = createContext<Context>({ entered: false, menu: false, mode: 'spiral', setMode: () => {}, sound: () => {}, setMediaPlaying: () => {} });
export function usePortfolioAudio() { return useContext(PortfolioContext); }

export function PortfolioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(pathname !== '/');
  const [leaving, setLeaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [showreel, setShowreel] = useState(false);
  const [mediaPlaying, setMediaPlaying] = useState(false);
  const [mode, setMode] = useState<'spiral' | 'list'>('spiral');
  const [face, setFace] = useState(1);
  const sounds = useRef<Record<string, HTMLAudioElement>>({});
  const soundEnabled = useRef(false);
  const menuPanel = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const showreelDialog = useRef<HTMLDivElement>(null);
  const sound = useCallback((name: string) => {
    if (!soundEnabled.current) return;
    let audio = sounds.current[name];
    if (!audio) { audio = new Audio(`${assetRoot}/${name}.ogg`); audio.volume = name === 'ambient' ? .3 : .45; sounds.current[name] = audio; }
    audio.currentTime = 0; audio.play().catch(() => {});
  }, []);
  const changeSound = (next: boolean) => {
    soundEnabled.current = next; setEnabled(next);
    Object.values(sounds.current).forEach(audio => { audio.muted = !next; });
    if (!next) Object.values(sounds.current).forEach(audio => audio.pause());
    else {
      if (!sounds.current.ambient) { sounds.current.ambient = new Audio(`${assetRoot}/ambient.ogg`); sounds.current.ambient.loop = true; sounds.current.ambient.volume = .3; }
      if (!mediaPlaying && !showreel) sounds.current.ambient.play().catch(() => {});
    }
  };
  useEffect(() => {
    const ambient = sounds.current.ambient;
    if (!ambient) return;
    if (mediaPlaying || showreel || !enabled) ambient.pause();
    else ambient.play().catch(() => {});
  }, [mediaPlaying, showreel, enabled]);
  const enter = (withSound: boolean) => {
    changeSound(withSound); setEntered(true); setLeaving(true);
  };
  const toggleMenu = () => { sound(menu ? 'close' : 'click'); setMenu(!menu); };
  useEffect(() => {
    const audios = sounds.current;
    const visibility = () => { Object.values(audios).forEach(audio => { audio.muted = document.hidden || !soundEnabled.current; }); };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); Object.values(audios).forEach(audio => audio.pause()); };
  }, []);
  useEffect(() => {
    if (!menu && !showreel && entered) return;
    const prior = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false); setShowreel(false);
      }
      if (event.key !== 'Tab' || (!menu && !showreel)) return;
      const selector = 'a[href],button:not(:disabled),input:not(:disabled),[tabindex="0"]';
      const panel = showreel ? showreelDialog.current : menuPanel.current;
      const items = Array.from(panel?.querySelectorAll<HTMLElement>(selector) ?? []);
      if (menu && menuButton.current) items.unshift(menuButton.current);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !items.includes(document.activeElement as HTMLElement);
      if (outside || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', handle);
    if (menu) menuPanel.current?.querySelector('a')?.focus();
    if (showreel) showreelDialog.current?.querySelector<HTMLElement>('.media-player')?.focus();
    return () => {
      document.body.style.overflow = prior;
      window.removeEventListener('keydown', handle);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [menu, showreel, entered]);
  return <PortfolioContext.Provider value={{ entered, menu: menu || showreel, mode, setMode, sound, setMediaPlaying }}>
    <div className="portfolio-site">
      <div className="site-grid" aria-hidden="true" />
      <div className="site-grain" aria-hidden="true" />
      <header inert={!entered || showreel} className={`portfolio-header ${!entered ? 'before-entry' : ''}`}>
        <Link href="/" className="face-logo" aria-label="Pacôme Pertant home" onClick={() => { setMenu(false); setFace(face % 5 + 1); sound('click'); }}>
          <LottieArtwork name={`face${face}`} />
          <span className="logo-tag">Pacôme<br />Pertant ✲</span>
        </Link>
        {pathname === '/' && <nav className="mode-switch" inert={menu} aria-label="Gallery view">
          <button className={mode === 'spiral' ? 'selected' : ''} aria-pressed={mode === 'spiral'} onClick={() => { setMode('spiral'); sound('spiral'); window.scrollTo({ top: 0, behavior: 'instant' }); }}>spiral</button>
          <span className="switch-dot" />
          <button className={mode === 'list' ? 'selected' : ''} aria-pressed={mode === 'list'} onClick={() => { setMode('list'); sound('list'); }}>list</button>
        </nav>}
        <button ref={menuButton} className={`menu-toggle ${menu ? 'opened' : ''}`} aria-expanded={menu} aria-controls="portfolio-menu" onClick={toggleMenu}>{menu ? <><X size={13} /> close</> : <>menu<span className="menu-dot" /></>}</button>
      </header>
      {menu && <button aria-label="Close menu backdrop" className="menu-backdrop" onClick={toggleMenu} />}
      <aside ref={menuPanel} id="portfolio-menu" className={`menu-panel ${menu ? 'opened' : ''}`} inert={!menu} aria-label="Main menu">
        <nav className="menu-links"><Link href="/" onClick={() => { setMenu(false); sound('click'); }}>works</Link><Link href="/about" onClick={() => { setMenu(false); sound('click'); }}>about</Link><a href={`mailto:${email}`} onClick={() => setMenu(false)}>contact</a></nav>
        <div className="menu-footer"><a href={`mailto:${email}`}>{email}</a><div className="social-icons">{socialLinks.map((social, i) => <a key={social.label} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}>{<img src={`${assetRoot}/${['instagram', 'twitter', 'behance', 'linkedin'][i]}.svg`} alt="" width={18} height={18} />}</a>)}</div></div>
      </aside>
      <div inert={!entered || menu || showreel}>{children}</div>
      {entered && <>
        <button className="showreel-teaser" inert={menu || showreel} aria-label="Play showreel 2025" onClick={() => { sound('click'); setShowreel(true); sounds.current.ambient?.pause(); }}>
          <img src={`${assetRoot}/reel-thumbnail.png`} alt="Showreel 2025" />
          <div className="reel-type" aria-hidden="true">{'showreel • 2025 • showreel • 2025 • showreel • 2025 • showreel • 2025 • showreel • 2025 '.split('').map((letter, index) => <span key={index} style={{ animationDelay: `${index * .12 - 12}s` }}>{letter}</span>)}</div>
        </button>
        <button className="sound-toggle" inert={menu || showreel} aria-label={enabled ? 'Turn sound off' : 'Turn sound on'} aria-pressed={enabled} onClick={() => changeSound(!enabled)}>{enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
      </>}
      {(!entered || leaving) && <section className={`entry-gate ${leaving ? 'leaving' : ''}`} aria-label="Welcome to Pacôme Pertant" onAnimationEnd={event => { if (event.target === event.currentTarget && leaving) setLeaving(false); }}>
        <div className="entry-content"><LottieArtwork name="loader" className="entry-art" /><p>motion &amp; sound designer based in paris</p><button className="entry-button" onClick={() => enter(true)}>enter with sound<span /></button></div>
        <button className="without-sound" onClick={() => enter(false)}>enter without sound</button>
      </section>}
      {showreel && <div ref={showreelDialog} className="showreel-modal" role="dialog" aria-modal="true" aria-label="Showreel 2025"><MediaPlayer playbackId={showreelId} poster={`${assetRoot}/reel-thumbnail.png`} title="Showreel 2025" onPlayingChange={setMediaPlaying} autoPlay onClose={() => { setShowreel(false); setMediaPlaying(false); }} /></div>}
    </div>
  </PortfolioContext.Provider>;
}

export function PortfolioHome() {
  const { entered, menu, mode, sound } = useContext(PortfolioContext);
  const [hovered, setHovered] = useState<Project | null>(null);
  return <main className={`portfolio-home mode-${mode}`}>
    <h1 className="sr-only">Pacôme Pertant — Motion &amp; Sound Designer</h1>
    <SpiralGallery active={entered && !menu && mode === 'spiral'} onHover={setHovered} onSound={sound} />
    {mode === 'list' && <ProjectList hidden={menu} onSound={sound} />}
    {mode === 'spiral' && hovered && !menu && <div className="hover-caption"><img src={hovered.thumbnail} alt="" /><span>{hovered.title}</span><ArrowUpRight size={16} /></div>}
  </main>;
}

function ProjectList({ hidden, onSound }: { hidden: boolean; onSound: (name: string) => void }) {
  const preview = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const serial = useRef(0);
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState<{ project: Project; id: number }[]>([]);

  useEffect(() => {
    let frame = 0;
    const position = { x: 0, y: 0, scale: .5 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const move = (event: PointerEvent) => { target.current = { x: event.clientX, y: event.clientY }; };
    const tick = () => {
      const follow = reduced.matches ? 1 : .1;
      position.x += (target.current.x - position.x) * follow;
      position.y += (target.current.y - position.y) * follow;
      position.scale += ((active.current ? 1 : .5) - position.scale) * (reduced.matches ? 1 : .07);
      if (preview.current) preview.current.style.transform = `translate3d(${position.x}px,${position.y}px,0) translate(-25%,-75%) scale(${position.scale})`;
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(frame); };
  }, []);

  const leave = () => { active.current = false; setVisible(false); };
  const enter = (project: Project, x: number, y: number) => {
    target.current = { x, y };
    active.current = true;
    setVisible(true);
    const id = ++serial.current;
    setImages(previous => [...previous.slice(-4), { project, id }]);
    onSound('hover');
  };
  return <div className="project-list" onPointerLeave={leave}>
    <div ref={preview} className={`list-preview ${visible && !hidden ? 'visible' : ''}`} aria-hidden="true">
      {images.map(({ project, id }) => <img key={id} src={project.thumbnail} alt="" />)}
    </div>
    {projects.map(project => <Link key={project.slug} href={`/projects/${project.slug}`}
      onPointerEnter={event => { if (event.pointerType === 'mouse') enter(project, event.clientX, event.clientY); }}
      onPointerLeave={leave}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) { const rect = event.currentTarget.getBoundingClientRect(); enter(project, rect.right, rect.top + rect.height / 2); } }}
      onBlur={leave} onClick={() => onSound('longclick')}>{project.title}</Link>)}
  </div>;
}
