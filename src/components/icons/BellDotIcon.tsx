import cn from "classnames";

export const BellDotIcon = ({ className = "", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className, "lucide lucide-bell-dot-icon lucide-bell-dot")} {...props}>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M13.916 2.314A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.74 7.327A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673 9 9 0 0 1-.585-.665" />
    <circle cx="18" cy="8" r="3" className="fill-red-600 stroke-red-600" />
  </svg>
);