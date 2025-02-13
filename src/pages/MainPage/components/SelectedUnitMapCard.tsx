import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ICoordinates } from "@/global";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsByCoordinatesSelector } from "@/store/selectors/mapUnitsSelector";
import { useSettingsStore } from "@/store/settings-store";

export const SelectedUnitMapCard = () => {
  const selectedMapUnitCoordinates = useSettingsStore((state) => state.selectedMapUnit);

  const selectedMapUnit = useAaStore((state) => mapUnitsByCoordinatesSelector(state, selectedMapUnitCoordinates as ICoordinates | null));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected plot</CardTitle>
        <CardDescription>Click on the house to see all the information about it.</CardDescription>
      </CardHeader>

      {selectedMapUnitCoordinates ? (
        <CardContent>
          {selectedMapUnitCoordinates.x} - {selectedMapUnitCoordinates.y}
        </CardContent>
      ) : (
        <CardContent className="text-primary">No plot selected</CardContent>
      )}
    </Card>
  );
};

