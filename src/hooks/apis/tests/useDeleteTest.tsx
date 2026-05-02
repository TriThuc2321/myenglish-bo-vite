import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { testApi } from '@/services/apis';

const useDeleteTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testApi.delete,
    onSuccess: () => {
      toast.success('Test deleted successfully');
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.TEST.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Delete test failed', {
        description: err.message,
      });
    },
  });
};

export default useDeleteTest;
