import { Button } from '@heroui/react';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate, type MetaFunction } from 'react-router';

import { LogoIcon } from '@/assets/icons';
import ENV from '@/configs/env.config';
import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta(
    'Login',
    'Sign in with Google to access the MyEnglish management dashboard and tools.',
  );

export default function LoginPage() {
  const navigate = useNavigate();
  const handleGoogleLogin = () => {
    navigate(`${ENV.API_URL}/api/auth/google`);
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <div className="mb-8">
        <LogoIcon className="h-8" />
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-foreground mb-2 text-3xl font-bold">
          Welcome back
        </h1>
        <p className="text-default-700 max-w-md text-lg">
          Streamline your English classes with our comprehensive management
          platform
        </p>
      </div>

      <Button onClick={handleGoogleLogin} className="w-full border py-3">
        <FaGoogle className="h-5 w-5 text-white" />
        Continue with Google
      </Button>

      <p className="text-default-600 mt-4 text-center text-sm">
        Sign in to access My English management dashboard and tools
      </p>
    </div>
  );
}
