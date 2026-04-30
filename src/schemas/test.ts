import * as yup from 'yup';

import { VALIDATION_MESSAGE } from './message';

export const createEditTestSchema = yup.object().shape({
  title: yup.string().required(VALIDATION_MESSAGE.REQUIRED),
  code: yup.string().required(VALIDATION_MESSAGE.REQUIRED),
});

export type CreateEditTestFormData = yup.InferType<typeof createEditTestSchema>;
