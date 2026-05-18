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

import type { Student } from '@/types/student';

import AuditItem from '@/components/shared/AuditItem';
import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import ConfirmWrapper from '@/configs/ConfirmWrapper';
import { useDeleteStudent } from '@/hooks/apis/students';
import { PermissionAction, SubjectName } from '@/types/auth';
import { formatDateTime } from '@/utils/datetime';

import { segmentColorMap, statusColorMap } from './constants';

const columnHelper = createColumnHelper<Student>();

interface StudentsTableProps {
  data: Student[];
  isLoading?: boolean;
  page?: number;
  take?: number;
  total?: number;
}

export default function StudentsTable({
  data,
  isLoading,
  page,
  take,
  total,
}: StudentsTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  const columns = useMemo(
    () => [
      columnHelper.accessor('studentCode', {
        enableSorting: false,
        header: t('students.table.studentCode'),
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue() ?? '-'}</span>
        ),
      }),
      columnHelper.accessor(
        (row) =>
          [row.user?.firstName, row.user?.lastName].filter(Boolean).join(' ') ||
          null,
        {
          id: 'fullName',
          enableSorting: false,
          header: t('students.table.fullName'),
          cell: (info) => info.getValue() ?? '-',
        },
      ),
      columnHelper.accessor('segment', {
        enableSorting: false,
        header: t('students.table.segment'),
        cell: (info) => {
          const value = info.getValue();
          if (!value) return '-';
          return (
            <Chip color={segmentColorMap[value]} size="sm" variant="soft">
              <Chip.Label>{value}</Chip.Label>
            </Chip>
          );
        },
      }),
      columnHelper.accessor('entryLevelCode', {
        enableSorting: false,
        header: t('students.table.entryLevel'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor((row) => row.user?.phone, {
        id: 'phone',
        enableSorting: false,
        header: t('students.table.phone'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor((row) => row.user?.email, {
        id: 'email',
        enableSorting: false,
        header: t('students.table.email'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor((row) => row.user?.dateOfBirth, {
        id: 'dateOfBirth',
        enableSorting: false,
        header: t('students.table.dob'),
        cell: (info) => formatDateTime(info.getValue() ?? undefined),
      }),
      columnHelper.accessor('status', {
        enableSorting: false,
        header: t('students.table.status'),
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
              a={SubjectName.Students}
              isIconOnly
              variant="outline"
              size="sm"
              onPress={() => navigate(`/students/${row.original.id}`)}
            >
              <LuEye className="size-4" />
            </MyButton>
            <MyButton
              I={PermissionAction.Update}
              a={SubjectName.Students}
              isIconOnly
              size="sm"
              variant="outline"
              onPress={() => navigate(`/students/${row.original.id}/edit`)}
            >
              <LuPencil className="size-4" />
            </MyButton>
            <ConfirmWrapper
              title={t('students.deleteTitle')}
              description={t('students.deleteConfirm', {
                name: row.original.user?.firstName ?? row.original.studentCode,
              })}
              confirmText={t('common.delete')}
              onConfirm={() => deleteStudent([row.original.id])}
            >
              <MyButton
                I={PermissionAction.Delete}
                a={SubjectName.Students}
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
    [t, navigate, deleteStudent, isDeleting],
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
      ariaLabel="Students table"
      isLoading={isLoading}
      footer={<FooterTable page={page} take={take} total={total} />}
    />
  );
}
