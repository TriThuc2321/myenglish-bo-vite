import { Chip } from '@heroui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import type { Teacher } from '@/types/teacher';

import AuditItem from '@/components/shared/AuditItem';
import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import ConfirmWrapper from '@/configs/ConfirmWrapper';
import { useDeleteTeacher } from '@/hooks/apis/teachers';
import { PermissionAction, SubjectName } from '@/types/auth';

import { statusColorMap } from './constants';

const columnHelper = createColumnHelper<Teacher>();

interface TeachersTableProps {
  data: Teacher[];
  isLoading?: boolean;
  page?: number;
  take?: number;
  total?: number;
}

export default function TeachersTable({
  data,
  isLoading,
  page,
  take,
  total,
}: TeachersTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        enableSorting: false,
        header: t('teachers.table.code'),
      }),
      columnHelper.accessor('user', {
        enableSorting: false,
        id: 'name',
        header: t('teachers.table.name'),
        cell: (info) => {
          const user = info.getValue();
          if (!user) return '-';
          const name = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ');
          return (
            <div className="flex flex-col">
              <span>{name || '-'}</span>
              {user.email && (
                <span className="text-content2-foreground text-xs">
                  {user.email}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('nationality', {
        enableSorting: false,
        header: t('teachers.table.nationality'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor('status', {
        enableSorting: false,
        header: t('teachers.table.status'),
        cell: (info) => {
          const value = info.getValue();
          if (!value) return '-';
          return (
            <Chip color={statusColorMap[value]} size="sm" variant="soft">
              <Chip.Label>{value}</Chip.Label>
            </Chip>
          );
        },
      }),
      columnHelper.accessor('auditMetadata', {
        enableSorting: false,
        id: 'createdBy',
        header: t('common.createdBy'),
        cell: (info) => {
          const audit = info.getValue();
          if (!audit?.createdBy && !audit?.createdAt) return '-';
          return (
            <AuditItem user={audit?.createdBy} dateTime={audit?.createdAt} />
          );
        },
      }),
      columnHelper.accessor('auditMetadata', {
        enableSorting: false,
        id: 'updatedBy',
        header: t('common.updatedBy'),
        cell: (info) => {
          const audit = info.getValue();
          if (!audit?.updatedBy && !audit?.updatedAt) return '-';
          return (
            <AuditItem user={audit?.updatedBy} dateTime={audit?.updatedAt} />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('common.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MyButton
              I={PermissionAction.Read}
              a={SubjectName.Teachers}
              isIconOnly
              variant="outline"
              size="sm"
              onPress={() => navigate(`/teachers/${row.original.id}`)}
            >
              <LuEye className="size-4" />
            </MyButton>
            <MyButton
              I={PermissionAction.Update}
              a={SubjectName.Teachers}
              isIconOnly
              size="sm"
              variant="outline"
              onPress={() => navigate(`/teachers/${row.original.id}/edit`)}
            >
              <LuPencil className="size-4" />
            </MyButton>
            <ConfirmWrapper
              title={t('teachers.deleteTitle')}
              description={t('teachers.deleteConfirm', {
                name: row.original.code,
              })}
              confirmText={t('common.delete')}
              onConfirm={() => deleteTeacher([row.original.id])}
            >
              <MyButton
                I={PermissionAction.Delete}
                a={SubjectName.Teachers}
                isIconOnly
                size="sm"
                variant="outline"
                isDisabled={isDeleting}
              >
                <LuTrash2 className="text-danger size-4" />
              </MyButton>
            </ConfirmWrapper>
          </div>
        ),
      }),
    ],
    [t, navigate, deleteTeacher, isDeleting],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    initialState: {
      columnPinning: { right: ['actions'] },
    },
  });

  return (
    <TanstackTable
      table={table}
      ariaLabel="Teachers table"
      isLoading={isLoading}
      footer={<FooterTable page={page} take={take} total={total} />}
    />
  );
}
