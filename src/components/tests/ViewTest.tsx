import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LuPencil } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import MyButton from '@/components/shared/Button';
import DetailField, { InfoCard } from '@/components/shared/DetailField';
import { useGetTestById } from '@/hooks/apis/tests';
import { PermissionAction, SubjectName } from '@/types/auth';

import AuditItem from '../shared/AuditItem';
import {
  publishStatusColorMap,
  skillColorMap,
  testTypeColorMap,
} from './constants';
import TestSkeleton from './Skeleton';

type ViewTestProps = {
  id: string;
};

const ViewTest = ({ id }: ViewTestProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: test, isLoading } = useGetTestById(id);

  if (isLoading) return <TestSkeleton />;
  if (!test) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-default-50/60 flex items-start gap-4 rounded-xl border p-5">
        <div className="min-w-0 flex-1">
          <p className="text-default-900 text-base font-semibold">
            {test.title ?? '-'}
          </p>
          <p className="text-default-400 font-mono text-xs">{test.code}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {test.publishStatus && (
            <Chip
              size="sm"
              variant="soft"
              color={publishStatusColorMap[test.publishStatus]}
            >
              <Chip.Label>{test.publishStatus}</Chip.Label>
            </Chip>
          )}
          {test.skill && (
            <Chip size="sm" variant="soft" color={skillColorMap[test.skill]}>
              <Chip.Label>{test.skill}</Chip.Label>
            </Chip>
          )}
        </div>
      </div>

      <InfoCard title={t('common.basicInfo')}>
        <DetailField label={t('tests.table.code')}>
          <span className="font-mono text-sm">{test.code ?? ''}</span>
        </DetailField>
        <DetailField label={t('tests.table.skill')}>
          {test.skill ? (
            <Chip size="sm" variant="soft" color={skillColorMap[test.skill]}>
              <Chip.Label>{test.skill}</Chip.Label>
            </Chip>
          ) : (
            '-'
          )}
        </DetailField>
        <DetailField label={t('tests.table.type')}>
          {test.type ? (
            <Chip size="sm" variant="soft" color={testTypeColorMap[test.type]}>
              <Chip.Label>{test.type}</Chip.Label>
            </Chip>
          ) : (
            '-'
          )}
        </DetailField>
        <DetailField label={t('tests.table.band')}>
          {test.band ?? '-'}
        </DetailField>
        <DetailField label={t('tests.table.durationMin')}>
          {test.durationMin != null ? `${test.durationMin} min` : '-'}
        </DetailField>
        <DetailField label={t('tests.table.totalQuestions')}>
          {test.totalQuestions ?? '-'}
        </DetailField>
        <DetailField label={t('tests.table.publishStatus')}>
          {test.publishStatus ? (
            <Chip
              size="sm"
              variant="soft"
              color={publishStatusColorMap[test.publishStatus]}
            >
              <Chip.Label>{test.publishStatus}</Chip.Label>
            </Chip>
          ) : (
            '-'
          )}
        </DetailField>
        <DetailField label={t('tests.table.sectionCount')}>
          {test.sectionCount ?? '-'}
        </DetailField>
        <DetailField label={t('tests.table.attempts')}>
          {test.attempts ?? '-'}
        </DetailField>
        <DetailField label={t('tests.table.avgBand')}>
          {test.avgBand != null ? test.avgBand : '-'}
        </DetailField>
      </InfoCard>

      <InfoCard title={t('common.audit')}>
        <DetailField label={t('common.createdBy')}>
          <AuditItem
            user={test.auditMetadata?.createdBy}
            dateTime={test.auditMetadata?.createdAt}
          />
        </DetailField>
        <DetailField label={t('common.updatedBy')}>
          <AuditItem
            user={test.auditMetadata?.updatedBy}
            dateTime={test.auditMetadata?.updatedAt}
          />
        </DetailField>
      </InfoCard>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onPress={() => navigate('/tests')}>
          {t('common.back')}
        </Button>
        <MyButton
          I={PermissionAction.Update}
          a={SubjectName.Tests}
          variant="primary"
          onPress={() => navigate(`/tests/${id}/edit`)}
        >
          <LuPencil className="size-4" />
          {t('common.edit')}
        </MyButton>
      </div>
    </div>
  );
};

export default ViewTest;
