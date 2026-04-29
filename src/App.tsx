import { Button, useTheme } from '@heroui/react';

import { SwitchLocale } from './components/layouts';

function App() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </Button>
      <SwitchLocale />
    </div>
  );
}

export default App;
