import Logo from '@/components/ui/Logo';
import { SignInForm } from '@/components/auth/SignInForm';
import SignInTitle from '@/components/auth/SignInTitle';
import prisma from '@/lib/prisma';

export default async function SignInPage() {
  // Fetch settings server-side
  const settings = await prisma.systemSettings.findFirst();
  const logoPath = settings?.siteLogo || '/nepal-emblem.png';
  const siteName = settings?.siteName || 'File Management System';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <Logo src={logoPath} alt={siteName} className="h-16 w-auto" />
          <SignInTitle siteName={siteName} />
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 