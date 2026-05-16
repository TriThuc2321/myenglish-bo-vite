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

import type { Campus } from '@/types/campus';

import AuditItem from '@/components/shared/AuditItem';
import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import ConfirmWrapper from '@/configs/ConfirmWrapper';
import { useDeleteCampus } from '@/hooks/apis/campuses';
import { PermissionAction, SubjectName } from '@/types/auth';

import { statusColorMap } from './constants';

const columnHelper = createColumnHelper<Campus>();

interface CampusesTableProps {
  data: Campus[];
  isLoading?: boolean;
  page?: number;
  take?: number;
  total?: number;
}

export default function CampusesTable({
  data,
  isLoading,
  page,
  take,
  total,
}: CampusesTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteCampus, isPending: isDeleting } = useDeleteCampus();

  const columns = useMemo(
    () => [
      columnHelper.accessor('code', {
        enableSorting: false,
        header: t('campuses.table.code'),
      }),
      columnHelper.accessor('name', {
        enableSorting: false,
        header: t('campuses.table.name'),
      }),
      columnHelper.accessor('address', {
        enableSorting: false,
        header: t('campuses.table.address'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor('phone', {
        enableSorting: false,
        header: t('campuses.table.phone'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor('status', {
        enableSorting: false,
        header: t('campuses.table.status'),
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
              a={SubjectName.Campuses}
              isIconOnly
              variant="outline"
              size="sm"
              onPress={() => navigate(`/campuses/${row.original.id}`)}
            >
              <LuEye className="size-4" />
            </MyButton>
            <MyButton
              I={PermissionAction.Update}
              a={SubjectName.Campuses}
              isIconOnly
              size="sm"
              variant="outline"
              onPress={() => navigate(`/campuses/${row.original.id}/edit`)}
            >
              <LuPencil className="size-4" />
            </MyButton>
            <ConfirmWrapper
              title={t('campuses.deleteTitle')}
              description={t('campuses.deleteConfirm', {
                name: row.original.code,
              })}
              confirmText={t('common.delete')}
              onConfirm={() => deleteCampus([row.original.id])}
            >
              <MyButton
                I={PermissionAction.Delete}
                a={SubjectName.Campuses}
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
    [t, navigate, deleteCampus, isDeleting],
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
      ariaLabel="Campuses table"
      isLoading={isLoading}
      footer={<FooterTable page={page} take={take} total={total} />}
    />
  );
}
