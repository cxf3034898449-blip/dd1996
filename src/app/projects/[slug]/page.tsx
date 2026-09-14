import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/components/sites/pacomepertant-com-b16b412f/root-8a5edab2/data';
import { ProjectPage } from '@/components/sites/pacomepertant-com-b16b412f/root-8a5edab2/ProjectPage';
export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  return { title: `${project?.title ?? 'Project'} — Pacôme Pertant`, description: project?.description };
}
export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  return <ProjectPage project={project} />;
}
