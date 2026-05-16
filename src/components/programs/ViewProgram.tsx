import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LuPencil } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import MyButton from '@/components/shared/Button';
import DetailField, { InfoCard } from '@/components/shared/DetailField';
import { useGetProgramById } from '@/hooks/apis/programs';
import { PermissionAction, SubjectName } from '@/types/auth';

import AuditItem from '../shared/AuditItem';
import { statusColorMap } from './constants';
import ProgramSkeleton from './Skeleton';

type ViewProgramProps = {
  id: string;
};

const ViewProgram = ({ id }: ViewProgramProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: program, isLoading } = useGetProgramById(id);

  if (isLoading) return <ProgramSkeleton />;
  if (!program) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-default-50/60 flex items-center gap-4 rounded-xl border p-5">
        <div className="min-w-0 flex-1">
          <p className="text-default-900 text-base font-semibold">
            {program.name || '-'}
          </p>
          <p className="text-default-400 font-mono text-xs">{program.code}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {program.status && (
            <Chip
              color={statusColorMap[program.status]}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{program.status}</Chip.Label>
            </Chip>
          )}
        </div>
      </div>

      <InfoCard title={t('common.basicInfo')}>
        <DetailField label={t('programs.form.code')}>
          <span className="font-mono text-sm">{program.code ?? ''}</span>
        </DetailField>
        <DetailField label={t('programs.form.name')}>
          {program.name ?? ''}
        </DetailField>
        <DetailField label={t('programs.form.status')}>
          {program.status ?? ''}
        </DetailField>
        <DetailField label={t('programs.form.description')} span="full">
          {program.description ?? ''}
        </DetailField>
      </InfoCard>

      <InfoCard title={t('common.audit')}>
        <DetailField label={t('common.createdBy')}>
          <AuditItem
            user={program.auditMetadata?.createdBy}
            dateTime={program.auditMetadata?.createdAt}
          />
        </DetailField>
        <DetailField label={t('common.updatedBy')}>
          <AuditItem
            user={program.auditMetadata?.updatedBy}
            dateTime={program.auditMetadata?.updatedAt}
          />
        </DetailField>
      </InfoCard>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onPress={() => navigate('/programs')}>
          {t('common.back')}
        </Button>
        <MyButton
          I={PermissionAction.Update}
          a={SubjectName.Programs}
          variant="primary"
          onPress={() => navigate(`/programs/${id}/edit`)}
        >
          <LuPencil className="size-4" />
          {t('common.edit')}
        </MyButton>
      </div>
    </div>
  );
};

export default ViewProgram;
