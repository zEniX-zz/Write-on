'use client';

import { useEffect, useRef, useState } from 'react';

/* ============================================================
   usePrefersReducedMotion
   ============================================================ */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/* ============================================================
   useScrollProgress — 0..1 of how far the page has been scrolled
   Drives the top progress bar.
   ============================================================ */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
      setProgress(p);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return progress;
}

/* ============================================================
   useScrollSpy — return the id of the section currently in view
   ============================================================ */
export function useScrollSpy(ids: string[], offset = 90): string {
  const [active, setActive] = useState<string>(ids[0] || '');
  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    let ticking = false;
    const update = () => {
      const y = window.scrollY + offset + 2;
      let current = sections[0]?.id || '';
      for (const sec of sections) {
        if (sec.offsetTop <= y) current = sec.id;
      }
      // snap to last when near bottom
      const docBottom = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= docBottom - 4) current = sections[sections.length - 1].id;
      setActive(current);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids, offset]);
  return active;
}

/* ============================================================
   useScrolled — true once the page is scrolled past `threshold` px
   Used to add the .scrolled blur to the navbar.
   ============================================================ */
export function useScrolled(threshold = 12): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled((window.scrollY || 0) > threshold);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/* ============================================================
   useReveal — IntersectionObserver to add `.in` to `.reveal` elements
   Fires once per element. Respects reduced motion (reveals instantly).
   ============================================================ */
export function useReveal(): void {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (reduced) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);
}

/* ============================================================
   useParallax — layered depth on scroll.
   Elements with [data-parallax="<speed>"] translate at their own rate.
   Smoothed via rAF + lerp. Background grid drifts too. Disabled for
   reduced-motion users.
   ============================================================ */
export function useParallax(): void {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;

    type Layer = {
      el: HTMLElement;
      speed: number;
      baseTop: number;
      height: number;
      isFixed: boolean;
    };
    let layers: Layer[] = [];
    const shell = document.querySelector<HTMLElement>('.writeon-shell');

    const measure = () => {
      layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]')).map((el) => {
        const r = el.getBoundingClientRect();
        const isFixed = getComputedStyle(el).position === 'fixed';
        return {
          el,
          speed: parseFloat(el.getAttribute('data-parallax') || '0.1') || 0.1,
          baseTop: isFixed ? 0 : r.top + window.scrollY,
          height: el.offsetHeight,
          isFixed,
        };
      });
    };
    measure();

    let target = window.scrollY;
    let current = window.scrollY;
    let ticking = false;
    let rafId = 0;

    const render = () => {
      current += (target - current) * 0.09; // lerp — buttery but cheap
      if (Math.abs(target - current) < 0.4) current = target;

      const vh = window.innerHeight;
      for (const l of layers) {
        if (l.isFixed) {
          // fixed orbs drift gently opposite to scroll
          l.el.style.transform = `translate3d(0, ${(-current * l.speed).toFixed(2)}px, 0)`;
        } else {
          const offset = (l.baseTop - current - vh / 2 + l.height / 2) * l.speed;
          l.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        }
      }
      // background grid drifts slower than content (parallax layer 0)
      if (shell) {
        shell.style.backgroundPosition = `0px 0px, 0px 0px, 0px 0px, 0px ${(current * 0.04).toFixed(1)}px, ${(-current * 0.04).toFixed(1)}px 0px, 0px ${(current * 0.08).toFixed(1)}px, ${(current * 0.08).toFixed(1)}px 0px`;
      }
      if (current !== target) {
        rafId = requestAnimationFrame(render);
      } else {
        ticking = false;
      }
    };

    const onScroll = () => {
      target = window.scrollY;
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(render);
      }
    };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 120);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // run once to settle initial positions
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
    };
  }, [reduced]);
}

/* ============================================================
   useMouseTilt — subtle 3D tilt of a container based on cursor.
   Returns a ref to attach + the live transform style.
   ============================================================ */
export function useMouseTilt(maxDeg = 8) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height; // 0..1
      targetX = (0.5 - px) * 2 * maxDeg; // rotateY
      targetY = (py - 0.5) * 2 * maxDeg; // rotateX
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      curX += (targetX - curX) * 0.12;
      curY += (targetY - curY) * 0.12;
      el.style.transform = `rotateX(${curY.toFixed(2)}deg) rotateY(${curX.toFixed(2)}deg)`;
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxDeg, reduced]);

  return ref;
}

/* ============================================================
   useBodyScrollLock — lock body scroll while `locked` is true.
   ============================================================ */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

/* ============================================================
   useCountUp — animate a number from 0 to `target` over `dur` ms.
   Used for the link risk score gauge.
   ============================================================ */
export function useCountUp(target: number, dur = 650, reduced = false): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (reduced) return; // reduced-motion: no animation, caller gets target directly
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = target;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(2, -6 * p);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur, reduced]);
  return reduced ? target : val;
}

/* ============================================================
   useEscapeAndClickOutside — call handler on Escape / outside click.
   ============================================================ */
export function useEscapeAndClickOutside<T extends HTMLElement>(
  active: boolean,
  onTrigger: () => void,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onTrigger();
    };
    const onClick = (e: MouseEvent) => {
      const node = ref.current;
      if (node && !node.contains(e.target as Node)) onTrigger();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [active, onTrigger]);
  return ref;
}
