import { Header } from '@/modules/shared-common/components/common/Header';
import { Footer } from '@/modules/shared-common/components/common/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
