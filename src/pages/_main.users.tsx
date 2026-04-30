import { type MetaFunction } from 'react-router';

import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta('Users', 'Invite, edit, and manage user accounts in MyEnglish.');

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-default-500 mt-2">Placeholder page.</p>
    </div>
  );
}
