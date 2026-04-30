import { type MetaFunction } from 'react-router';

import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta(
    'Teachers',
    'Manage teacher accounts and classroom operations in MyEnglish.',
  );

export default function TeachersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Teachers</h1>
      <p className="text-default-500 mt-2">Placeholder page.</p>
    </div>
  );
}
