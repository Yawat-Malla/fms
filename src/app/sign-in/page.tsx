import Logo from '@/components/ui/Logo';
import { SignInForm } from '@/components/auth/SignInForm';
import SignInTitle from '@/components/auth/SignInTitle';
import prisma from '@/lib/prisma';

export default async function SignInPage() {
  // Fetch settings server-side
  const settings = await prisma.systemSettings.findFirst();
  const logoPath = settings?.siteLogo
    ? `${settings.siteLogo}?v=${settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now()}`
    : '/nepal-emblem.png';
  const siteName = settings?.siteName || 'File Management System';

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl border border-primary-100">
        <div className="flex flex-col items-center justify-center">
          <Logo width={120} height={120} className="mb-4" initialLogoPath={logoPath} />
          <h2 className="text-center text-3xl font-extrabold text-primary-500">
            {siteName}
          </h2>
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 