import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'resQmech | Instant Roadside Assistance & Mechanic Dispatch',
  description:
    'On-demand emergency roadside assistance MVP for flat tyres, battery jumpstarts, engine breakdown, and towing with live mechanic dispatch tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
