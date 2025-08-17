import NavBar from './components/NavBar';
import './globals.css';
import { Shrikhand, Baloo_2 } from 'next/font/google';

export const metadata = {
  title: 'fiahab.com',
  description: 'flying in a hot air balloon',
};

const displayFont = Shrikhand({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const headingFont = Baloo_2({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-heading' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${displayFont.variable}`} style={{ margin: 0 }}>
        <div className="construction-banner">🚧 This site is under construction</div>
        <NavBar />
        {children}
      </body>
    </html>
  );
}


