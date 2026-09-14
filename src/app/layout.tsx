import type { Metadata } from 'next';
import { PortfolioShell } from '@/components/sites/pacomepertant-com-b16b412f/root-8a5edab2/Portfolio';
import './globals.css';
export const metadata: Metadata = {
  title: 'Pacôme Pertant ✲ Portfolio',
  description: 'Motion & sound designer based in Paris. Selected works by Pacôme Pertant.',
  icons: { icon: '/dd1996/sites/pacomepertant-com-b16b412f/root-8a5edab2/favicon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PortfolioShell>{children}</PortfolioShell></body></html>;
}
