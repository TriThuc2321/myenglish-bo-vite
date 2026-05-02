import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { testApi } from '@/services/apis';

const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testApi.create,
    onSuccess: () => {
      toast.success('Test created successfully');

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEST.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Create test failed', {
        description: err.message,
      });
    },
  });
};

export default useCreateTest;
