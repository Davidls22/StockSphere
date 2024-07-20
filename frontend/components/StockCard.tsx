import React from 'react';
import { View, Text } from 'react-native';

export default function StockCard({ stock }) {
  return (
    <View className="p-4 m-2 bg-white rounded shadow">
      <Text className="text-lg font-bold">{stock.symbol}</Text>
      <Text className="text-sm">{stock.date}</Text>
      <Text className="text-sm">Open: {stock['1. open']}</Text>
      <Text className="text-sm">Close: {stock['4. close']}</Text>
    </View>
  );
}
