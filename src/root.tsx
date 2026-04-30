import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { StrictMode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import './index.css';

import '@/i18n';
import Loader from '@/components/shared/Loader';
import { AbilityContext } from '@/configs/casl/can.config';
import { LocaleProvider } from '@/providers/locale.provider';
import { ThemeProvider } from '@/providers/theme.provider';
import { PermissionAction } from '@/types/auth';
import { SubjectName } from '@/types/auth';

const ability = (() => {
  const { can, build } = new AbilityBuilder(createMongoAbility);
  can(PermissionAction.Read, SubjectName.All);
  return build();
})();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body className="antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center">
      <Loader />
    </div>
  );
}

export default function Root() {
  return (
    <StrictMode>
      <AbilityContext.Provider value={ability}>
        <ThemeProvider>
          <LocaleProvider>
            <Outlet />
          </LocaleProvider>
        </ThemeProvider>
      </AbilityContext.Provider>
    </StrictMode>
  );
}
