import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { barCharData } from './Data';

const BarChartDemo = () => {
  const { width } = useWindowDimensions();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Currency Detection Report</Text>

      <View style={styles.detailsContainer}>
       {/*<Text style={styles.detail}><Text style={styles.label}>Detected By: </Text>John Doe</Text>*/}
        <Text style={styles.detail}><Text style={styles.label}>Detection Date and Time: </Text>{new Date().toLocaleString()}</Text>
        <Text style={styles.detail}><Text style={styles.label}>App Name: </Text>Currency Detection App</Text>
      {/*  <Text style={styles.detail}><Text style={styles.label}>Detection Location: </Text>New York, USA</Text>
        <Text style={styles.detail}><Text style={styles.label}>Detection Device: </Text>iPhone 13 Pro</Text>*/}
      </View>

      <Text style={styles.chartTitle}>Currency Detection Statistics</Text>
      <BarChart
        data={barCharData}
        yAxisLabel=""
        yAxisSuffix=""
        width={width - 20}  // to add some margin
        height={400}
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: '#ffffff',
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`, // Google Blue
          barPercentage: 0.6,
          fillShadowGradient: '#4285F4', // Google Blue
          fillShadowGradientOpacity: 1,
          decimalPlaces: 0,
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#e3e3e3',
            strokeDasharray: '0',
          },
          propsForLabels: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#757575',
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
          borderColor: '#4285F4',
          borderWidth: 1,
        }}
        withInnerLines={true}
        showValuesOnTopOfBars
        showBarTops={true}
        withCustomBarColorFromData={false}
        flatColor={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center', // Center the content horizontally
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  detailsContainer: {
    width: '100%', // Make sure the details container takes the full width
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detail: {
    fontSize: 16,
    marginVertical: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default BarChartDemo;
