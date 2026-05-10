import { TeacherStatus } from '@/types/teacher';

export const statusColorMap: Record<
  TeacherStatus,
  'success' | 'warning' | 'default'
> = {
  [TeacherStatus.ACTIVE]: 'success',
  [TeacherStatus.INACTIVE]: 'warning',
  [TeacherStatus.DELETED]: 'default',
};
