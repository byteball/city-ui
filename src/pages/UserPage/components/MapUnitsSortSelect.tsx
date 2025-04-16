import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IHouseSortTypeEnum,
  IPlotSortTypeEnum,
  setMapUnitSortDirection,
  setMapUnitSortType,
  useSettingsStore,
} from "@/store/settings-store";

interface IMapUnitsSortSelectProps {
  type: "house" | "plot";
}

// Utility function to get sort type enum based on unit type
const getSortTypeEnum = (type: "house" | "plot") => {
  return type === "plot" ? IPlotSortTypeEnum : IHouseSortTypeEnum;
};

export const MapUnitsSortSelect: React.FC<IMapUnitsSortSelectProps> = ({ type }) => {
  const { type: selectedSortType, direction: selectedSortDirection } = useSettingsStore(
    (state) => state.mapUnitSortType?.[type]
  );

  const handleSortTypeChange = (value: string) => {
    if (Object.keys(getSortTypeEnum(type)).includes(value)) {
      setMapUnitSortType(type, value as keyof typeof IHouseSortTypeEnum | keyof typeof IPlotSortTypeEnum);
    } else {
      console.error(`Invalid sort type: ${value}`);
    }
  };

  const handleSortDirectionChange = (value: string) => {
    if (value === "ASC" || value === "DESC") {
      setMapUnitSortDirection(type, value as "ASC" | "DESC");
    } else {
      console.error(`Invalid sort direction: ${value}`);
    }
  };

  return (
    <div className="grid grid-flow-row gap-4 mb-2 md:mb-0 sm:grid-flow-col">
      <Select defaultValue={selectedSortType} onValueChange={handleSortTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a filter type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(getSortTypeEnum(type)).map(([key, value]: [string, string]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select defaultValue={selectedSortDirection} onValueChange={handleSortDirectionChange}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Select a filter type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="ASC">ASC</SelectItem>
            <SelectItem value="DESC">DESC</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

