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

//auth
export const loginUser = (username: string, password: string) =>
  apiClient.post('/auth/login', { username, password }).then((res) => res.data);

export const registerUser = (username: string, password: string) =>
  apiClient.post('/auth/register', { username, password }).then((res) => res.data);

//portfolio
export const fetchPortfolio = (userId: string) =>
  apiClient.get(`/portfolios`, { params: { userId } }).then((res) => res.data);

export const addToPortfolio = (userId: string, symbol: string, quantity: number) =>
  apiClient
    .post('/portfolios', {
      userId,
      stocks: [{ symbol, quantity }],
    })
    .then((res) => res.data);

export const removeStockFromPortfolio = (portfolioId: string, stockSymbol: string) =>
  apiClient
    .delete(`/portfolios/${portfolioId}/stocks/${stockSymbol}`)
    .then((res) => res.data);

//watchlist
export const getWatchlist = (userId: string) =>
  apiClient.get(`/watchlist/watchlists/${userId}`).then((res) => res.data);

export const addStockToWatchlist = (stockId: string, userId: string) =>
  apiClient
    .post(`/watchlist/watchlists`, { stockId, user: userId })
    .then((res) => res.data);

export const removeStockFromWatchlist = (userId: string, stockId: string) =>
  apiClient
    .delete(`/watchlist/watchlists/${userId}/stocks/${stockId}`)
    .then((res) => res.data);

// stock data apis
export const getStockData = (symbol: string) =>
  apiClient.get(`/stocks/stock/${symbol}`).then((res) => res.data);

export const getStockNews = (symbol: string) =>
  apiClient.get(`/stocks/stock/news/${symbol}`).then((res) => res.data);

export const getStockHistoricalData = (symbol: string) =>
  apiClient.get(`/stocks/stock/historical/${symbol}`).then((res) => res.data);

const NEWS_API_URL = 'https://api.marketaux.com/v1/news';
const NEWS_API_KEY = 'AalumZDxOZfmeUY0hNgV1r7Ox8tET0MAsqSJAHcr';

export const fetchNewsArticles = () =>
  axios
    .get(`${NEWS_API_URL}/all`, {
      params: {
        country: 'us',
        api_token: NEWS_API_KEY,
      },
      headers: {
        Accept: 'application/json',
      },
    })
    .then((res) => res.data);