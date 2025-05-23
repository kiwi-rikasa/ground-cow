import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EarthquakeDashboardResponse } from "@/app/client";
interface EarthquakeSummaryCardsProps {
  earthquakeData: EarthquakeDashboardResponse;
}

export function EarthquakeSummaryCards({
  earthquakeData,
}: EarthquakeSummaryCardsProps) {
  const translations = {
    occurrenceTime: "發生時間",
    magnitude: "規模",
    averageIntensity: "範圍區平均震度",
    alertCompletionRate: "alert 完成 %",
    alertActivationRate: "啟動戰情 %",
    damageRate: "有損傷 %",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-6 sm:grid-rows-3 lg:grid-rows-2 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>{translations.occurrenceTime}</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {earthquakeData.occurrence_time}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{translations.magnitude}</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {earthquakeData.magnitude}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{translations.averageIntensity}</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {earthquakeData.max_intensity}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{translations.alertCompletionRate}</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {earthquakeData.alert_completion_rate}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{translations.alertActivationRate}</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {earthquakeData.alert_activation_rate}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{translations.damageRate}</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {earthquakeData.damage_rate}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
