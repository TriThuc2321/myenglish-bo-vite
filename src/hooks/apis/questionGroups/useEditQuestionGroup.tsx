import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOAST_CONFIG } from '@/configs/common';
import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { questionGroupApi } from '@/services/apis';

const useEditQuestionGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionGroupApi.edit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUESTION_GROUP.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUESTION_GROUP.BY_TEST_SECTION_ID],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUESTION_GROUP.BY_ID],
      });
    },
    onError: (err) => {
      toast.danger('Edit question group failed', {
        description: err.message,
        timeout: TOAST_CONFIG.timeout,
      });
    },
  });
};

export default useEditQuestionGroup;
