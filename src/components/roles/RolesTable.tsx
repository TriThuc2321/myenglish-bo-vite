import type { SortDescriptor } from '@heroui/react';
import type { SortingState } from '@tanstack/react-table';

import { Chip } from '@heroui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import type { Role } from '@/types/role';

import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import ConfirmWrapper from '@/configs/ConfirmWrapper';
import { useDeleteRole } from '@/hooks/apis/roles';
import { PermissionAction, SubjectName } from '@/types/auth';
import { RoleStatus } from '@/types/role';

const statusColorMap: Record<RoleStatus, 'success' | 'danger' | 'default'> = {
  [RoleStatus.ACTIVE]: 'success',
  [RoleStatus.INACTIVE]: 'danger',
  [RoleStatus.DELETED]: 'default',
};

function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
  const first = sorting[0];
  if (!first) return undefined;
  return {
    column: first.id,
    direction: first.desc ? 'descending' : 'ascending',
  };
}

function toSortingState(descriptor: SortDescriptor): SortingState {
  return [
    {
      id: descriptor.column as string,
      desc: descriptor.direction === 'descending',
    },
  ];
}

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
  const navigate = useNavigate();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('code', { header: 'Code' }),
      columnHelper.accessor('status', {
        header: 'Status',
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
        header: 'CMS Access',
        cell: (info) => (
          <Chip
            color={info.getValue() ? 'success' : 'default'}
            size="sm"
            variant="soft"
          >
            {info.getValue() ? 'Yes' : 'No'}
          </Chip>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
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
              title="Delete role"
              description={`Are you sure you want to delete "${row.original.name}"?`}
              confirmText="Delete"
              onConfirm={() => deleteRole([String(row.original.id)])}
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
    [navigate, deleteRole, isDeleting],
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
