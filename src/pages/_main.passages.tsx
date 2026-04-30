import { type MetaFunction } from 'react-router';

import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta(
    'Passages',
    'Create, edit, and organize reading passages for tests and curricula in MyEnglish.',
  );

export default function PassagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Passages</h1>
      <p className="text-default-500 mt-2">Placeholder page.</p>
    </div>
  );
}
