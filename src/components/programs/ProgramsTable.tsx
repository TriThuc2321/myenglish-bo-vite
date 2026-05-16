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

import type { Program } from '@/types/program';

import AuditItem from '@/components/shared/AuditItem';
import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import ConfirmWrapper from '@/configs/ConfirmWrapper';
import { useDeleteProgram } from '@/hooks/apis/programs';
import { PermissionAction, SubjectName } from '@/types/auth';

import { statusColorMap } from './constants';

const columnHelper = createColumnHelper<Program>();

interface ProgramsTableProps {
  data: Program[];
  isLoading?: boolean;
  page?: number;
  take?: number;
  total?: number;
}

export default function ProgramsTable({
  data,
  isLoading,
  page,
  take,
  total,
}: ProgramsTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram();

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        enableSorting: false,
        header: t('programs.table.code'),
      }),
      columnHelper.accessor('name', {
        enableSorting: false,
        header: t('programs.table.name'),
      }),
      columnHelper.accessor('description', {
        enableSorting: false,
        header: t('programs.table.description'),
        cell: (info) => {
          const value = info.getValue();
          if (!value) return '-';
          return <span className="line-clamp-2 max-w-md text-sm">{value}</span>;
        },
      }),
      columnHelper.accessor('status', {
        enableSorting: false,
        header: t('programs.table.status'),
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
              a={SubjectName.Programs}
              isIconOnly
              variant="outline"
              size="sm"
              onPress={() => navigate(`/programs/${row.original.id}`)}
            >
              <LuEye className="size-4" />
            </MyButton>
            <MyButton
              I={PermissionAction.Update}
              a={SubjectName.Programs}
              isIconOnly
              size="sm"
              variant="outline"
              onPress={() => navigate(`/programs/${row.original.id}/edit`)}
            >
              <LuPencil className="size-4" />
            </MyButton>
            <ConfirmWrapper
              title={t('programs.deleteTitle')}
              description={t('programs.deleteConfirm', {
                name: row.original.code,
              })}
              confirmText={t('common.delete')}
              onConfirm={() => deleteProgram([row.original.id])}
            >
              <MyButton
                I={PermissionAction.Delete}
                a={SubjectName.Programs}
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
    [t, navigate, deleteProgram, isDeleting],
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
      ariaLabel="Programs table"
      isLoading={isLoading}
      footer={<FooterTable page={page} take={take} total={total} />}
    />
  );
}
