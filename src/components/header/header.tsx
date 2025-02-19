import { FC } from "react";
import { NavLink } from "react-router";

interface IHeaderProps {}

export const Header: FC<IHeaderProps> = () => {
  return (
    <div className="flex-col hidden w-full md:flex">
      <div className="border-b">
        <div className="flex items-center h-16 px-4">
          <NavLink to="/">City</NavLink>
        </div>
      </div>
    </div>
  );
};

