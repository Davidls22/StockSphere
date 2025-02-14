import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, Alert, Text } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/AuthContext';
import WatchlistItem from '../../components/WatchListCard';
import StockContext from '../../contexts/StockContext';
import tw from 'twrnc'; 
import Header from '@/components/Header';
import { getWatchlist, removeStockFromWatchlist } from '../../services/api';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const { user, token } = useUser();
  const { setStock } = useContext(StockContext);
  const router = useRouter();

  const fetchWatchlist = async () => {
    if (!user) {
      console.error('User is not logged in');
      return;
    }
  
    try {
      const data = await getWatchlist(user.id);
      console.log('Response from server:', data);
      setWatchlist(data);
    } catch (error) {
      console.error('Failed to fetch watchlist:', error);
    }
  };
  
  useEffect(() => {
    fetchWatchlist();
  }, [user]);
  
  const handleRemove = async (stockId) => {
    try {
      console.log(`Removing stock ${stockId} from watchlist`);
      await removeStockFromWatchlist(user.id, stockId);
  
      setWatchlist((prevWatchlist) =>
        prevWatchlist.map((watchlist) => ({
          ...watchlist,
          stocks: watchlist.stocks.filter((stock) => stock._id !== stockId),
        }))
      );
    } catch (error) {
      console.error('Failed to remove stock from watchlist:', error);
      Alert.alert('Error', 'Failed to remove stock from watchlist');
    }
  };

  const handleStockSelect = (stock) => {
    setStock(stock);
    router.push(`/stockDetail/${stock.symbol}`);
  };

  return (
    <View style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
      <Header />
      {watchlist.length === 0 ? (
        <Text style={tw`text-white text-center`}>No stocks in your watchlist.</Text>
      ) : (
        watchlist.map((watchlistItem, index) => (
          <FlatList
            key={index}  
            data={watchlistItem.stocks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <WatchlistItem stock={item} onRemove={handleRemove} onSelect={handleStockSelect} />
            )}
          />
        ))
      )}
    </View>
  );
}
