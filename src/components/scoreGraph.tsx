'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

type Score = {
  owner: string;
  timestamp: string | Date;
  score: number;
};

const chartConfig = {
  score: {
    label: 'Score',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

function formatDate(ts: string | Date) {
  const date = typeof ts === 'string' ? new Date(ts) : ts;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

interface ScoreGraphProps {
  scores: Score[];
  className?: string;
}

export default function ScoreGraph({ scores, className }: ScoreGraphProps) {
  // Sort by timestamp ascending
  const chartData = scores
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((item) => ({
      date: formatDate(item.timestamp),
      score: item.score,
    }));

  return (
    <Card className={className + ' bg-secondary-background text-foreground'}>
      <CardHeader>
        <CardTitle>Score Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-full w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart
            className="h-full w-full"
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="score"
              type="natural"
              fill="var(--color-score)"
              activeDot={{
                fill: 'var(--chart-active-dot)',
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
