import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ZoneStats } from "@/app/client";
interface ZoneSummaryCardsProps {
  stats: ZoneStats;
}

export function ZoneSummaryCards({ stats }: ZoneSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-6 sm:grid-rows-3 lg:grid-rows-2 gap-4 mb-6">
      <Card>
        <CardHeader className="relative">
          <CardDescription>Total event count</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.total_events}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>啟動戰情 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.alert_activation_rate}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>有損傷 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.damage_rate}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>alert 完成 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.alert_completion_rate}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>alert 抑制 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.alert_suppression_rate}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>平均回報時間</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.avg_response_time}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
