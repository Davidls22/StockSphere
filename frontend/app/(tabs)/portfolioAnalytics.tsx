import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useUser } from '../../contexts/AuthContext';
import Header from '@/components/Header';
import tw from 'twrnc'; 

interface Stock {
  symbol: string;
  quantity: number;
  currentPrice: number;
}

interface Portfolio {
  _id: string;
  user: string;
  stocks: Stock[];
}

export default function PortfolioDetails() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, token } = useUser();

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) {
        console.log('No user available');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/portfolios`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: user.id },
        });
        console.log('Portfolio data:', response.data);

        if (response.data.length > 0) {
          const portfolioData = response.data[0]; 
          const updatedStocks = await Promise.all(portfolioData.stocks.map(async (stock: Stock) => {
            const stockResponse = await axios.get('https://www.alphavantage.co/query', {
              params: {
                function: 'GLOBAL_QUOTE',
                symbol: stock.symbol,
                apikey: process.env.ALPHA_VANTAGE_API_KEY,
              },
            });
            const currentPrice = parseFloat(stockResponse.data['Global Quote']['05. price']);
            return { ...stock, currentPrice };
          }));
          setPortfolio({ ...portfolioData, stocks: updatedStocks });
        } else {
          console.log('No portfolio found for the user');
          setPortfolio(null);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user, token]);

  if (loading) {
    return (
      <View style={tw`flex-1 bg-[#1a1a1a]`}>
        <Header />
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={tw`text-white mt-4`}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!portfolio) {
    return (
      <View style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
        <Header />
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-white`}>No portfolio found.</Text>
        </View>
      </View>
    );
  }

  const totalValue = portfolio.stocks.reduce((acc, stock) => acc + stock.quantity * stock.currentPrice, 0);

  return (
    <View style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
      <Header />
      <View style={tw`flex-1 p-4`}>
        <Text style={tw`text-2xl font-bold text-white mb-4`}>Portfolio Details</Text>
        <FlatList
          data={portfolio.stocks}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <View style={tw`p-4 border-b border-gray-600 mb-4`}>
              <Text style={tw`text-xl font-bold text-white`}>{item.symbol}</Text>
              <Text style={tw`text-white`}>Quantity: {item.quantity}</Text>
              <Text style={tw`text-white`}>Current Price: ${item.currentPrice.toFixed(2)}</Text>
              <Text style={tw`text-white`}>Total Value: ${(item.quantity * item.currentPrice).toFixed(2)}</Text>
            </View>
          )}
        />
        <Text style={tw`text-xl font-bold text-white mt-4`}>Total Portfolio Value: ${totalValue.toFixed(2)}</Text>
      </View>
    </View>
  );
}
