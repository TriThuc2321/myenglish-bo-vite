import type { Control } from 'react-hook-form';

import {
  Accordion,
  Checkbox,
  CheckboxGroup,
  Label,
  Spinner,
} from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuChevronDown } from 'react-icons/lu';

import type { CreateEditRoleFormData } from '@/schemas/role';
import type { Permission } from '@/types/permission';

import { useGetPermissions } from '@/hooks/apis/permissions';

const ALL_RESOURCE_PERMISSIONS_KEY = 'all';

type PermissionSelectorProps = {
  control: Control<CreateEditRoleFormData>;
};

type GroupedPermissions = Record<string, Permission[]>;

const PermissionSelector = ({ control }: PermissionSelectorProps) => {
  const { data: permissions, isLoading } = useGetPermissions();

  const { groups: permissionGroups, fullPermissionId } = useMemo(() => {
    if (!permissions) {
      return { groups: {} as GroupedPermissions, fullPermissionId: undefined };
    }

    const groups = groupPermission(permissions);
    const managePermission = groups[ALL_RESOURCE_PERMISSIONS_KEY];
    delete groups[ALL_RESOURCE_PERMISSIONS_KEY];

    return {
      groups: groups as GroupedPermissions,
      fullPermissionId: managePermission ? managePermission[0].id : undefined,
    };
  }, [permissions]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <Controller
      name="permissionIds"
      control={control}
      render={({ field }) => (
        <PermissionSelectorContent
          value={field.value}
          onChange={field.onChange}
          permissionGroups={permissionGroups}
          fullPermissionId={fullPermissionId}
        />
      )}
    />
  );
};

type PermissionSelectorContentProps = {
  value?: number[];
  onChange: (value: number[]) => void;
  permissionGroups: GroupedPermissions;
  fullPermissionId?: number;
};

const PermissionSelectorContent = ({
  value,
  onChange,
  permissionGroups,
  fullPermissionId,
}: PermissionSelectorContentProps) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>(value || []);
  const [groupSelected, setGroupSelected] = useState<string[]>([]);
  const [isDisableAll, setDisableAll] = useState<boolean>(false);

  const handleSingleSelect = (newValue: number[], groupName: string) => {
    const groupValues = permissionGroups[groupName] ?? [];
    const groupIds = groupValues.map((permission) => permission.id);
    const isGroupSelected = groupIds.every((id) => newValue.includes(id));

    setSelected(newValue);
    onChange(newValue);
    setGroupSelected((prev) =>
      isGroupSelected
        ? [...prev, groupName]
        : prev.filter((name) => name !== groupName),
    );
  };

  const handleGroupSelect = (isSelected: boolean, groupName: string) => {
    const groupValues = permissionGroups[groupName] ?? [];
    const groupIds = groupValues.map((permission) => permission.id);

    const newSelectedValues = isSelected
      ? Array.from(new Set([...selected, ...groupIds]))
      : selected.filter((id) => !groupIds.includes(id));

    setSelected(newSelectedValues);

    setGroupSelected((prev) =>
      isSelected
        ? [...prev, groupName]
        : prev.filter((name) => name !== groupName),
    );

    onChange(newSelectedValues);
  };

  const handleSelectAll = (isSelected: boolean, id: number) => {
    if (isSelected) {
      setGroupSelected([]);
      setSelected([id]);
      onChange([id]);
    } else {
      setSelected([]);
      onChange([]);
    }

    setDisableAll(isSelected);
  };

  useEffect(() => {
    setSelected(value || []);

    const isFullPermission = fullPermissionId
      ? value?.includes(fullPermissionId)
      : false;

    setDisableAll(!!isFullPermission);

    if (!isFullPermission) {
      const selectedGroups = Object.entries(permissionGroups)
        .filter(([_, perms]) =>
          perms.every((permission) => value?.includes(permission.id)),
        )
        .map(([groupName]) => groupName);
      setGroupSelected(selectedGroups);
    } else {
      setGroupSelected([]);
    }
  }, [value, fullPermissionId, permissionGroups]);

  return (
    <>
      <label className="mb-2 block text-sm font-medium">
        {t('form.permissions')}
      </label>
      <div className="w-full">
        {fullPermissionId != null && (
          <Checkbox
            id={`full-permissions-${fullPermissionId}`}
            className="py-3"
            isSelected={isDisableAll}
            onChange={(isSelected) =>
              handleSelectAll(isSelected, fullPermissionId)
            }
          >
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label
                htmlFor={`full-permissions-${fullPermissionId}`}
                className="text-base font-semibold capitalize"
              >
                Full permissions
              </Label>
            </Checkbox.Content>
          </Checkbox>
        )}

        <Accordion allowsMultipleExpanded className="w-full">
          {Object.entries(permissionGroups).map(([key, values]) => {
            const isIndeterminate =
              values.some((permission) => selected.includes(permission.id)) &&
              !values.every((permission) => selected.includes(permission.id));

            return (
              <Accordion.Item key={key} id={key}>
                <Accordion.Heading>
                  <Accordion.Trigger className="flex w-full items-center gap-2 py-2">
                    <span
                      className="inline-flex shrink-0"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        aria-label={`Select all ${key.replaceAll('_', ' ')}`}
                        isIndeterminate={isIndeterminate}
                        isSelected={groupSelected.includes(key)}
                        isDisabled={isDisableAll}
                        onChange={(isSelected) =>
                          handleGroupSelect(isSelected, key)
                        }
                      >
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox>
                    </span>
                    <span className="min-w-0 flex-1 text-start text-base font-semibold capitalize">
                      {key.replaceAll('_', ' ')}
                    </span>
                    <Accordion.Indicator>
                      <LuChevronDown className="text-muted size-4" />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="ml-6">
                    <CheckboxGroup
                      isDisabled={isDisableAll}
                      value={selected.map(String)}
                      onChange={(next) =>
                        handleSingleSelect(next.map(Number), key)
                      }
                    >
                      {values.map(({ id, action }) => (
                        <Checkbox key={id} value={String(id)}>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <Label className="text-sm capitalize">
                              {action}
                            </Label>
                          </Checkbox.Content>
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </div>
    </>
  );
};

const groupPermission = (permissions?: Permission[]) => {
  if (!permissions) return {};

  return permissions.reduce((acc, permission) => {
    const { subject } = permission;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(permission);

    return acc;
  }, {} as GroupedPermissions);
};

export default PermissionSelector;
