import { CircleXIcon } from "lucide-react";

export const InvalidPlotAlert = () => <div className="text-lg text-center min-h-[75vh] mt-10">
  <CircleXIcon className="w-10 h-10 mx-auto mb-5" />
  <h1 className="mb-5 text-4xl font-extrabold tracking-tight scroll-m-20 lg:text-5xl">Error</h1>

  <div className="text-lg text-center">Invalid plot numbers</div>
</div>