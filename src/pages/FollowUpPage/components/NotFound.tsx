import { CircleAlertIcon } from "lucide-react";

export const NotFound = () => (
  <div className="text-lg text-center min-h-[75vh] mt-10">
    <CircleAlertIcon className="mx-auto mb-5 w-14 h-14" />

    <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">No such neighbors</h1>
  </div>
);