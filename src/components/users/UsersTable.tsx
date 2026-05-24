import type { SortingState } from '@tanstack/react-table';

import { AlertDialog, Avatar, Button, Chip, Dropdown } from '@heroui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuEllipsisVertical, LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import type { User } from '@/types/user';

import MyButton from '@/components/shared/Button';
import FooterTable from '@/components/shared/table/FooterTable';
import TanstackTable from '@/components/shared/table/TanstackTable';
import { useCan } from '@/configs/casl/can.config';
import { useDeleteUser } from '@/hooks/apis/users';
import { PermissionAction, SubjectName } from '@/types/auth';
import { formatDateTime } from '@/utils/datetime';
import { toSortDescriptor, toSortingState } from '@/utils/table';

import AuditItem from '../shared/AuditItem';
import GenderChip from '../shared/GenderChip';

const columnHelper = createColumnHelper<User>();

type UserActionsCellProps = {
  row: { original: User };
  navigate: ReturnType<typeof useNavigate>;
  deleteUser: (ids: string[]) => void;
  isDeleting: boolean;
  t: ReturnType<typeof useTranslation>['t'];
};

function UserActionsCell({
  row,
  navigate,
  deleteUser,
  isDeleting,
  t,
}: UserActionsCellProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const ability = useCan();

  const handleDelete = () => {
    deleteUser([row.original.id]);
    setDeleteOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden items-center gap-2 md:flex">
        <MyButton
          I={PermissionAction.Read}
          a={SubjectName.Users}
          isIconOnly
          size="sm"
          variant="outline"
          onPress={() => navigate(`/users/${row.original.id}`)}
        >
          <LuEye className="size-4" />
        </MyButton>
        <MyButton
          I={PermissionAction.Update}
          a={SubjectName.Users}
          isIconOnly
          size="sm"
          variant="outline"
          onPress={() => navigate(`/users/${row.original.id}/edit`)}
        >
          <LuPencil className="size-4" />
        </MyButton>
        <MyButton
          I={PermissionAction.Delete}
          a={SubjectName.Users}
          isIconOnly
          size="sm"
          variant="outline"
          isDisabled={isDeleting}
          onPress={() => setDeleteOpen(true)}
        >
          <LuTrash2 className="text-danger size-4" />
        </MyButton>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Dropdown>
          <Button isIconOnly size="sm" variant="tertiary">
            <LuEllipsisVertical className="size-4" />
          </Button>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu aria-label={t('common.actions')}>
              {ability.can(PermissionAction.Read, SubjectName.Users) && (
                <Dropdown.Item
                  id="view"
                  textValue={t('common.view')}
                  onPress={() => navigate(`/users/${row.original.id}`)}
                >
                  <span className="flex items-center gap-2">
                    <LuEye className="size-4" />
                    {t('common.view')}
                  </span>
                </Dropdown.Item>
              )}
              {ability.can(PermissionAction.Update, SubjectName.Users) && (
                <Dropdown.Item
                  id="edit"
                  textValue={t('common.edit')}
                  onPress={() => navigate(`/users/${row.original.id}/edit`)}
                >
                  <span className="flex items-center gap-2">
                    <LuPencil className="size-4" />
                    {t('common.edit')}
                  </span>
                </Dropdown.Item>
              )}
              {ability.can(PermissionAction.Delete, SubjectName.Users) && (
                <Dropdown.Item
                  id="delete"
                  textValue={t('common.delete')}
                  className="text-danger"
                  isDisabled={isDeleting}
                  onPress={() => setDeleteOpen(true)}
                >
                  <span className="flex items-center gap-2">
                    <LuTrash2 className="size-4" />
                    {t('common.delete')}
                  </span>
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      <AlertDialog isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Backdrop isDismissable />
        <AlertDialog.Container size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>
                {t('cmsUsers.deleteTitle')}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-muted text-sm">
                {t('cmsUsers.deleteConfirm', { name: row.original.email })}
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                size="sm"
                variant="tertiary"
                onPress={() => setDeleteOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                isDisabled={isDeleting}
                onPress={handleDelete}
              >
                {t('common.delete')}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog>
    </>
  );
}

interface UsersTableProps {
  data: User[];
  isLoading?: boolean;
  page?: number;
  take?: number;
  total?: number;
}

export default function UsersTable({
  data,
  isLoading,
  page,
  take,
  total,
}: UsersTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'user',
        header: t('cmsUsers.table.email'),
        cell: (info) => {
          const { firstName, lastName, email, avatar } = info.row.original;
          const fullName = [firstName, lastName].filter(Boolean).join(' ');
          const firstInitial = firstName?.charAt(0) ?? '';
          const lastInitial = lastName?.charAt(0) ?? '';
          const fallbackInitials = (
            firstInitial + lastInitial || 'ME'
          ).toUpperCase();
          const fallbackName = fullName || email || 'MyEnglish User';

          return (
            <div className="flex gap-2">
              <Avatar className="rounded-2xl" variant="soft" color="accent">
                <Avatar.Image alt={fallbackName} src={avatar} />
                <Avatar.Fallback className="rounded-2xl">
                  {fallbackInitials}
                </Avatar.Fallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{fallbackName}</p>
                <p className="text-xs text-gray-500">{email ?? ''}</p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('role', {
        enableSorting: false,
        header: t('cmsUsers.table.role'),
        cell: (info) => info.getValue()?.name ?? '-',
      }),
      columnHelper.accessor('phone', {
        enableSorting: false,
        header: t('cmsUsers.table.phone'),
        cell: (info) => info.getValue() ?? '-',
      }),
      columnHelper.accessor('dateOfBirth', {
        enableSorting: false,
        header: t('cmsUsers.table.dateOfBirth'),
        cell: (info) => formatDateTime(info.getValue()),
      }),
      columnHelper.accessor('gender', {
        enableSorting: false,
        header: t('cmsUsers.table.gender'),
        cell: (info) => {
          const gender = info.getValue();
          if (!gender) return '-';

          return <GenderChip gender={gender} />;
        },
      }),
      columnHelper.accessor('emailVerified', {
        enableSorting: false,
        header: t('cmsUsers.table.emailVerified'),
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
          <UserActionsCell
            row={row}
            navigate={navigate}
            deleteUser={deleteUser}
            isDeleting={isDeleting}
            t={t}
          />
        ),
      }),
    ],
    [t, navigate, deleteUser, isDeleting],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    initialState: {
      columnPinning: { right: ['actions'] },
    },
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  return (
    <TanstackTable
      table={table}
      sortDescriptor={sortDescriptor}
      onSortChange={(d) => setSorting(toSortingState(d))}
      ariaLabel="CMS Users table"
      isLoading={isLoading}
      footer={<FooterTable page={page} take={take} total={total} />}
    />
  );
}
