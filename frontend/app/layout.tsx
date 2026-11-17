import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Citadel | CollabCircle', description: 'CollabCircle HR workspace' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
