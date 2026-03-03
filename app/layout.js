import './globals.css';

export const metadata = {
  title: 'Electrics PM',
  description: 'Theatre Electrics Project Manager',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
