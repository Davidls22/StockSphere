import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, Image, Linking, Alert, TextInput, TouchableOpacity } from 'react-native';
import { LineChart, Grid, AreaChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import StockContext from '../../../contexts/StockContext';
import axios from 'axios';
import { fetchStockData } from '../../../services/stockApi';
import { useUser } from '../../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import Header from '../../../components/Header';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../../../components/Notifications';

const windowWidth = Dimensions.get('window').width;

export default function StockDetail({ fetchWatchlist }) {
  const { stock } = useContext(StockContext);
  const { user, token } = useUser();
  const [timeSeries, setTimeSeries] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [news, setNews] = useState([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [quantity, setQuantity] = useState('');
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
              x: date,
              y: parseFloat(historicalData[date]['4. close']),
            }));
            setTimeSeries(formattedData);

            const latestDate = Object.keys(historicalData)[0];
            setLatestData(historicalData[latestDate]);
          } else {
            throw new Error('Invalid data format from fetch API');
          }

        } catch (error) {
          console.error('Failed to fetch stock data using fetch API:', error);
        }

        try {
          const newsResponse = await axios.get(`http://localhost:8080/api/stocks/stock/news/${stock.symbol}`);
          setNews(newsResponse.data);
          console.log('Fetched news data using axios:', newsResponse.data);

          const historicalResponse = await axios.get(`http://localhost:8080/api/stocks/stock/historical/${stock.symbol}`);
          console.log('Fetched historical data using axios:', historicalResponse.data);

          const axiosHistoricalData = historicalResponse.data['Weekly Time Series'];
          if (axiosHistoricalData) {
            const axiosFormattedData = Object.keys(axiosHistoricalData).map((date) => ({
              date,
              open: parseFloat(axiosHistoricalData[date]['1. open']),
              close: parseFloat(axiosHistoricalData[date]['4. close']),
              high: parseFloat(axiosHistoricalData[date]['2. high']),
              low: parseFloat(axiosHistoricalData[date]['3. low']),
            }));
            setTimeSeries(axiosFormattedData);
          } else {
            console.log('Unexpected data format:', historicalResponse.data);
            throw new Error('Invalid data format from axios');
          }
        } catch (error) {
          console.error('Failed to fetch stock data using axios:', error);
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

  const setAlert = async () => {
    if (!targetPrice) {
      Alert.alert('Error', 'Please enter a target price');
      return;
    }
    try {
      const pushToken = await registerForPushNotificationsAsync();
      await axios.post('http://localhost:8080/api/alerts', {
        userId: user?.id,
        symbol: stock.symbol,
        targetPrice: parseFloat(targetPrice),
        pushToken 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Alert set successfully');
    } catch (error) {
      console.error('Failed to set alert:', error);
      Alert.alert('Error', 'Failed to set alert');
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
          <View style={tw`h-48 flex-row mb-4`}>
            <AreaChart
              style={{ flex: 1 }}
              data={timeSeries.map((pt) => pt.y)}
              contentInset={{ top: 30, bottom: 30 }}
              curve={shape.curveNatural}
              svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            >
              <Grid />
            </AreaChart>
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
          <View style={tw`mb-4`}>
            <TextInput
              style={tw`h-12 border border-gray-300 rounded-lg mb-4 px-4 text-white`}
              placeholder="Target Price"
              placeholderTextColor="#888888"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity style={tw`bg-red-600 p-3 rounded-lg`} onPress={setAlert}>
              <Text style={tw`text-white text-center font-bold`}>Set Alert</Text>
            </TouchableOpacity>
          </View>
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
