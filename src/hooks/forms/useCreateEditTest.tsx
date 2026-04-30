import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import type { CreateEditTestFormData } from '@/schemas/test';

import { createEditTestSchema } from '@/schemas/test';

interface IUseCreateEditTestForm {
  defaultValues?: Partial<CreateEditTestFormData>;
}
const useCreateEditTestForm = (
  prop: IUseCreateEditTestForm = { defaultValues: undefined },
) =>
  useForm<CreateEditTestFormData>({
    resolver: yupResolver(createEditTestSchema),
    defaultValues: prop.defaultValues,
  });

export default useCreateEditTestForm;
