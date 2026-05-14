import { SkillArea, TeacherStatus } from '@/types/teacher';

export const statusColorMap: Record<
  TeacherStatus,
  'success' | 'warning' | 'default'
> = {
  [TeacherStatus.ACTIVE]: 'success',
  [TeacherStatus.INACTIVE]: 'warning',
  [TeacherStatus.DELETED]: 'default',
};

export const skillAreaColorMap: Record<
  SkillArea,
  'success' | 'warning' | 'danger' | 'accent' | 'default'
> = {
  [SkillArea.IELTS]: 'accent',
  [SkillArea.TOEIC]: 'danger',
  [SkillArea.SPEAKING]: 'success',
  [SkillArea.GRAMMAR]: 'warning',
  [SkillArea.GENERAL]: 'default',
};
