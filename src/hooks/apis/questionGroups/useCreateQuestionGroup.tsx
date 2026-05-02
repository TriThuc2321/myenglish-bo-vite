import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { questionGroupApi } from '@/services/apis';

const useCreateQuestionGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questionGroupApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUESTION_GROUP.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUESTION_GROUP.BY_TEST_SECTION_ID],
      });
    },
    onError: (err) => {
      toast.danger('Create question group failed', {
        description: err.message,
      });
    },
  });
};

export default useCreateQuestionGroup;
