import { LineChart } from '@mui/x-charts/LineChart';
import { useBrush, useDrawingArea, useLineSeries, useXScale } from '@mui/x-charts/hooks';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface CustomBrushOverlayProps {
  seriesId: string;
  showDifference?: boolean;
  currencySymbol?: string;
}

function CustomBrushOverlay({ seriesId, showDifference = true, currencySymbol = '₹' }: CustomBrushOverlayProps) {
  const theme = useTheme();
  const drawingArea = useDrawingArea();
  const brush = useBrush();
  const xScale = useXScale<'point'>();
  const series = useLineSeries(seriesId);

  if (!brush || !series) return null;

  const { left, top, width, height } = drawingArea;
  const clampX = (x: number) => Math.max(left, Math.min(left + width, x));
  const clampedStartX = clampX(brush.start.x!);
  const clampedCurrentX = clampX(brush.current.x!);

  const minX = Math.min(clampedStartX, clampedCurrentX);
  const maxX = Math.max(clampedStartX, clampedCurrentX);
  const rectWidth = maxX - minX;
  const color = theme.palette.primary.main;

  if (rectWidth < 1) return null;

  const getIndex = (x: number) =>
    Math.floor((x - Math.min(...xScale.range()) + xScale.step() / 2) / xScale.step());

  const startIndex = getIndex(clampedStartX);
  const currentIndex = getIndex(clampedCurrentX);
  const startValue = series.data[startIndex]!;
  const currentValue = series.data[currentIndex]!;
  const difference = currentValue - startValue;
  const percentChange = ((difference / startValue) * 100).toFixed(2);
  const startDate = (xScale.domain()[startIndex] as string) || '';
  const currentDate = (xScale.domain()[currentIndex] as string) || '';

  return (
    <g>
      <line x1={clampedStartX} y1={top} x2={clampedStartX} y2={top + height} stroke={color} strokeWidth={2} strokeDasharray="5,5" pointerEvents="none" />
      <line x1={clampedCurrentX} y1={top} x2={clampedCurrentX} y2={top + height} stroke={color} strokeWidth={2} strokeDasharray="5,5" pointerEvents="none" />
      <rect x={minX} y={top} width={rectWidth} height={height} fill={color} fillOpacity={0.1} pointerEvents="none" />
      
      <g transform={`translate(${clampedStartX}, ${top + 15})`}>
        <rect x={-30} y={0} width={60} height={40} fill={color} rx={4} />
        <text x={0} y={16} textAnchor="middle" fill="white" fontSize={10}>{startDate}</text>
        <text x={0} y={32} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">{currencySymbol}{startValue.toFixed(0)}</text>
      </g>
      
      <g transform={`translate(${clampedCurrentX}, ${top + 15})`}>
        <rect x={-30} y={0} width={60} height={40} fill={color} rx={4} />
        <text x={0} y={16} textAnchor="middle" fill="white" fontSize={10}>{currentDate}</text>
        <text x={0} y={32} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">{currencySymbol}{currentValue.toFixed(0)}</text>
      </g>
      
      {showDifference && (
        <g transform={`translate(${(minX + maxX) / 2}, ${top + height - 30})`}>
          <rect x={-50} y={0} width={100} height={26} fill={difference >= 0 ? theme.palette.success.main : theme.palette.error.main} rx={4} />
          <text x={0} y={17} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">
            {difference >= 0 ? '+' : ''}{currencySymbol}{difference.toFixed(0)} ({percentChange}%)
          </text>
        </g>
      )}
    </g>
  );
}

interface MUILineChartProps {
  data: number[];
  labels: string[];
  height?: number;
  seriesLabel?: string;
  enableBrush?: boolean;
  showDifference?: boolean;
  currencySymbol?: string;
}

export default function MUILineChart({
  data,
  labels,
  height = 300,
  seriesLabel = 'Value',
  enableBrush = true,
  showDifference = true,
  currencySymbol = '₹'
}: MUILineChartProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <LineChart
        height={height}
        series={[{ data, label: seriesLabel, showMark: false, id: 'trendLine' }]}
        brushConfig={{ enabled: enableBrush }}
        xAxis={[{ data: labels, scaleType: 'point' }]}
        yAxis={[{ valueFormatter: (value) => `${currencySymbol}${value.toLocaleString('en-IN')}` }]}
        margin={{ top: 10, right: 30, bottom: 30, left: 60 }}
      >
        {enableBrush && <CustomBrushOverlay seriesId="trendLine" showDifference={showDifference} currencySymbol={currencySymbol} />}
      </LineChart>
    </Box>
  );
}