import { useEffect, useState, useCallback } from 'react';
import { fetchPortfolio, removeStockFromPortfolio } from '../services/api';
import { useUser } from '../contexts/AuthContext';

interface Stock {
  symbol: string;
  quantity: number;
  price?: number;
}

interface Portfolio {
  _id: string;
  user: { _id: string; username: string };
  stocks: Stock[];
}

export default function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  const fetchUserPortfolio = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPortfolio(user.id);
      setPortfolios(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPortfolio();
  }, [fetchUserPortfolio]);

  const removeStock = async (portfolioId: string, stockSymbol: string) => {
    try {
      const updatedPortfolio = await removeStockFromPortfolio(portfolioId, stockSymbol);
      setPortfolios((prev) =>
        prev.map((p) => (p._id === portfolioId ? updatedPortfolio : p))
      );
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  };

  const totalValue = portfolios.reduce(
    (acc, portfolio) =>
      acc +
      portfolio.stocks.reduce(
        (sum, stock) => sum + (stock.quantity * (stock.price || 0)),
        0
      ),
    0
  );

  return { portfolios, loading, removeStock, totalValue, fetchUserPortfolio };
}