import React from 'react';
import { View } from 'react-native';
import { AreaChart, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import * as scale from 'd3-scale';
import tw from 'twrnc';

interface Props {
  chartData: number[];
  keyDates: Date[];
  isHistorical: boolean;
}

export default function StockChart({ chartData, keyDates, isHistorical }: Props) {
  return (
    <View style={{ height: 250, padding: 20, flexDirection: 'row' }}>
      <YAxis
        data={chartData}
        contentInset={{ top: 10, bottom: 10 }}
        svg={{ fill: 'white', fontSize: 10 }}
        numberOfTicks={6}
        formatLabel={(value) => `$${value.toFixed(2)}`}
      />
      <View style={{ flex: 1, marginLeft: 5 }}>
        <AreaChart
          style={{ flex: 1 }}
          data={chartData}
          contentInset={{ top: 10, bottom: 10 }}
          curve={shape.curveNatural}
          svg={{ fill: isHistorical ? 'rgba(65, 134, 244, 0.8)' : 'rgba(134, 65, 244, 0.8)' }}
        />
        <XAxis
          style={{ marginHorizontal: -5 }}
          data={keyDates}
          xAccessor={({ item }) => item}
          scale={scale.scaleTime}
          formatLabel={(value) => new Date(value).toLocaleDateString()}
          contentInset={{ left: 30, right: 30 }}
          svg={{ fontSize: 10, fill: 'white' }}
        />
      </View>
    </View>
  );
}