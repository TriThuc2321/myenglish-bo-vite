import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOAST_CONFIG } from '@/configs/common';
import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { testApi } from '@/services/apis';

const useEditTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testApi.edit,
    onSuccess: (_, { id }) => {
      toast.success('Test updated successfully', {
        timeout: TOAST_CONFIG.timeout,
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEST.BY_ID, id],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEST.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Update test failed', {
        description: err.message,
        timeout: TOAST_CONFIG.timeout,
      });
    },
  });
};

export default useEditTest;
