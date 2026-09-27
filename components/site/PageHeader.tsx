import { SectionLabel } from '@/components/site/ui';

export function PageHeader({
  index,
  label,
  title,
  lede,
  meta,
}: {
  index: string;
  label: string;
  title: string;
  lede?: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="shell page-top" style={{ paddingBottom: 'clamp(40px, 6vw, 88px)' }}>
      <SectionLabel index={index}>{label}</SectionLabel>
      <h1 style={{ maxWidth: '18ch' }}>{title}</h1>
      {lede ? <p className="lede" style={{ marginTop: 'clamp(20px, 2.6vw, 34px)' }}>{lede}</p> : null}
      {meta ? <div style={{ marginTop: 'clamp(20px, 2.6vw, 34px)' }}>{meta}</div> : null}
    </header>
  );
}
