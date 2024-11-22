import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStatsProps {
  voices: any[];
}

export function DashboardStats({ voices }: DashboardStatsProps) {
  // Calculate voice creation over time
  const voicesByDate = voices.reduce((acc: { [key: string]: number }, voice) => {
    const date = new Date(voice.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const voiceCreationData: ChartData<'line'> = {
    labels: Object.keys(voicesByDate),
    datasets: [
      {
        label: 'Voices Created',
        data: Object.values(voicesByDate),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Calculate voice types distribution
  const voiceTypes = voices.reduce((acc: { [key: string]: number }, voice) => {
    acc[voice.type] = (acc[voice.type] || 0) + 1;
    return acc;
  }, {});

  const voiceTypesData: ChartData<'bar'> = {
    labels: Object.keys(voiceTypes),
    datasets: [
      {
        label: 'Voice Types',
        data: Object.values(voiceTypes),
        backgroundColor: [
          'rgba(147, 51, 234, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(236, 72, 153, 0.5)',
        ],
        borderColor: [
          'rgb(147, 51, 234)',
          'rgb(59, 130, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const stats = [
    {
      title: 'Total Voices',
      value: voices.length,
    },
    {
      title: 'Custom Voices',
      value: voices.filter(v => v.type === 'custom').length,
    },
    {
      title: 'Generated Voices',
      value: voices.filter(v => v.type === 'generated').length,
    },
    {
      title: 'Cloned Voices',
      value: voices.filter(v => v.type === 'cloned').length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Voice Creation Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={voiceCreationData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={voiceTypesData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}