import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

//auth apis
export const loginUser = (username: string, password: string) =>
  apiClient.post('/auth/login', { username, password });

export const registerUser = (username: string, password: string) =>
  apiClient.post('/auth/register', { username, password });


//portfolio apis
export const fetchPortfolio = (userId: string) =>
  apiClient.get(`/portfolios`, { params: { userId } });

export const addToPortfolio = (userId: string, symbol: string, quantity: number) =>
  apiClient.post('/portfolios', {
    userId,
    stocks: [{ symbol, quantity }],
  });

export const removeStockFromPortfolio = (portfolioId: string, stockSymbol: string) =>
  apiClient.delete(`/portfolios/${portfolioId}/stocks/${stockSymbol}`);


// watchlist apis
export const getWatchlist = (userId: string) =>
  apiClient.get(`/watchlist/watchlists/${userId}`);

export const addStockToWatchlist = (stockId: string, userId: string) =>
  apiClient.post(`/watchlist/watchlists`, { stockId, user: userId });

export const removeStockFromWatchlist = (userId: string, stockId: string) =>
  apiClient.delete(`/watchlist/watchlists/${userId}/stocks/${stockId}`);

// stock data apis
export const getStockData = async (symbol: string) => {
    const response = await axios.get(`/api/stocks/stock/${symbol}`);
    return response.data;
  };
  
  export const getStockNews = async (symbol: string) => {
    const response = await axios.get(`/api/stocks/stock/news/${symbol}`);
    return response.data;
  };
  
  export const getStockHistoricalData = async (symbol: string) => {
    const response = await axios.get(`/api/stocks/stock/historical/${symbol}`);
    return response.data;
  };