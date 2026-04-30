import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOAST_CONFIG } from '@/configs/common';
import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { roleApi } from '@/services/apis';

const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleApi.delete,
    onSuccess: () => {
      toast.success('Role deleted successfully', {
        timeout: TOAST_CONFIG.timeout,
      });

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ROLE.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Delete role failed', {
        description: err.message,
        timeout: TOAST_CONFIG.timeout,
      });
    },
  });
};

export default useDeleteRole;
