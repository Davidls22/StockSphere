import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import NewsArticle from '@/components/NewsArticle';
import StockContext from '../../contexts/StockContext';
import { fetchStockData } from '../../services/stockApi';
import tw from 'twrnc';

export default function Home() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setStock } = useContext(StockContext);

  const handleSearch = async () => {
    if (!searchSymbol.trim()) return;

    setLoading(true);
    try {
      const data = await fetchStockData(searchSymbol);
      setStock(data); 
      router.push(`/stockDetail/${searchSymbol}`); 
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 bg-[#1a1a1a]`}>
      <Header />
      <ScrollView contentContainerStyle={tw`p-2`}>
        <Image
          source={require('../../assets/images/stocks.jpg')} 
          style={tw`w-full h-64 mb-6 rounded-lg`}
          resizeMode="cover"
        />
        <Text style={tw`text-2xl font-bold text-white mb-4 text-center`}>Welcome to StockSphere </Text>
        <Text style={tw`text-lg text-gray-400 mb-8 text-center`}>
          Track your favorite stocks and stay updated with the latest market trends.
        </Text>
        <TextInput
          style={tw`h-12 border border-gray-700 rounded-lg mb-4 px-4 w-full bg-[#2a2a2a] text-white`}
          placeholder="Enter stock symbol"
          placeholderTextColor="#888888"
          value={searchSymbol}
          onChangeText={setSearchSymbol}
        />
        <TouchableOpacity
          style={tw`bg-blue-600 p-3 rounded-lg w-full mb-2 ${loading ? 'opacity-50' : 'opacity-100'}`}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={tw`text-white text-center font-bold`}>Search</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
