import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOAST_CONFIG } from '@/configs/common';
import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { testSectionApi } from '@/services/apis';

const useDeleteTestSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testSectionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEST_SECTION.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEST_SECTION.BY_TEST_ID],
      });
    },
    onError: (err) => {
      toast.danger('Delete test section failed', {
        description: err.message,
        timeout: TOAST_CONFIG.timeout,
      });
    },
  });
};

export default useDeleteTestSection;
