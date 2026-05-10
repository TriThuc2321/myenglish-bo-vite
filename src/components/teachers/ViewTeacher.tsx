import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { LuPencil } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import MyButton from '@/components/shared/Button';
import { useGetTeacherById } from '@/hooks/apis/teachers';
import { PermissionAction, SubjectName } from '@/types/auth';
import { formatDateTime } from '@/utils/datetime';

import AuditItem from '../shared/AuditItem';
import { statusColorMap } from './constants';
import TeacherSkeleton from './Skeleton';

type ViewTeacherProps = {
  id: string;
};

const ViewTeacher = ({ id }: ViewTeacherProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: teacher, isLoading } = useGetTeacherById(id);

  if (isLoading) return <TeacherSkeleton />;
  if (!teacher) return null;

  const fullName = [teacher.user?.firstName, teacher.user?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('teachers.table.code')}</span>
        <span className="text-base">{teacher.code ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">
          {t('teachers.table.nationality')}
        </span>
        <span className="text-base">{teacher.nationality ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('teachers.table.status')}</span>
        {teacher.status && (
          <div>
            <Chip
              color={statusColorMap[teacher.status]}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{teacher.status}</Chip.Label>
            </Chip>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('teachers.table.name')}</span>
        <span className="text-base">{fullName || '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.email')}</span>
        <span className="text-base">{teacher.user?.email ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.phone')}</span>
        <span className="text-base">{teacher.user?.phone ?? '-'}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">
          {t('cmsUsers.form.dateOfBirth')}
        </span>
        <span className="text-base">
          {formatDateTime(teacher.user?.dateOfBirth ?? undefined)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.gender')}</span>
        <span className="text-base">{teacher.user?.gender ?? '-'}</span>
      </div>

      <div className="col-span-2 flex flex-col gap-1">
        <span className="text-sm font-bold">{t('cmsUsers.form.address')}</span>
        <span className="text-base">{teacher.user?.address ?? '-'}</span>
      </div>

      {teacher.user?.avatar && (
        <div className="col-span-2 flex flex-col gap-1">
          <span className="text-sm font-bold">{t('cmsUsers.form.avatar')}</span>
          <img
            src={teacher.user.avatar}
            alt="avatar"
            className="h-16 w-16 rounded-full object-cover"
          />
        </div>
      )}

      <div>
        <span className="text-sm font-bold">{t('common.createdBy')}</span>
        <AuditItem
          user={teacher.auditMetadata?.createdBy}
          dateTime={teacher.auditMetadata?.createdAt}
        />
      </div>

      <div>
        <span className="text-sm font-bold">{t('common.updatedBy')}</span>
        <AuditItem
          user={teacher.auditMetadata?.updatedBy}
          dateTime={teacher.auditMetadata?.updatedAt}
        />
      </div>

      {teacher.skills && teacher.skills.length > 0 && (
        <div className="col-span-2 flex flex-col gap-2">
          <span className="text-sm font-bold">{t('teachers.form.skills')}</span>
          <div className="flex flex-col gap-2">
            {teacher.skills.map((skill) => (
              <div
                key={skill.id}
                className="flex gap-3 rounded-lg border p-3 text-sm"
              >
                <span>{skill.level}</span>
                {skill.skillArea && <span>· {skill.skillArea}</span>}
                {skill.targetAudience && <span>· {skill.targetAudience}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {teacher.certificates && teacher.certificates.length > 0 && (
        <div className="col-span-2 flex flex-col gap-2">
          <span className="text-sm font-bold">
            {t('teachers.form.certificates')}
          </span>
          <div className="flex flex-col gap-2">
            {teacher.certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col gap-1 rounded-lg border p-3 text-sm"
              >
                <span className="font-medium">{cert.name}</span>
                {cert.issuer && <span>{cert.issuer}</span>}
                {cert.score && (
                  <span>
                    {t('teachers.form.certScore')}: {cert.score}
                  </span>
                )}
                {cert.issueDate && (
                  <span>
                    {t('teachers.form.certIssueDate')}:{' '}
                    {formatDateTime(cert.issueDate)}
                  </span>
                )}
                {cert.expiryDate && (
                  <span>
                    {t('teachers.form.certExpiryDate')}:{' '}
                    {formatDateTime(cert.expiryDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="col-span-2 flex justify-end gap-2">
        <Button variant="outline" onPress={() => navigate('/teachers')}>
          {t('common.back')}
        </Button>
        <MyButton
          I={PermissionAction.Update}
          a={SubjectName.Teachers}
          variant="primary"
          onPress={() => navigate(`/teachers/${id}/edit`)}
        >
          <LuPencil className="size-4" />
          {t('common.edit')}
        </MyButton>
      </div>
    </div>
  );
};

export default ViewTeacher;
