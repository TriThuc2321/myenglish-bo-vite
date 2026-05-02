import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import type { CreateEditRoleFormData } from '@/schemas/role';

import { useGetPermissions } from '@/hooks/apis/permissions';
import { useEditRole, useGetRoleById } from '@/hooks/apis/roles';
import useCreateEditRoleForm from '@/hooks/forms/useCreateEditRole';
import { RoleStatus } from '@/types/role';

import RoleForm from './RoleForm';
import RoleSkeleton from './Skeleton';

type EditRoleProps = {
  id: string;
};

const EditRole = ({ id }: EditRoleProps) => {
  const navigate = useNavigate();
  const { mutateAsync: editRole, isPending: isEditing } = useEditRole();

  const { data: roleData, isLoading: isLoadingRole } = useGetRoleById(id);
  const { data: allPermissions } = useGetPermissions();

  // Map permissions to permission IDs
  const permissionIds = useMemo(() => {
    if (!roleData?.permissions || !allPermissions) return [];

    // Match role permissions with full permission list to get IDs
    return allPermissions
      .filter((permission) =>
        roleData.permissions.some(
          (rp) =>
            rp.action === permission.action &&
            rp.subject === permission.subject,
        ),
      )
      .map((p) => p.id);
  }, [roleData?.permissions, allPermissions]);

  const form = useCreateEditRoleForm({
    defaultValues: {
      name: roleData?.name ?? '',
      code: roleData?.code ?? '',
      status: roleData?.status ?? RoleStatus.ACTIVE,
      canAccessCms: roleData?.canAccessCms ?? false,
      permissionIds: [],
    },
  });

  // Update form when permission IDs are calculated
  useEffect(() => {
    if (permissionIds.length > 0) {
      form.setValue('permissionIds', permissionIds);
    }
  }, [permissionIds, form]);

  // Update form when role data changes
  useEffect(() => {
    if (roleData) {
      form.reset({
        name: roleData.name,
        code: roleData.code,
        status: roleData.status,
        canAccessCms: roleData.canAccessCms,
        permissionIds,
      });
    }
  }, [roleData, permissionIds, form]);

  const onSubmit = async (payload: CreateEditRoleFormData) => {
    try {
      await editRole({ id, ...payload });
      navigate('/roles');
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoadingRole) {
    return <RoleSkeleton />;
  }

  return <RoleForm form={form} onSubmit={onSubmit} isSubmitting={isEditing} />;
};

export default EditRole;
