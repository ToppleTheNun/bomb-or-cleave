import { useNavigate, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar.tsx";
import { Button } from "~/components/ui/button.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command.tsx";
import { Icon } from "~/components/ui/icon.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover.tsx";
import type { AlternativeTooltipSource } from "~/data/seasons.ts";
import { seasons } from "~/data/seasons.ts";
import { isPresent } from "~/lib/typeGuards.ts";
import { cn } from "~/lib/utils.ts";

interface Season {
  label: string;
  value: string;
  icon: string;
  fallback: string;
}
interface SeasonGroup {
  label: string;
  seasons: Season[];
}

function getSeasonsWithTooltipSource(
  alternativeTooltipSource?: AlternativeTooltipSource,
): Season[] {
  return seasons
    .filter((season) => season.tooltipSource === alternativeTooltipSource)
    .map((season) => ({
      label: season.name,
      value: season.slug,
      icon: season.seasonIcon,
      fallback: season.shortName,
    }));
}

const betaSeasons: SeasonGroup = {
  label: "Beta Seasons",
  seasons: getSeasonsWithTooltipSource("beta"),
};
const ptrSeasons: SeasonGroup = {
  label: "PTR Seasons",
  seasons: getSeasonsWithTooltipSource("ptr"),
};
const liveSeasons: SeasonGroup = {
  label: "Live Seasons",
  seasons: getSeasonsWithTooltipSource(),
};

const groups: SeasonGroup[] = [
  betaSeasons.seasons.length > 0 ? betaSeasons : null,
  ptrSeasons.seasons.length > 0 ? ptrSeasons : null,
  liveSeasons,
].filter(isPresent);

function findMatchingSeason(name: string | undefined): Season | undefined {
  return groups
    .flatMap((group) => group.seasons)
    .find((season) => season.value === name);
}

export function SeasonSwitcher() {
  const navigate = useNavigate();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(
    findMatchingSeason(params.season),
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => {
      document.removeEventListener("keydown", down);
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={cn("w-[200px] justify-between")}
        >
          <Avatar className="mr-2 h-5 w-5">
            <AvatarImage
              src={selectedSeason?.icon}
              alt={selectedSeason?.label}
            />
            <AvatarFallback>{selectedSeason?.fallback ?? "WoW"}</AvatarFallback>
          </Avatar>
          {selectedSeason?.label ?? "Select a Season"}
          <Icon
            name="caret-sort"
            className="ml-auto shrink-0 opacity-50"
            size="sm"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search season..." />
            <CommandEmpty>No season found.</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.seasons.map((season) => (
                  <CommandItem
                    key={season.value}
                    onSelect={() => {
                      setSelectedSeason(season);
                      setOpen(false);
                      navigate(`/season/${season.value}`);
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={season.icon}
                        alt={season.label}
                        className="grayscale"
                      />
                      <AvatarFallback>{season.fallback}</AvatarFallback>
                    </Avatar>
                    {season.label}
                    <Icon
                      name="check"
                      className={cn(
                        "ml-auto",
                        selectedSeason?.value === season.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                      size="sm"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
