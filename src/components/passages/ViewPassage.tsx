import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LuPencil } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import MyButton from '@/components/shared/Button';
import { useGetPassageById } from '@/hooks/apis/passages';
import { PermissionAction, SubjectName } from '@/types/auth';
import { MarkedBy } from '@/types/common';

import AuditItem from '../shared/AuditItem';
import { statusColorMap } from './constants';
import PassageSkeleton from './Skeleton';

type ViewPassageProps = {
  id: string;
};

const getParagraphPrefix = (index: number, markedBy?: MarkedBy) => {
  if (markedBy === MarkedBy.ALPHABET) {
    return `${String.fromCharCode(65 + index)}.`;
  }

  if (markedBy === MarkedBy.NUMBER) {
    return `${index + 1}.`;
  }

  return '';
};

const ViewPassage = ({ id }: ViewPassageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: passage, isLoading } = useGetPassageById(id);

  if (isLoading) return <PassageSkeleton />;

  if (!passage) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('passages.form.title')}</span>
        <span className="text-base">{passage.title ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('passages.form.subtitle')}</span>
        <span className="text-base">{passage.subtitle ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">
          {t('passages.form.markedBy.label')}
        </span>
        <span className="text-base">{passage.markedBy ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('passages.form.status')}</span>
        {passage.status && (
          <div>
            <Chip
              color={statusColorMap[passage.status]}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{passage.status}</Chip.Label>
            </Chip>
          </div>
        )}
      </div>

      <div>
        <span className="text-sm font-bold">{t('common.createdBy')}</span>
        <AuditItem
          user={passage.auditMetadata?.createdBy}
          dateTime={passage.auditMetadata?.createdAt}
        />
      </div>

      <div>
        <span className="text-sm font-bold">{t('common.updatedBy')}</span>
        <AuditItem
          user={passage.auditMetadata?.updatedBy}
          dateTime={passage.auditMetadata?.updatedAt}
        />
      </div>

      {passage.paragraphs && passage.paragraphs.length > 0 && (
        <div className="col-span-2 flex flex-col gap-2">
          <span className="text-sm font-bold">
            {t('passages.form.paragraphs')}
          </span>
          <div className="flex flex-col gap-2">
            {passage?.paragraphs?.map(({ id, content }, index) => (
              <p className="text-justify" key={id}>
                <span className="font-bold">
                  {getParagraphPrefix(index, passage.markedBy)}{' '}
                </span>
                <span>{content}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="col-span-2 flex justify-end gap-2">
        <Button variant="outline" onPress={() => navigate('/passages')}>
          {t('common.back')}
        </Button>
        <MyButton
          I={PermissionAction.Update}
          a={SubjectName.Passages}
          variant="primary"
          onPress={() => navigate(`/passages/${id}/edit`)}
        >
          <LuPencil className="size-4" />
          {t('common.edit')}
        </MyButton>
      </div>
    </div>
  );
};

export default ViewPassage;
