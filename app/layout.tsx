import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'GymFlow | Quản lý phòng gym',
  description: 'Bộ khung quản lý hội viên và gói tập phòng gym',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'GymFlow' },
};
export const viewport: Viewport = { themeColor: '#0f172a', width: 'device-width', initialScale: 1 };
export default function BoCucGoc({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
