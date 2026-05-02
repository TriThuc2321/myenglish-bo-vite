import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { passageApi } from '@/services/apis';

const useEditPassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: passageApi.edit,
    onSuccess: (_, { id }) => {
      toast.success('Passage updated successfully');
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.PASSAGE.BY_ID, id],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.PASSAGE.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Update passage failed', {
        description: err.message,
      });
    },
  });
};

export default useEditPassage;
