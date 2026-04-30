import type { QueryClientProviderProps } from '@tanstack/react-query';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export const ReactQueryProvider = ({
  children,
  ...rest
}: Omit<QueryClientProviderProps, 'client'>) => {
  return (
    <QueryClientProvider client={queryClient} {...rest}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
