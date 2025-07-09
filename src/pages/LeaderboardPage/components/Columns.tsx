import { ColumnDef } from "@tanstack/react-table"
import { ArrowDown } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAttestations } from "@/hooks/useAttestations"
import { getContactUrlByUsername } from "@/lib/getContactUrlByUsername"
import { SocialIcon } from "@/pages/MainPage/components/SocialIcon"

import { ILeaderboardEntry } from "../types"

const unknownPlug = "Unknown"

export const columns: ColumnDef<ILeaderboardEntry>[] = [
  {
    accessorKey: "address",
    header: () => <div className="ml-2">User</div>,
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      const { data: attestations, loaded } = useAttestations(address);

      return (
        <div className="flex flex-col gap-2 ml-2">
          <div>
            <Link to={`/user/${address}`} className="text-link">{address}</Link>
          </div>
          {loaded ? <div className="flex gap-4">
            {attestations.map((a) => {
              const url = getContactUrlByUsername(a.value, a.name, a.userId);

              return (
                <div className="flex items-center justify-between gap-1" key={a.name + "-" + a.value + "-"}>
                  <SocialIcon type={a.name} />{" "}
                  <HoverCard>
                    {a.displayName ? <HoverCardContent align="center" className="text-white" side="top">
                      <div>Username: {a.value}</div>
                    </HoverCardContent> : null}
                    <HoverCardTrigger>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener" className="text-link">
                          {a.displayName ?? a.value ?? unknownPlug}
                        </a>
                      ) : (
                        <div>{a.displayName ?? a.value ?? unknownPlug}</div>
                      )}
                    </HoverCardTrigger>
                  </HoverCard>
                </div>
              );
            })}
          </div> : <Skeleton className="h-[1.125rem] w-[150px]" />}
        </div>
      )
    },
  },
  {
    accessorKey: "plots",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(true)}
        >
          Plots
          <ArrowDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
  },
  {
    accessorKey: "houses",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0 mr-2 hover:bg-transparent"
          onClick={() => column.toggleSorting(true)}
        >
          Houses
          <ArrowDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
  },
]