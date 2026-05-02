import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { passageApi } from '@/services/apis';

const useDeletePassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: passageApi.delete,
    onSuccess: () => {
      toast.success('Passage deleted successfully');
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.PASSAGE.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Delete passage failed', {
        description: err.message,
      });
    },
  });
};

export default useDeletePassage;
