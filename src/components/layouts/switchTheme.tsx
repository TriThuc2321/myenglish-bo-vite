import { Button } from '@heroui/react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

import { useTheme } from '@/providers/theme.provider';

export default function ThemeSwitch() {
  const { setTheme, theme } = useTheme();
  const buttonClass =
    'h-6 min-h-6 w-6 min-w-6 rounded-full border-typography-secondary';

  return (
    <div className="absolute right-4 bottom-4 z-50 flex gap-2 rounded-full border p-1">
      <Button
        className={buttonClass}
        isIconOnly
        variant={theme === 'light' ? 'danger-soft' : 'ghost'}
        onPress={() => setTheme('light')}
      >
        <IoSunnyOutline size={12} />
      </Button>

      <Button
        className={buttonClass}
        isIconOnly
        variant={theme === 'dark' ? 'danger-soft' : 'ghost'}
        onPress={() => setTheme('dark')}
      >
        <IoMoonOutline size={12} />
      </Button>
    </div>
  );
}
