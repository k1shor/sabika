'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LayoutContent({ children }) {
  const pathname = usePathname();

  const hideLayout = [
    '/admin/dashboard'
  ].includes(pathname);

  return (
    <>
      {!hideLayout && <Header />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}