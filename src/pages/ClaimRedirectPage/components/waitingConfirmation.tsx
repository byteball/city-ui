import { HourglassIcon } from "lucide-react";

export const WaitingConfirmation = () => (
  <div className="text-lg text-center min-h-[75vh] mt-10">
    <HourglassIcon className="mx-auto mb-5 w-14 h-14" />

    <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">Waiting for coordinates</h1>
    <div>
      <small className="text-muted-foreground">The page will refresh automatically</small>
    </div>
  </div>
);