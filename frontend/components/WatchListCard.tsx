import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc'; 

const WatchlistItem = ({ stock, onRemove, onSelect }) => {
  const router = useRouter();

  return (
    <TouchableOpacity style={tw`bg-[#2a2a2a] p-4 mb-2 rounded-lg shadow-md`} onPress={() => onSelect(stock)}>
      <View style={tw`flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-lg font-bold text-white`}>{stock.symbol}</Text>
          <Text style={tw`text-sm text-gray-400`}>{stock.companyName}</Text>
        </View>
        <TouchableOpacity style={tw`bg-red-500 p-2 rounded-full`} onPress={() => onRemove(stock._id)}>
          <Text style={tw`text-white`}>Remove</Text>
        </TouchableOpacity>
      </View>
      {stock.price !== undefined && (
        <Text style={tw`text-lg mt-2 text-white`}>${stock.price.toFixed(2)}</Text>
      )}
      {stock.priceChange !== undefined && stock.priceChangePercentage !== undefined && (
        <Text style={tw`text-sm ${stock.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {stock.priceChange.toFixed(2)} ({stock.priceChangePercentage.toFixed(2)}%)
        </Text>
      )}
      <Text style={tw`text-sm text-gray-400`}>Day's Range: {stock.daysRange}</Text>
      <Text style={tw`text-sm text-gray-400`}>52-Week Range: {stock.weekRange}</Text>
      <Text style={tw`text-sm text-gray-400`}>Market Cap: {stock.marketCap}</Text>
      <Text style={tw`text-sm text-gray-400`}>Volume: {stock.volume}</Text>
    </TouchableOpacity>
  );
};

export default WatchlistItem;
