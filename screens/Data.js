import { ChartData } from 'react-native-chart-kit/dist/HelperTypes';
import { LineChartData } from 'react-native-chart-kit/dist/line-chart/LineChart';
import { StackedBarChartData } from 'react-native-chart-kit/dist/StackedBarChart';

export const barCharData = {
  labels: ['20 tk', '50 tk', '100 tk'],
  datasets: [
    {
      data: [28, 45, 60],
      colors: [
        (opacity = 1) => 'green',
        (opacity = 1) => 'green',
        (opacity = 1) => 'green',
        (opacity = 1) => 'lightgrey',
        (opacity = 1) => 'green'
      ]
    }
  ]
};