import { renderHook, act } from '@testing-library/react-hooks';
import useStockSearch from '../../hooks/useStockSearch';
import { getStockData } from '../../services/api';
import { useRouter } from 'expo-router';
import { useStockContext } from '../../contexts/StockContext';

jest.mock('../../services/api', () => ({
  getStockData: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../contexts/StockContext', () => ({
  useStockContext: jest.fn(),
}));

describe('useStockSearch hook', () => {
  const pushMock = jest.fn();
  const setStockMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useStockContext as jest.Mock).mockReturnValue({ setStock: setStockMock });
  });

  it('should do nothing if searchSymbol is empty', async () => {
    const { result } = renderHook(() => useStockSearch());

    expect(result.current.searchSymbol).toBe('');

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(getStockData).not.toHaveBeenCalled();
    expect(setStockMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('should fetch stock data, update context, and navigate when searchSymbol is provided', async () => {
    const symbol = 'AAPL';
    const mockData = { data: 'mockStockData' };
    (getStockData as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useStockSearch());

    act(() => {
      result.current.setSearchSymbol(symbol);
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(getStockData).toHaveBeenCalledWith(symbol);
    expect(setStockMock).toHaveBeenCalledWith(mockData);
    expect(pushMock).toHaveBeenCalledWith(`/stockDetail/${symbol}`);
    expect(result.current.loading).toBe(false);
  });

  it('should handle errors and set loading to false when getStockData fails', async () => {
    const symbol = 'AAPL';
    const errorMessage = 'API error';
    (getStockData as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useStockSearch());

    act(() => {
      result.current.setSearchSymbol(symbol);
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(getStockData).toHaveBeenCalledWith(symbol);
    expect(setStockMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});