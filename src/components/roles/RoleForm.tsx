import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextField,
} from '@heroui/react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { CreateEditRoleFormData } from '@/schemas/role';

import { RoleStatus } from '@/types/role';

import PermissionSelector from './PermissionSelector';

type RoleFormProps = {
  form: UseFormReturn<CreateEditRoleFormData>;
  onSubmit: (data: CreateEditRoleFormData) => void;
  isSubmitting?: boolean;
};

const RoleForm = ({ form, onSubmit, isSubmitting }: RoleFormProps) => {
  const { t } = useTranslation();

  const statusItems = [
    { label: t('status.active'), value: RoleStatus.ACTIVE },
    { label: t('status.inactive'), value: RoleStatus.INACTIVE },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.name}
          >
            <Label>{t('form.name')}</Label>
            <Input ref={field.ref} />
            <FieldError>{errors.name?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        name="code"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.code}
          >
            <Label>{t('form.code')}</Label>
            <Input ref={field.ref} />
            <FieldError>{errors.code?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            fullWidth
            selectedKey={field.value}
            onSelectionChange={(key) => {
              if (key == null) return;
              field.onChange(key as RoleStatus);
            }}
            isInvalid={!!errors.status}
          >
            <Label>{t('form.status')}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {statusItems.map((item) => (
                  <ListBox.Item
                    key={item.value}
                    id={item.value}
                    textValue={item.label}
                  >
                    {item.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
            <FieldError>{errors.status?.message}</FieldError>
          </Select>
        )}
      />
      <Controller
        name="canAccessCms"
        control={control}
        render={({ field }) => (
          <Switch
            isSelected={field.value}
            onChange={field.onChange}
            className="inline-flex w-full max-w-full flex-row-reverse items-center justify-between"
          >
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Content>
              <Label className="text-sm">{t('form.canAccessCms')}</Label>
            </Switch.Content>
          </Switch>
        )}
      />

      <PermissionSelector control={control} />
      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary" isPending={isSubmitting}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
