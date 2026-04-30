import { Outlet } from 'react-router';

import MainLayout from '@/components/layouts/mainLayout';
import { readShowFullMenuFromStorage } from '@/constants/storage';

export default function MainLayoutRoute() {
  return (
    <MainLayout initialShowFullMenu={readShowFullMenuFromStorage(true)}>
      <Outlet />
    </MainLayout>
  );
}
