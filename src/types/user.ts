import type { Audit, Params, Provider, Response } from './common';
import type { Role } from './role';

export type User = { id: string } & Partial<{
  roleId: string;
  role: Role;
  email: string;
  avatar: string;
  phone: string;
  provider: Provider;
  providerId: string;
  firstName: string;
  lastName: string;
  isVerifiedEmail: boolean;
  isActive: boolean;
  audit: Audit;
}>;

export type GetUserParams = Params & {
  roleIds?: string[];
};

export type GetUsersResponse = Response<User[]>;

export type CreateUserPayload = Partial<{
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive: boolean;
}>;

export type EditUserPayload = CreateUserPayload & {
  id: string;
};

export type EditMePayload = Partial<{
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}>;
