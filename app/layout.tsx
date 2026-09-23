import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Nautical Dream', template: '%s | Nautical Dream' },
  description: 'Premium destinations, trusted gear, and practical guidance for life on the water.',
};

const nav = [
  ['Destinations', '/destinations'],
  ['Gear', '/gear'],
  ['Journal', '/journal'],
  ['Weather', '/weather'],
  ['Trip Planner', '/trip-planner'],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="shell navBar">
            <Link className="brand" href="/" aria-label="Nautical Dream home"><img className="brandLogo brandLogoHeader" src="/nautical-dream-logo.png" alt="Nautical Dream" width="2172" height="724" /></Link>
            <nav aria-label="Main navigation">
              {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
            <Link className="navCta" href="/journal">Read the Journal</Link>
          </div>
        </header>
        {children}
        <footer>
          <div className="shell footerGrid">
            <div><div className="brand"><img className="brandLogo brandLogoFooter" src="/nautical-dream-logo.png" alt="Nautical Dream" width="2172" height="724" /></div><p>Premium guidance for better days on the water.</p></div>
            <div><strong>Explore</strong><Link href="/destinations">Destinations</Link><Link href="/gear">Gear</Link><Link href="/journal">Journal</Link></div>
            <div><strong>Plan</strong><Link href="/weather">Weather</Link><Link href="/trip-planner">Trip Planner</Link><Link href="/about">About</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
