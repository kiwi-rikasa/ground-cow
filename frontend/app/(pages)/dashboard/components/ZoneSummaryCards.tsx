import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ZoneStats {
  totalEvents: number;
  alertActivationRate: number;
  damageRate: number;
  alertCompletionRate: number;
  alertSuppressionRate: number;
  avgResponseTime: string;
}

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
            {stats.totalEvents}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>啟動戰情 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.alertActivationRate}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>有損傷 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.damageRate}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>alert 完成 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.alertCompletionRate}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>alert 抑制 %</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.alertSuppressionRate}%
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="relative">
          <CardDescription>平均回報時間</CardDescription>
          <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {stats.avgResponseTime}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
