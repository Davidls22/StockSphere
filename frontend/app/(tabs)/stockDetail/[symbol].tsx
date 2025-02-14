import { useContext, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Linking } from 'react-native';
import StockContext from '../../../contexts/StockContext';
import { useUser } from '../../../contexts/AuthContext';
import tw from 'twrnc';
import Header from '../../../components/Header';
import StockChart from '../../../components/StockChart';
import { useStockData } from '../../../hooks/useStockData';
import { addStockToWatchlist, addToPortfolio as addStockToPortfolio } from '../../../services/api';

export default function StockDetail({ fetchWatchlist }: { fetchWatchlist?: () => void }) {
  const { stock } = useContext(StockContext);
  const { user } = useUser();
  const { timeSeries, historicalSeries, latestData, news } = useStockData(stock?.symbol);
  const [quantity, setQuantity] = useState('');
  const [isHistorical, setIsHistorical] = useState(false);

  const handleAddToPortfolio = async () => {
    if (!quantity) {
      Alert.alert('Error', 'Please enter the quantity');
      return;
    }

    if (!stock || !user) return;

    try {
      await addStockToPortfolio(user.id, stock.symbol, parseInt(quantity, 10));
      Alert.alert('Success', 'Stock added to portfolio successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock to portfolio');
    }
  };

  const handleAddToWatchlist = async () => {
    if (!stock || !user) return;

    try {
      await addStockToWatchlist(stock.symbol, user.id);
      Alert.alert('Success', 'Stock added to watchlist successfully');
      fetchWatchlist?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock to watchlist');
    }
  };

  const getKeyDates = useMemo(() => {
    const data = isHistorical ? historicalSeries : timeSeries;
    if (data.length <= 4) return data.map((d) => new Date(d.date));
    return [new Date(data[0].date), new Date(data[Math.floor(data.length / 2)].date), new Date(data[data.length - 1].date)];
  }, [isHistorical, historicalSeries, timeSeries]);

  const chartData = useMemo(() => (isHistorical ? historicalSeries : timeSeries).map((pt) => pt.y), [
    isHistorical,
    historicalSeries,
    timeSeries,
  ]);

  return (
    <ScrollView style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
      <Header />
      {stock ? (
        <>
          <Text style={tw`text-3xl font-bold text-white mb-4`}>{stock.symbol}</Text>
          {latestData && (
            <View style={tw`mb-4`}>
              <Text style={tw`text-white`}>Open: {latestData['1. open']}</Text>
              <Text style={tw`text-white`}>High: {latestData['2. high']}</Text>
              <Text style={tw`text-white`}>Low: {latestData['3. low']}</Text>
              <Text style={tw`text-white`}>Close: {latestData['4. close']}</Text>
              <Text style={tw`text-white`}>Volume: {latestData['5. volume']}</Text>
            </View>
          )}
          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`text-xl font-bold text-white mr-4`}>Show Historical Data</Text>
            <Switch value={isHistorical} onValueChange={setIsHistorical} />
          </View>
          <StockChart chartData={chartData} keyDates={getKeyDates} isHistorical={isHistorical} />
          {user && (
            <>
              <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg mb-4`} onPress={handleAddToWatchlist}>
                <Text style={tw`text-white text-center font-bold`}>Add to Watchlist</Text>
              </TouchableOpacity>
              <TextInput
                style={tw`h-12 border border-gray-300 rounded-lg mb-4 px-4 text-white`}
                placeholder="Quantity"
                placeholderTextColor="#888888"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TouchableOpacity style={tw`bg-green-600 p-3 rounded-lg mb-4`} onPress={handleAddToPortfolio}>
                <Text style={tw`text-white text-center font-bold`}>Add to Portfolio</Text>
              </TouchableOpacity>
            </>
          )}
          {news.slice(0, 3).map((article, index) => (
            <View key={index} style={tw`mb-4`}>
              <Text style={tw`text-white font-bold`}>{article.title}</Text>
              <Text style={tw`text-blue-400`} onPress={() => Linking.openURL(article.url)}>
                Read more
              </Text>
            </View>
          ))}
        </>
      ) : (
        <Text style={tw`text-white`}>No stock data available</Text>
      )}
    </ScrollView>
  );
}