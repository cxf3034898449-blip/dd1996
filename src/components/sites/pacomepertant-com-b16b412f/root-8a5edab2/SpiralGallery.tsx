'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { projects, type Project } from './data';
import { vertexShader } from './vertexShader';
import { fragmentShader } from './fragmentShader';

interface Props { active: boolean; onHover: (project: Project | null) => void; onSound: (name: string) => void; }

export function SpiralGallery({ active, onHover, onSound }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const callbacks = useRef({ onHover, onSound });
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { callbacks.current = { onHover, onSound }; }, [onHover, onSound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }); }
    catch { queueMicrotask(() => setFailed(true)); return; }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(window.innerWidth < 900 ? 45 : 35, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.z = 8;
    renderer.setClearColor(0x0a0a0a, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.NoToneMapping;
    const loader = new THREE.TextureLoader();
    const textures = projects.map(project => loader.load(project.thumbnail));
    const geometry = new THREE.PlaneGeometry(1, 1, 8, 8);
    const cards = [...projects, ...projects].map((project, i) => {
      const texture = textures[i % projects.length];
      const material = new THREE.ShaderMaterial({
        vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: texture }, uColorStrength: { value: 0 }, uZoom: { value: 1 },
          uPlaneSizes: { value: new THREE.Vector2(1.7, 1) }, uImageSizes: { value: new THREE.Vector2(1.7, 1) },
          uRevealProgress: { value: 0 }, uScrollSpeed: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1.7, 1, 1);
      scene.add(mesh);
      return { mesh, project, hover: 0, hidden: 1 };
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let targetSpeed = reducedMotion.matches ? 0 : .002, speed = 0, direction = 1, offset = 0;
    let hovered = -1, previousTime = performance.now(), frame = 0;
    let pressed = false, dragDistance = 0, lastX = 0, disposed = false;
    const clearHover = () => { if (hovered !== -1) callbacks.current.onHover(null); hovered = -1; canvas.style.cursor = 'grab'; };
    const updatePointer = (event: PointerEvent) => {
      pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
      if (pressed && activeRef.current) {
        const delta = event.clientX - lastX;
        dragDistance += Math.abs(delta);
        targetSpeed = THREE.MathUtils.clamp(targetSpeed + delta * .0015, -2, 2);
        direction = delta >= 0 ? 1 : -1;
        lastX = event.clientX;
      }
    };
    const wheel = (event: WheelEvent) => {
      if (!activeRef.current) return;
      event.preventDefault();
      targetSpeed = THREE.MathUtils.clamp(targetSpeed + event.deltaY * .00015, -2, 2);
      direction = event.deltaY >= 0 ? 1 : -1;
    };
    const down = (event: PointerEvent) => { if (!activeRef.current) return; pressed = true; lastX = event.clientX; dragDistance = 0; updatePointer(event); canvas.setPointerCapture(event.pointerId); };
    const up = (event: PointerEvent) => {
      if (!pressed) return;
      const wasDrag = dragDistance >= 8;
      pressed = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (!wasDrag && activeRef.current) {
        updatePointer(event);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(cards.map(card => card.mesh))[0];
        if (hit?.face && hit.face.normal.clone().transformDirection(hit.object.matrixWorld).dot(raycaster.ray.direction) < 0) {
          const card = cards.find(item => item.mesh === hit.object);
          if (card) { callbacks.current.onSound('longclick'); clearHover(); router.push(`/projects/${card.project.slug}`); }
        }
      }
    };
    const cancelDrag = () => { pressed = false; dragDistance = 0; pointer.set(-10, -10); clearHover(); };
    const lostContext = (event: Event) => { event.preventDefault(); setFailed(true); };
    const key = (event: KeyboardEvent) => {
      if (!activeRef.current || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1; targetSpeed += .08 * direction;
    };
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = window.innerWidth < 900 ? 45 : 35; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    const render = (time: number) => {
      if (disposed) return;
      const delta = Math.min(time - previousTime, 50); previousTime = time;
      const factor = delta / (1000 / 60);
      if (activeRef.current && !document.hidden) {
        speed += (targetSpeed - speed) * (1 - Math.pow(.9, factor));
        offset += speed * factor;
        if (Math.abs(targetSpeed) < .002) targetSpeed = reducedMotion.matches ? 0 : direction * .002;
        targetSpeed *= Math.pow(.9, factor);
      }
      cards.forEach((card, i) => {
        card.hover = THREE.MathUtils.lerp(card.hover, i === hovered ? 1 : 0, 1 - Math.pow(.93, delta * .2));
        card.hidden = THREE.MathUtils.lerp(card.hidden, activeRef.current ? 0 : 1, 1 - Math.pow(.95, delta * .15));
        const position = ((i - offset) % cards.length + cards.length) % cards.length - Math.floor(cards.length / 2);
        const angle = position * .85;
        const radius = 2 * (1 - card.hidden / 2);
        card.mesh.position.set(Math.cos(angle) * radius, position * .5 - .8 + card.hidden * 1.5, Math.sin(angle) * radius);
        card.mesh.rotation.y = -angle + Math.PI / 2;
        const u = card.mesh.material.uniforms;
        u.uColorStrength.value = .55 * card.hover; u.uZoom.value = 1 + .05 * card.hover;
        u.uRevealProgress.value = (1 - card.hover * .05) * (1 - card.hidden); u.uScrollSpeed.value = speed;
        const img = textures[i % projects.length].image as HTMLImageElement | undefined;
        if (img?.width) (u.uImageSizes.value as THREE.Vector2).set(img.width, img.height);
      });
      if (activeRef.current && !pressed) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(cards.map(card => card.mesh))[0];
        const next = hit?.face && hit.face.normal.clone().transformDirection(hit.object.matrixWorld).dot(raycaster.ray.direction) < 0 ? cards.findIndex(card => card.mesh === hit.object) : -1;
        if (next !== hovered) {
          hovered = next;
          callbacks.current.onHover(next >= 0 ? cards[next].project : null);
          if (next >= 0) callbacks.current.onSound('hover');
          canvas.style.cursor = next >= 0 ? 'pointer' : 'grab';
        }
      } else clearHover();
      if (!document.hidden && (activeRef.current || cards.some(card => card.hidden < .999))) renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    canvas.addEventListener('pointercancel', cancelDrag);
    canvas.addEventListener('lostpointercapture', cancelDrag);
    canvas.addEventListener('webglcontextlost', lostContext);
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointermove', updatePointer); canvas.addEventListener('pointerleave', clearHover);
    window.addEventListener('resize', resize); window.addEventListener('keydown', key);
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      canvas.removeEventListener('pointercancel', cancelDrag);
      canvas.removeEventListener('lostpointercapture', cancelDrag);
      canvas.removeEventListener('webglcontextlost', lostContext);
      canvas.removeEventListener('wheel', wheel); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointermove', updatePointer); canvas.removeEventListener('pointerleave', clearHover);
      window.removeEventListener('resize', resize); window.removeEventListener('keydown', key);
      cards.forEach(card => card.mesh.material.dispose()); textures.forEach(texture => texture.dispose()); geometry.dispose(); renderer.dispose();
    };
  }, [router, failed]);

  if (failed && !active) return null;
  if (failed) return <div className="gallery-fallback">{projects.map(project => <a href={`/projects/${project.slug}`} key={project.slug}><img src={project.thumbnail} alt={project.title} /><span>{project.title}</span></a>)}</div>;
  return <canvas ref={canvasRef} className={`spiral-canvas ${active ? 'is-active' : ''}`} aria-label="Spiral project gallery. Scroll or drag to explore. Use list view for keyboard navigation." />;
}
