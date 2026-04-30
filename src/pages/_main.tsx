import { Outlet } from 'react-router';

import MainLayout from '@/components/layouts/mainLayout';
import { readShowFullMenuFromStorage } from '@/constants/storage';
import { AccessProvider } from '@/providers';
import { PermissionAction, SubjectName } from '@/types/auth';
import { RoleStatus } from '@/types/role';

const profile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://github.com/shadcn.png',
  role: {
    id: 1,
    name: 'Admin',
    code: 'admin',
    canAccessCms: true,
    status: RoleStatus.ACTIVE,
    permissions: [
      {
        action: PermissionAction.Manage,
        subject: SubjectName.All,
      },
    ],
    auditMetadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

export default function MainLayoutRoute() {
  return (
    <AccessProvider profile={profile}>
      <MainLayout initialShowFullMenu={readShowFullMenuFromStorage(true)}>
        <Outlet />
      </MainLayout>
    </AccessProvider>
  );
}
