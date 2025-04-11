import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default () => {
  return (
    <PageLayout
      title="Market"
      description="lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
      loading={false}
    >
      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Plots</h2>
            </CardHeader>
            <CardContent>test</CardContent>
          </Card>
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Shortcodes</h2>
            </CardHeader>
            <CardContent>test</CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

