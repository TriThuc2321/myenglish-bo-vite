import { Avatar } from '@heroui/react';
import { Suspense } from 'react';

import type { User } from '@/types/user';

import { formatDateTime } from '@/utils/datetime';

import Loader from './Loader';

type AuditItemProps = Partial<{
  user?: User;
  dateTime: string;
  email?: string;
}>;

export default function AuditItem({ user, dateTime, email }: AuditItemProps) {
  const { firstName, lastName, avatar } = user ?? {};
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  return (
    <Suspense
      fallback={
        <div className="flex w-full justify-center">
          <Loader />
        </div>
      }
    >
      <div className="flex min-w-max items-center gap-3">
        <Avatar className="rounded-2xl" variant="soft" color="accent">
          <Avatar.Image alt={fullName} src={avatar} />
          <Avatar.Fallback className="rounded-2xl">
            {fullName?.charAt(0) ?? ''}
          </Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-left">{fullName}</p>
          <p className="text-left text-xs">
            {formatDateTime(dateTime, 'MM/DD/YYYY HH:mm')}
          </p>
          {email && <p className="text-xs">{email}</p>}
        </div>
      </div>
    </Suspense>
  );
}
