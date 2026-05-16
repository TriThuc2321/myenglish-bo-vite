import { ProgramStatus } from '@/types/program';

export const statusColorMap: Record<
  ProgramStatus,
  'success' | 'warning' | 'default'
> = {
  [ProgramStatus.ACTIVE]: 'success',
  [ProgramStatus.INACTIVE]: 'warning',
  [ProgramStatus.DELETED]: 'default',
};
