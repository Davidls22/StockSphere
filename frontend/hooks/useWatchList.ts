import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getWatchlist, removeStockFromWatchlist } from '../services/api';
import { useUser } from '../contexts/AuthContext';

interface Stock {
  _id: string;
  symbol: string;
  name?: string;
}

interface Watchlist {
  _id: string;
  stocks: Stock[];
}

export default function useWatchlist() {
    const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useUser();
  
    const fetchWatchlist = async () => {
      if (!user) return;
      try {
        const data = await getWatchlist(user.id);
        setWatchlist(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch watchlist:', error);
      } finally {
        setLoading(false);
      }
    };
  
    const removeStock = async (stockId: string) => {
      if (!user) return;
      try {
        await removeStockFromWatchlist(user.id, stockId);
        setWatchlist((prev) =>
          prev.map((watchlist) => ({
            ...watchlist,
            stocks: watchlist.stocks.filter((stock) => stock._id !== stockId),
          }))
        );
      } catch (error) {
        console.error('Failed to remove stock:', error);
        Alert.alert('Error', 'Failed to remove stock from watchlist');
      }
    };
  
    useEffect(() => {
      fetchWatchlist();
    }, [user]);
  
    return { watchlist, loading, removeStock, refetch: fetchWatchlist };
  }