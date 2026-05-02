import type { ITableColumn } from '@/components/shared/table/CustomTable';
import type { Audit } from '@/types/common';

import AuditItem from '@/components/shared/AuditItem';

export const AUDIT_COLUMNS = <
  T extends { auditMetadata?: Audit },
>(): ITableColumn<T>[] => [
  {
    title: 'Created by',
    colKey: 'auditCreated',
    colWidth: 150,
    render: (_, record) => {
      const { createdAt, createdBy } = record.auditMetadata || {};

      return <AuditItem user={createdBy} dateTime={createdAt} />;
    },
  },
  {
    title: 'Updated by',
    colKey: 'auditEdited',
    colWidth: 150,
    render: (_, record) => {
      const { updatedAt, updatedBy } = record.auditMetadata || {};

      return updatedAt ? (
        <AuditItem user={updatedBy} dateTime={updatedAt} />
      ) : null;
    },
  },
];
