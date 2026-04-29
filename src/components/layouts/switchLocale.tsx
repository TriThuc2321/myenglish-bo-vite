import { Button, Tooltip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { FlagUSIcon, FlagVNIcon } from '@/assets/icons';
import { useLocale } from '@/providers/locale.provider';

export function SwitchLocale() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label={t('locale.toggle')}
          onPress={() => setLocale(locale === 'en' ? 'vi' : 'en')}
        >
          {locale === 'en' ? (
            <FlagUSIcon width={24} height={24} aria-hidden />
          ) : (
            <FlagVNIcon width={24} height={24} aria-hidden />
          )}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>{t('locale.toggle')}</Tooltip.Content>
    </Tooltip>
  );
}
