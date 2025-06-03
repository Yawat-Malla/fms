import { Logo } from '@/components/ui/Logo';
import { SignInForm } from '@/components/auth/SignInForm';
import SignInTitle from '@/components/auth/SignInTitle';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
        <div className="flex flex-col items-center justify-center">
          <Logo width={120} height={120} className="mb-4" />
          <SignInTitle />
        </div>
        <SignInForm />
      </div>
    </div>
  );
} 