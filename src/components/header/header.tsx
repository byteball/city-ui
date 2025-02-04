import { FC } from "react";

interface IHeaderProps {}

export const Header: FC<IHeaderProps> = () => {
  return (
    <div className="flex-col hidden w-full md:flex">
      <div className="border-b">
        <div className="flex items-center h-16 px-4">
          <div>City</div>
        </div>
      </div>
    </div>
  );
};

