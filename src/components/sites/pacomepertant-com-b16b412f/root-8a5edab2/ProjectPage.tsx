'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { projects, type Project } from './data';
import { MediaPlayer } from './MediaPlayer';
import { usePortfolioAudio } from './Portfolio';

export function ProjectPage({ project }: { project: Project }) {
  const { setMediaPlaying } = usePortfolioAudio();
  const next = projects[(projects.findIndex(item => item.slug === project.slug) + 1) % projects.length];
  return <main className="project-detail">
    <Link className="back-to-works" href="/"><ArrowLeft size={16} /> all works</Link>
    <div className="project-heading"><h1>{project.title}</h1><span>{project.year}</span></div>
    <MediaPlayer key={project.slug} playbackId={project.playbackId} title={project.title} poster={project.thumbnail} onPlayingChange={setMediaPlaying} />
    <div className="project-description"><p>{project.description}</p>{project.behance && <a href={project.behance} target="_blank" rel="noreferrer">view on Behance <ArrowUpRight size={18} /></a>}</div>
    <section className="styleframes" aria-label="Project styleframes">{project.frames.map((frame, index) => <img key={frame} src={frame} alt={`${project.title} — styleframe ${index + 1}`} loading="lazy" />)}</section>
    <Link className="next-project" href={`/projects/${next.slug}`}><span>next project</span><h2>{next.title} <ArrowUpRight /></h2><img src={next.thumbnail} alt={next.title} loading="lazy" /></Link>
  </main>;
}
