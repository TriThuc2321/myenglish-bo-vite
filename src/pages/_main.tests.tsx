import { type MetaFunction } from 'react-router';

import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta(
    'Tests',
    'Create, publish, and manage English tests and sections in MyEnglish.',
  );

export default function TestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Tests</h1>
      <p className="text-default-500 mt-2">Placeholder page.</p>
    </div>
  );
}
