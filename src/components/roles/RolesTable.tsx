import type { SortingState } from '@tanstack/react-table';

import { Chip } from '@heroui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import type { Role } from '@/types/role';

import AuditItem from '@/components/shared/AuditItem';
import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import ConfirmWrapper from '@/configs/ConfirmWrapper';
import { useDeleteRole } from '@/hooks/apis/roles';
import { PermissionAction, SubjectName } from '@/types/auth';
import { RoleStatus } from '@/types/role';
import { toSortDescriptor, toSortingState } from '@/utils/table';

const statusColorMap: Record<RoleStatus, 'success' | 'danger' | 'default'> = {
  [RoleStatus.ACTIVE]: 'success',
  [RoleStatus.INACTIVE]: 'danger',
  [RoleStatus.DELETED]: 'default',
};

const columnHelper = createColumnHelper<Role>();

interface RolesTableProps {
  data: Role[];
  isLoading?: boolean;
  page?: number;
  take?: number;
  total?: number;
}

export default function RolesTable({
  data,
  isLoading,
  page,
  take,
  total,
}: RolesTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: t('roles.table.name') }),
      columnHelper.accessor('code', { header: t('roles.table.code') }),
      columnHelper.accessor('status', {
        header: t('roles.table.status'),
        cell: (info) => (
          <Chip
            color={statusColorMap[info.getValue()]}
            size="sm"
            variant="soft"
          >
            <Chip.Label>{info.getValue()}</Chip.Label>
          </Chip>
        ),
      }),
      columnHelper.accessor('canAccessCms', {
        header: t('roles.table.cmsAccess'),
        cell: (info) => (
          <Chip
            color={info.getValue() ? 'success' : 'default'}
            size="sm"
            variant="soft"
          >
            {info.getValue() ? t('common.yes') : t('common.no')}
          </Chip>
        ),
      }),
      columnHelper.accessor('auditMetadata', {
        id: 'createdBy',
        header: t('common.createdBy'),
        cell: (info) => {
          const audit = info.getValue();
          if (!audit?.createdBy && !audit?.createdAt) return '-';
          return (
            <AuditItem
              user={audit?.createdBy}
              dateTime={audit?.createdAt}
              email={audit?.createdBy?.email}
            />
          );
        },
      }),
      columnHelper.accessor('auditMetadata', {
        id: 'updatedBy',
        header: t('common.updatedBy'),
        cell: (info) => {
          const audit = info.getValue();
          if (!audit?.updatedBy && !audit?.updatedAt) return '-';
          return (
            <AuditItem
              user={audit?.updatedBy}
              dateTime={audit?.updatedAt}
              email={audit?.updatedBy?.email}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('common.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <MyButton
              I={PermissionAction.Read}
              a={SubjectName.Roles}
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => navigate(`/roles/${row.original.id}`)}
            >
              <LuEye className="size-4" />
            </MyButton>
            <MyButton
              I={PermissionAction.Update}
              a={SubjectName.Roles}
              isIconOnly
              size="sm"
              variant="ghost"
              onPress={() => navigate(`/roles/${row.original.id}/edit`)}
            >
              <LuPencil className="size-4" />
            </MyButton>
            <ConfirmWrapper
              title={t('roles.deleteTitle')}
              description={t('roles.deleteConfirm', {
                name: row.original.name,
              })}
              confirmText={t('common.delete')}
              onConfirm={() => deleteRole([row.original.id])}
            >
              <MyButton
                I={PermissionAction.Delete}
                a={SubjectName.Roles}
                isIconOnly
                size="sm"
                variant="ghost"
                isDisabled={isDeleting}
              >
                <LuTrash2 className="text-danger size-4" />
              </MyButton>
            </ConfirmWrapper>
          </div>
        ),
      }),
    ],
    [t, navigate, deleteRole, isDeleting],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  return (
    <TanstackTable
      table={table}
      sortDescriptor={sortDescriptor}
      onSortChange={(d) => setSorting(toSortingState(d))}
      ariaLabel="Roles table"
      isLoading={isLoading}
      footer={<FooterTable page={page} take={take} total={total} />}
    />
  );
}
