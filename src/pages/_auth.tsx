import { Outlet } from 'react-router';

import AuthLayout from '@/components/layouts/authLayout';

export default function AuthLayoutRoute() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
