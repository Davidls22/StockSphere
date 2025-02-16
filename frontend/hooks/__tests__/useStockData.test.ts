import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { useStockData, StockDataPoint } from '../../hooks/useStockData';
import { getStockData, getStockNews, getStockHistoricalData } from '../../services/api';

jest.mock('../../services/api', () => ({
  getStockData: jest.fn(),
  getStockNews: jest.fn(),
  getStockHistoricalData: jest.fn(),
}));

describe('useStockData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and format stock data correctly when symbol is provided', async () => {
    const symbol = 'AAPL';

    (getStockData as jest.Mock).mockResolvedValue({
      data: {
        'Time Series (Daily)': {
          '2025-02-15': { '4. close': '150.00' },
          '2025-02-14': { '4. close': '145.00' },
        },
      },
    });
    (getStockNews as jest.Mock).mockResolvedValue([{ headline: 'News 1' }]);
    (getStockHistoricalData as jest.Mock).mockResolvedValue({
      'Time Series (Daily)': {
        '2025-01-01': { '4. close': '140.00' },
        '2024-12-31': { '4. close': '138.00' },
      },
    });

    const { result } = renderHook(() => useStockData(symbol));

    await waitFor(() => result.current.timeSeries.length > 0);
    await waitFor(() => result.current.latestData !== null);
    await waitFor(() => result.current.historicalSeries.length > 0);
    await waitFor(() => result.current.news.length > 0);

    expect(getStockData).toHaveBeenCalledWith(symbol);

    expect(result.current.timeSeries).toEqual([
      { date: new Date('2025-02-15'), y: 150 },
      { date: new Date('2025-02-14'), y: 145 },
    ]);

    expect(result.current.latestData).toEqual({ '4. close': '150.00' });

    expect(result.current.historicalSeries).toEqual([
      { date: new Date('2025-01-01'), y: 140 },
      { date: new Date('2024-12-31'), y: 138 },
    ]);

    expect(result.current.news).toEqual([{ headline: 'News 1' }]);
  });

  it('should not fetch any data if symbol is undefined', async () => {
    const { result } = renderHook(() => useStockData(undefined));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.timeSeries).toEqual([]);
    expect(result.current.historicalSeries).toEqual([]);
    expect(result.current.latestData).toBeNull();
    expect(result.current.news).toEqual([]);
  });
});