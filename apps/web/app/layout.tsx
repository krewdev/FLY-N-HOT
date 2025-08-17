import NavBar from './components/NavBar';
import './globals.css';

export const metadata = {
  title: 'fiahab.com',
  description: 'flying in a hot air balloon',
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


