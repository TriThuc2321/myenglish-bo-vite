import { CampusStatus } from '@/types/campus';

export const statusColorMap: Record<
  CampusStatus,
  'success' | 'warning' | 'default'
> = {
  [CampusStatus.ACTIVE]: 'success',
  [CampusStatus.INACTIVE]: 'warning',
  [CampusStatus.DELETED]: 'default',
};
