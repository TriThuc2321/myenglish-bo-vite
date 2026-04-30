'use client';

import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';

type PushOption = {
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

function parseQueryString(query: string): Record<string, string | string[]> {
  const params = new URLSearchParams(query);
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (!Array.isArray(result[key])) result[key] = [result[key]];
      result[key].push(value);
    } else result[key] = value;
  }

  return result;
}

const useParamsRouter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const push = ({ query = {}, url }: PushOption) => {
    const params = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      if (!query[key]) params.delete(key);
      else {
        if (Array.isArray(query[key])) {
          query[key].forEach((value) => params.append(key, value));

          return;
        }
        if (query[key]) params.append(key, query[key]);
      }
    });
    router.push(`${url ?? pathname}?${params.toString()}`);
  };
  const query = parseQueryString(searchParams.toString());

  return { ...router, push, query };
};

export default useParamsRouter;
