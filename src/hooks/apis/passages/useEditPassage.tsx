import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOAST_CONFIG } from '@/configs/common';
import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { passageApi } from '@/services/apis';

const useEditPassage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: passageApi.edit,
    onSuccess: (_, { id }) => {
      toast.success('Passage updated successfully', {
        timeout: TOAST_CONFIG.timeout,
      });
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
        timeout: TOAST_CONFIG.timeout,
      });
    },
  });
};

export default useEditPassage;
