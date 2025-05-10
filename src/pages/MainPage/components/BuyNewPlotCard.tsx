import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyNewPlotForm } from "@/forms/BuyNewPlotForm";

export const BuyNewPlotCard = () => (
  <Card highlight>
    <CardHeader>
      <CardTitle>Buy new plot</CardTitle>
      <CardDescription>When you buy a plot, it is created in a random location.</CardDescription>
    </CardHeader>

    <CardContent>
      <BuyNewPlotForm />
    </CardContent>
  </Card>
);

