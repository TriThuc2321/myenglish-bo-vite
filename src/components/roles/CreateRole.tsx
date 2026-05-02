import { useNavigate } from 'react-router';

import type { CreateEditRoleFormData } from '@/schemas/role';

import { useCreateRole } from '@/hooks/apis/roles';
import useCreateEditRoleForm from '@/hooks/forms/useCreateEditRole';
import { RoleStatus } from '@/types/role';

import RoleForm from './RoleForm';

const CreateRole = () => {
  const navigate = useNavigate();
  const { mutateAsync: createRole, isPending: isCreating } = useCreateRole();

  const form = useCreateEditRoleForm({
    defaultValues: {
      name: '',
      code: '',
      status: RoleStatus.ACTIVE,
      canAccessCms: false,
      permissionIds: [],
    },
  });

  const onSubmit = async (payload: CreateEditRoleFormData) => {
    try {
      await createRole(payload);
      navigate('/roles');
    } catch (error) {
      console.error(error);
    }
  };

  return <RoleForm form={form} onSubmit={onSubmit} isSubmitting={isCreating} />;
};

export default CreateRole;
