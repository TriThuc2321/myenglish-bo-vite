import { Button, useTheme } from '@heroui/react';

import { LogoIcon } from './assets/icons';
function App() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </Button>
      <LogoIcon />
    </div>
  );
}

export default App;
