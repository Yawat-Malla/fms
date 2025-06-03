import MainLayout from '@/components/layout/MainLayout';
import ToastContainer from '@/components/ui/ToastContainer';
import PageTransition from '@/components/PageTransition';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <PageTransition>
        {children}
      </PageTransition>
      <ToastContainer position="bottom-center" />
    </MainLayout>
  );
} 