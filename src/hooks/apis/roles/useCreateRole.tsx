import { toast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TOAST_CONFIG } from '@/configs/common';
import { REACT_QUERY_KEYS } from '@/constants/reactQuery';
import { roleApi } from '@/services/apis';

const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleApi.create,
    onSuccess: () => {
      toast.success('Role created successfully', {
        timeout: TOAST_CONFIG.timeout,
      });

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.ROLE.LIST],
      });
    },
    onError: (err) => {
      toast.danger('Create role failed', {
        description: err.message,
        timeout: TOAST_CONFIG.timeout,
      });
    },
  });
};

export default useCreateRole;
