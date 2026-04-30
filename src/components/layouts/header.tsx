import { Avatar, Button } from '@heroui/react';
import { memo } from 'react';
import { LuMenu } from 'react-icons/lu';

import SwitchLocale from './switchLocale';

type HeaderProps = {
  onChangeOpenSidebar: () => void;
};

const profile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatar: 'https://github.com/shadcn.png',
};
function Header({ onChangeOpenSidebar }: HeaderProps) {
  const { firstName, lastName, email, avatar } = profile || {};

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          className="hidden max-md:flex"
          isIconOnly
          variant="tertiary"
          onPress={onChangeOpenSidebar}
        >
          <LuMenu className="text-xl" />
        </Button>
        <h5 className="font-bold">Welcome to My English</h5>
      </div>

      <div className="flex items-center gap-2">
        <SwitchLocale />

        <Button variant="ghost" className="h-12 pr-1 max-md:hidden">
          <div>
            <p className="text-end text-sm font-semibold">
              {firstName} {lastName}
            </p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
          <Avatar className="rounded-2xl" variant="soft" color="accent">
            <Avatar.Image alt="John Doe" src={avatar} />
            <Avatar.Fallback className="rounded-2xl">
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        </Button>
      </div>
    </div>
  );
}

export default memo(Header);
