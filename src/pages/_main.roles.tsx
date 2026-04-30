import { type MetaFunction } from 'react-router';

import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta('Roles', 'Configure roles and permissions for MyEnglish users.');

export default function RolesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Roles</h1>
      <p className="text-default-500 mt-2">Placeholder page.</p>
    </div>
  );
}
