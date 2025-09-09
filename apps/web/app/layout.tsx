import NavBar from './components/NavBar';
import './globals.css';

export const metadata = {
  title: 'Fiahab',
  description: 'Fiahab — Book scenic hot‑air balloon flights with trusted local pilots',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}


