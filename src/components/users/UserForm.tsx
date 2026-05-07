import type { DateValue } from '@internationalized/date';

import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { CreateEditUserFormData } from '@/schemas/user';

import { useGetRoles } from '@/hooks/apis/roles';
import { Gender } from '@/types/common';

type UserFormProps = {
  form: UseFormReturn<CreateEditUserFormData>;
  onSubmit: (data: CreateEditUserFormData) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  isEditing?: boolean;
};

const UserForm = ({
  form,
  onSubmit,
  isSubmitting,
  onCancel,
  isEditing,
}: UserFormProps) => {
  const { t } = useTranslation();
  const { data: rolesData } = useGetRoles({ take: 1000 });
  const roles = rolesData?.data ?? [];

  const genderItems = [
    { label: t('cmsUsers.form.genderMale'), value: Gender.MALE },
    { label: t('cmsUsers.form.genderFemale'), value: Gender.FEMALE },
    { label: t('cmsUsers.form.genderOther'), value: Gender.OTHER },
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
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.email}
            isDisabled={isEditing}
          >
            <Label>{t('cmsUsers.form.email')}</Label>
            <Input ref={field.ref} variant="secondary" />
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.firstName}
          >
            <Label>{t('cmsUsers.form.firstName')}</Label>
            <Input ref={field.ref} variant="secondary" />
            <FieldError>{errors.firstName?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.lastName}
          >
            <Label>{t('cmsUsers.form.lastName')}</Label>
            <Input ref={field.ref} variant="secondary" />
            <FieldError>{errors.lastName?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        name="roleId"
        control={control}
        render={({ field }) => (
          <Select
            variant="secondary"
            fullWidth
            selectedKey={field.value != null ? String(field.value) : null}
            onSelectionChange={(key) => {
              if (key == null) return;
              field.onChange(Number(key));
            }}
            isInvalid={!!errors.roleId}
          >
            <Label>{t('cmsUsers.form.role')}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {roles.map((role) => (
                  <ListBox.Item
                    key={role.id}
                    id={String(role.id)}
                    textValue={role.name}
                  >
                    {role.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
            <FieldError>{errors.roleId?.message}</FieldError>
          </Select>
        )}
      />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.phone}
          >
            <Label>{t('cmsUsers.form.phone')}</Label>
            <Input type="tel" ref={field.ref} variant="secondary" />
            <FieldError>{errors.phone?.message}</FieldError>
          </TextField>
        )}
      />
      <Controller
        name="dateOfBirth"
        control={control}
        render={({ field }) => (
          <DatePicker
            className="w-full"
            name={field.name}
            value={field.value ? parseDate(field.value) : null}
            onChange={(date: DateValue | null) =>
              field.onChange(date?.toString() ?? undefined)
            }
            isInvalid={!!errors.dateOfBirth}
            isRequired
          >
            <Label>{t('cmsUsers.form.dateOfBirth')}</Label>
            <DateField.Group fullWidth ref={field.ref} variant="secondary">
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <FieldError>{errors.dateOfBirth?.message}</FieldError>
            <DatePicker.Popover>
              <Calendar aria-label="Event date">
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(date) => <Calendar.Cell date={date} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
                <Calendar.YearPickerGrid>
                  <Calendar.YearPickerGridBody>
                    {({ year }) => <Calendar.YearPickerCell year={year} />}
                  </Calendar.YearPickerGridBody>
                </Calendar.YearPickerGrid>
              </Calendar>
            </DatePicker.Popover>
          </DatePicker>
        )}
      />
      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <Select
            variant="secondary"
            fullWidth
            selectedKey={field.value ?? null}
            onSelectionChange={(key) => {
              if (key == null) return;
              field.onChange(key as Gender);
            }}
          >
            <Label>{t('cmsUsers.form.gender')}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {genderItems.map((item) => (
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
          </Select>
        )}
      />
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <TextField
            fullWidth
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!errors.address}
          >
            <Label>{t('cmsUsers.form.address')}</Label>
            <Input ref={field.ref} variant="secondary" />
            <FieldError>{errors.address?.message}</FieldError>
          </TextField>
        )}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onPress={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
        <Button type="submit" variant="primary" isPending={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
