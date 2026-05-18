import { StudentSegment, StudentStatus } from '@/types/student';

export const statusColorMap: Record<
  StudentStatus,
  'success' | 'warning' | 'default'
> = {
  [StudentStatus.ACTIVE]: 'success',
  [StudentStatus.INACTIVE]: 'warning',
  [StudentStatus.DELETED]: 'default',
};

export const segmentColorMap: Record<
  StudentSegment,
  'success' | 'warning' | 'danger' | 'accent' | 'default'
> = {
  [StudentSegment.KIDS]: 'accent',
  [StudentSegment.TEENS]: 'success',
  [StudentSegment.UNI]: 'warning',
  [StudentSegment.ADULT]: 'danger',
};
