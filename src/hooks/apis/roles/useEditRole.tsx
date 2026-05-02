import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { roleApi } from '@/services/apis';

const useEditRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleApi.edit,
    onSuccess: () => {
      toast.success('Role updated successfully');

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ROLE.LIST],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ROLE.BY_ID],
      });
    },
    onError: (err) => {
      toast.danger('Update role failed', {
        description: err.message,
      });
    },
  });
};

export default useEditRole;
