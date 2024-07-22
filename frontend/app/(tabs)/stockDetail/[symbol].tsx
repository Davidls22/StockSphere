import React, { useContext, useEffect, useState, useMemo } from 'react';
import { View, Text, Dimensions, ScrollView, TextInput, TouchableOpacity, Alert, Switch, Image, Linking } from 'react-native';
import { AreaChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import StockContext from '../../../contexts/StockContext';
import axios from 'axios';
import { fetchStockData } from '../../../services/stockApi';
import { useUser } from '../../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import Header from '../../../components/Header';
import * as scale from 'd3-scale';

const windowWidth = Dimensions.get('window').width;

export default function StockDetail({ fetchWatchlist }) {
  const { stock } = useContext(StockContext);
  const { user, token } = useUser();
  const [timeSeries, setTimeSeries] = useState([]);
  const [historicalSeries, setHistoricalSeries] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [news, setNews] = useState([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isHistorical, setIsHistorical] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStockDataAsync = async () => {
      if (stock) {
        try {
          const data = await fetchStockData(stock.symbol);
          console.log('Fetched data using fetch API:', data);

          if (data && data.data && data.data['Time Series (Daily)']) {
            const historicalData = data.data['Time Series (Daily)'];
            const formattedData = Object.keys(historicalData).map((date) => ({
              date: new Date(date),  // Ensure date is converted to a Date object
              y: parseFloat(historicalData[date]['4. close']),
            }));
            setTimeSeries(formattedData);

            const latestDate = Object.keys(historicalData)[0];
            setLatestData(historicalData[latestDate]);
          } else {
            throw new Error('Invalid data format from fetch API');
          }

          const newsResponse = await axios.get(`http://localhost:8080/api/stocks/stock/news/${stock.symbol}`);
          setNews(newsResponse.data);
          console.log('Fetched news data using axios:', newsResponse.data);

          const historicalResponse = await axios.get(`http://localhost:8080/api/stocks/stock/historical/${stock.symbol}`);
          console.log('Fetched historical data using axios:', historicalResponse.data);

          const axiosHistoricalData = historicalResponse.data['Time Series (Daily)'];
          if (axiosHistoricalData) {
            const axiosFormattedData = Object.keys(axiosHistoricalData).map((date) => ({
              date: new Date(date),  // Ensure date is converted to a Date object
              y: parseFloat(axiosHistoricalData[date]['4. close']),
            }));
            setHistoricalSeries(axiosFormattedData);
          } else {
            console.log('Unexpected data format:', historicalResponse.data);
            throw new Error('Invalid data format from axios');
          }
        } catch (error) {
          console.error('Failed to fetch stock data:', error);
        }
      }
    };

    fetchStockDataAsync();
  }, [stock]);

  const addStockToWatchlist = async (stockId) => {
    if (!user) {
      console.error('User is not logged in');
      return;
    }

    try {
      const data = { stockId, user: user.id };
      console.log('Data being sent:', data);

      await axios.post(
        'http://localhost:8080/api/watchlist/watchlists',
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Fetch the updated watchlist and update the state
      if (fetchWatchlist) {
        fetchWatchlist();
      }

      console.log('Stock added to watchlist successfully');
      Alert.alert('Success', 'Stock added successfully');
    } catch (error) {
      console.error('Failed to add stock to watchlist:', error.message);
    }
  };

  const handleAddToWatchlist = () => {
    if (stock) {
      addStockToWatchlist(stock.symbol);
    } else {
      console.error('No stock selected');
    }
  };

  const addToPortfolio = async () => {
    if (!quantity) {
      Alert.alert('Error', 'Please enter the quantity');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/portfolios', {
        userId: user?.id,
        stocks: [{ symbol: stock.symbol, quantity: parseInt(quantity, 10) }],
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Stock added to portfolio successfully');
    } catch (error) {
      console.error('Failed to add stock to portfolio:', error);
      Alert.alert('Error', 'Failed to add stock to portfolio');
    }
  };

  const getKeyDates = useMemo(() => {
    const data = isHistorical ? historicalSeries : timeSeries;
    if (data.length <= 4) return data.map((d) => new Date(d.date));
    return [
      new Date(data[0].date), // First date
      new Date(data[Math.floor(data.length / 2)].date), // Middle date
      new Date(data[data.length - 1].date) // Last date
    ];
  }, [isHistorical, historicalSeries, timeSeries]);

  const chartData = useMemo(() => (isHistorical ? historicalSeries : timeSeries).map((pt) => pt.y), [isHistorical, historicalSeries, timeSeries]);

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
            <Switch
              value={isHistorical}
              onValueChange={setIsHistorical}
            />
          </View>
          <Text style={tw`text-xl font-bold text-white mb-4`}>{isHistorical ? 'Historical Data' : 'Recent Data'}</Text>
          <View style={{ height: 250, padding: 20, flexDirection: 'row' }}>
            <YAxis
              data={chartData}
              contentInset={{ top: 10, bottom: 10 }}
              svg={{
                fill: 'white',
                fontSize: 10,
              }}
              numberOfTicks={10}
              formatLabel={(value) => `$${value.toFixed(2)}`}
            />
            <View style={{ flex: 1, marginLeft: 5 }}>
              <AreaChart
                style={{ flex: 1 }}
                data={chartData}
                contentInset={{ top: 10, bottom: 10 }}
                curve={shape.curveNatural}
                svg={{ fill: isHistorical ? 'rgba(65, 134, 244, 0.8)' : 'rgba(134, 65, 244, 0.8)' }}
              >
              </AreaChart>
              <XAxis
                style={{ marginHorizontal: -5 }}
                data={getKeyDates}  // Use dates array here
                xAccessor={({ item }) => item}  // Use the date objects directly
                scale={scale.scaleTime}
                formatLabel={(value) => new Date(value).toLocaleDateString()}  // Format the date labels
                contentInset={{ left: 30, right: 30 }}
                svg={{ fontSize: 10, fill: 'white' }}
              />
            </View>
          </View>
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
              <TouchableOpacity style={tw`bg-green-600 p-3 rounded-lg mb-4`} onPress={addToPortfolio}>
                <Text style={tw`text-white text-center font-bold`}>Add to Portfolio</Text>
              </TouchableOpacity>
            </>
          )}
          <View style={tw`mt-4`}>
            <Text style={tw`text-2xl font-bold text-white mb-4`}>Latest News</Text>
            {news.slice(0, 3).map((article, index) => (
              <View key={index} style={tw`mb-4`}>
                {article.urlToImage && (
                  <Image source={{ uri: article.urlToImage }} style={tw`w-full h-48 mb-4 rounded-lg`} />
                )}
                <Text style={tw`font-bold text-white`}>{article.source.name}</Text>
                <Text style={tw`text-lg font-bold text-white mb-2`}>{article.title}</Text>
                <Text style={tw`text-white mb-2`}>{article.description}</Text>
                <Text style={tw`italic text-gray-400 mb-2`}>{new Date(article.publishedAt).toLocaleDateString()}</Text>
                <Text style={tw`text-blue-500 underline`} onPress={() => Linking.openURL(article.url)}>Read more</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={tw`text-white`}>No stock data available</Text>
      )}
    </ScrollView>
  );
}
