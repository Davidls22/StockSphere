import { useState } from 'react';
import { useRouter } from 'expo-router';
import { getStockData } from '../services/api'
import { useStockContext } from '../contexts/StockContext';

export default function useStockSearch() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setStock } = useStockContext();

  const handleSearch = async () => {
    if (!searchSymbol.trim()) return;

    setLoading(true);
    try {
      const data = await getStockData(searchSymbol);
      setStock(data);
      router.push(`/stockDetail/${searchSymbol}`);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { searchSymbol, setSearchSymbol, loading, handleSearch };
}