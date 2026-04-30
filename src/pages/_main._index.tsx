import { Button } from '@heroui/react';
import { type MetaFunction } from 'react-router';

import { pageMeta } from '@/utils/metadata';

export const meta: MetaFunction = () =>
  pageMeta('Dashboard', 'Overview of your MyEnglish management workspace.');

export default function DashboardPage() {
  return (
    <div className="bg-surface">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-default-500 mt-2">Placeholder page.</p>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-soft">Danger Soft</Button>
    </div>
  );
}
