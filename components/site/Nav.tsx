'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { asset } from '@/lib/asset';
import { site } from '@/content/site';

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change, and lock the page behind the panel while it is open.
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <>
      <header className="nav mono">
        <Link href="/" className="nav-mark" aria-label={`${site.name} — home`}>
          <Image
            src={asset("/brand/cerebral-lockup.png")}
            alt={site.name}
            width={1883}
            height={292}
            priority
            style={{ height: 19, width: 'auto' }}
          />
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <span className="nav-status">
          <span className="pip" aria-hidden />
          {site.phase}
        </span>

        <button
          type="button"
          className="nav-toggle mono"
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Index'}
        </button>
      </header>

      <div id="nav-panel" className="nav-panel" data-open={open} aria-hidden={!open}>
        <nav aria-label="Primary, expanded">
          {site.footerNav.map((item, i) => (
            <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
              <span className="mono idx">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mono dimmer nav-panel-status">
          <span className="pip" aria-hidden /> {site.phase} — {site.phaseDetail}
        </p>
      </div>
    </>
  );
}
