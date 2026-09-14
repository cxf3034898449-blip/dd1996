'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { projects, socialLinks } from './data';
const biography = 'I’m Pacome Pertant, motion and sound designer based in Paris. I move shapes and sound to create emotional content. Always playing with rhythm, sound and visual narrative on a 2D and/or 3D canvas. Clean at times, experimental at others.';
export function AboutPage() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => {
      if (!section.current) return;
      const bounds = section.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -bounds.top / (bounds.height - window.innerHeight)));
      const words = section.current.querySelectorAll<HTMLSpanElement>('.bio-word');
      words.forEach((word, index) => { word.style.opacity = String(.18 + .82 * Math.max(0, Math.min(1, progress * (words.length + 5) - index + 3))); });
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <main className="about-page">
    <section className="about-biography" ref={section}><div className="bio-sticky"><h1>{biography.split(' ').map((word, i) => <span key={i} className="bio-word">{word} </span>)}</h1></div></section>
    <div className="about-filmstrip" aria-label="Selected projects">{projects.map(project => <Link key={project.slug} href={`/projects/${project.slug}`}><img src={project.thumbnail} alt={project.title} /><span>view project ↗</span></Link>)}</div>
    <section className="about-socials"><div>{socialLinks.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}</div><p className="site-credits">design @louis_bcqt | development @colindmg</p></section>
  </main>;
}
