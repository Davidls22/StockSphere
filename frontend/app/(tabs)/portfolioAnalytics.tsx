import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUser } from '../../contexts/AuthContext';
import { fetchPortfolio } from '../../services/api';
import Header from '@/components/Header';
import tw from 'twrnc';
import { removeStockFromPortfolio } from '../../services/api';

interface Stock {
  symbol: string;
  quantity: number;
  currentPrice?: number;
}

interface Portfolio {
  _id: string;
  user: { _id: string; username: string };
  stocks: Stock[];
}

export default function PortfolioDetails() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, token } = useUser();

  useEffect(() => {
    const fetchUserPortfolio = async () => {
      if (!user) {
        console.log('No user available');
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetchPortfolio(user.id);
        console.log('Portfolio data:', response.data);
  
        const fetchedPortfolios = response.data;
        setPortfolios(fetchedPortfolios);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserPortfolio();
  }, [user]);

  const handleRemoveStock = async (portfolioId: string, stockSymbol: string) => {
    try {
      const updatedPortfolio = await removeStockFromPortfolio(portfolioId, stockSymbol);
      // Update the portfolio state with the modified portfolio
      const updatedPortfolios = portfolios.map((portfolio) =>
        portfolio._id === portfolioId ? updatedPortfolio : portfolio
      );
      setPortfolios(updatedPortfolios);
    } catch (error) {
      console.error('Failed to remove stock from portfolio:', error);
    }
  };

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

  if (portfolios.length === 0) {
    return (
      <View style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
        <Header />
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-white`}>No portfolio found.</Text>
        </View>
      </View>
    );
  }

  const totalValue = portfolios.reduce((acc, portfolio) => 
    acc + portfolio.stocks.reduce((acc, stock) => 
      acc + (stock.quantity * (stock.price || 0)), 0
    ), 0
  );

  return (
    <View style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
      <Header />
      <View style={tw`flex-1 p-4`}>
        <Text style={tw`text-2xl font-bold text-white mb-4`}>Portfolio Details</Text>
        <FlatList
          data={portfolios}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={tw`p-4 border-b border-gray-600 mb-4`}>
              {item.stocks.map((stock, index) => (
                <View key={index} style={tw`mb-4`}>
                  <Text style={tw`text-xl font-bold text-white`}>{stock.symbol}</Text>
                  <Text style={tw`text-white`}>Quantity: {stock.quantity}</Text>
                  <Text style={tw`text-white`}>Current Price: ${stock.price ? stock.price.toFixed(2) : 'N/A'}</Text>
                  <Text style={tw`text-white`}>Total Value: ${(stock.quantity * (stock.price || 0)).toFixed(2)}</Text>
                  <TouchableOpacity
                    style={tw`bg-red-600 p-2 rounded-lg mt-2`}
                    onPress={() => handleRemoveStock(item._id, stock.symbol)}
                  >
                    <Text style={tw`text-white text-center font-bold`}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
        <Text style={tw`text-xl font-bold text-white mt-4`}>Total Portfolio Value: ${totalValue.toFixed(2)}</Text>
      </View>
    </View>
  );
}
