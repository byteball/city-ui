import { CheckCircleIcon } from "lucide-react";
import { FC } from "react";

export const AlreadyGot: FC = () => (<div className="text-lg text-center min-h-[75vh] mt-10">
  <CheckCircleIcon className="mx-auto mb-5 w-14 h-14" />

  <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">You have already claimed your rewards</h1>
</div>)