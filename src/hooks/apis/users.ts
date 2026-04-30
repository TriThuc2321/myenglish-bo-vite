export type ProfileData = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}>;

export function useGetProfile(): { data: ProfileData | undefined } {
  return { data: undefined };
}
