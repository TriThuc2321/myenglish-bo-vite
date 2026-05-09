import { Button, Chip, Skeleton } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LuPencil } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import type { Gender } from '@/types/common';

import MyButton from '@/components/shared/Button';
import { useGetUserById } from '@/hooks/apis/users';
import { PermissionAction, SubjectName } from '@/types/auth';
import { formatDateTime } from '@/utils/datetime';

import AuditItem from '../shared/AuditItem';
import GenderChip from '../shared/GenderChip';

type ViewUserProps = {
  id: string;
};

const ViewUser = ({ id }: ViewUserProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: user, isLoading } = useGetUserById(id);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.email')}</span>
        <span className="text-base">{user.email ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.role')}</span>
        <span className="text-base">{user.role?.name ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">
          {t('cmsUsers.form.firstName')}
        </span>
        <span className="text-base">{user.firstName ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.lastName')}</span>
        <span className="text-base">{user.lastName ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">
          {t('cmsUsers.table.emailVerified')}
        </span>
        <div>
          <Chip
            color={user.emailVerified ? 'success' : 'default'}
            size="sm"
            variant="soft"
          >
            <Chip.Label>
              {user.emailVerified ? t('common.yes') : t('common.no')}
            </Chip.Label>
          </Chip>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.phone')}</span>
        <span className="text-base">{user.phone}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">
          {t('cmsUsers.form.dateOfBirth')}
        </span>
        <span className="text-base">{formatDateTime(user.dateOfBirth)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.gender')}</span>
        <GenderChip gender={user.gender as Gender} />
      </div>

      <div className="col-span-2 flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.address')}</span>
        <span className="text-base">{user.address}</span>
      </div>

      <div>
        <span className="text-sm font-bold">{t('common.createdBy')}</span>
        <AuditItem
          user={user.auditMetadata?.createdBy}
          dateTime={user.auditMetadata?.createdAt}
        />
      </div>

      <div>
        <span className="text-sm font-bold">{t('common.updatedBy')}</span>
        <AuditItem
          user={user.auditMetadata?.updatedBy}
          dateTime={user.auditMetadata?.updatedAt}
        />
      </div>

      <div className="col-span-2 flex justify-end gap-2">
        <Button variant="outline" onPress={() => navigate('/users')}>
          {t('common.back')}
        </Button>
        <MyButton
          I={PermissionAction.Update}
          a={SubjectName.Users}
          variant="primary"
          onPress={() => navigate(`/users/${id}/edit`)}
        >
          <LuPencil className="size-4" />
          {t('common.edit')}
        </MyButton>
      </div>
    </div>
  );
};

export default ViewUser;
