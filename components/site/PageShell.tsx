import { AmbientField } from '@/components/three/AmbientField';

/** Inner-page frame: ambient 3D behind, content on an opaque layer above it. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmbientField />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </>
  );
}
