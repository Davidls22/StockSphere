import { useEffect, useState } from 'react';
import { fetchPortfolio, removeStockFromPortfolio } from '../services/api';
import { useUser } from '../contexts/AuthContext';

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

export default function usePortfolio() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchUserPortfolio = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const portfolios = await fetchPortfolio(user.id);
        setPortfolios(portfolios);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPortfolio();
  }, [user]);

  const removeStock = async (portfolioId: string, stockSymbol: string) => {
    try {
      const updatedPortfolio = await removeStockFromPortfolio(portfolioId, stockSymbol);
      setPortfolios((prevPortfolios) =>
        prevPortfolios.map((portfolio) =>
          portfolio._id === portfolioId ? updatedPortfolio : portfolio
        )
      );
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  };

  const totalValue = portfolios.reduce(
    (acc, portfolio) =>
      acc +
      portfolio.stocks.reduce(
        (sum, stock) => sum + (stock.quantity * (stock.currentPrice || 0)),
        0
      ),
    0
  );

  return { portfolios, loading, removeStock, totalValue };
}