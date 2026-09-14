'use client';
import { useEffect, useRef } from 'react';
import type { AnimationItem } from 'lottie-web';
import { assetRoot } from './data';
export function LottieArtwork({ name, loop = false, className = '' }: { name: string; loop?: boolean; className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let animation: AnimationItem | undefined;
    let cancelled = false;
    import('lottie-web').then(module => {
      if (cancelled || !container.current) return;
      animation = module.default.loadAnimation({ container: container.current, renderer: 'svg', loop, autoplay: true, path: `${assetRoot}/${name}.json` });
    });
    return () => { cancelled = true; animation?.destroy(); };
  }, [name, loop]);
  return <div ref={container} className={className} aria-hidden="true" />;
}
