import type { User } from '@/types/user';

import axiosInstance from '../axios-instance';

const userApi = {
  getProfile: (): Promise<User> => axiosInstance.get('profile'),
};

export default userApi;
