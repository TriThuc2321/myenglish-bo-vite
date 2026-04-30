import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import type { CreateEditRoleFormData } from '@/schemas/role';

import { createEditRoleSchema } from '@/schemas/role';

interface IUseCreateEditRoleForm {
  defaultValues?: Partial<CreateEditRoleFormData>;
}

const useCreateEditRoleForm = (
  prop: IUseCreateEditRoleForm = { defaultValues: undefined },
) =>
  useForm<CreateEditRoleFormData>({
    resolver: yupResolver(createEditRoleSchema),
    defaultValues: prop.defaultValues,
  });

export default useCreateEditRoleForm;
