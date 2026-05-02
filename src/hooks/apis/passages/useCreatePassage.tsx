import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { passageApi } from '@/services/apis';

const useCreatePassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: passageApi.create,
    onSuccess: () => {
      toast.success('Passage created successfully');

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.PASSAGE.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Create passage failed', {
        description: err.message,
      });
    },
  });
};

export default useCreatePassage;
