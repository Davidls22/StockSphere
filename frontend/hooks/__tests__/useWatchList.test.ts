import { renderHook, act} from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import useWatchList from '../../hooks/useWatchList';
import { getWatchlist, removeStockFromWatchlist } from '../../services/api';
import { useUser } from '../../contexts/AuthContext';
import { Alert } from 'react-native';

jest.mock('../../services/api', () => ({
  getWatchlist: jest.fn(),
  removeStockFromWatchlist: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useUser: jest.fn(),
}));

describe('useWatchlist hook', () => {
  const user = { id: 'user123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ user });
  });

  it('should fetch watchlist successfully', async () => {
    const mockWatchlist = [
      {
        _id: 'watchlist1',
        stocks: [
          { _id: 'stock1', symbol: 'AAPL', name: 'Apple' },
          { _id: 'stock2', symbol: 'GOOGL', name: 'Google' },
        ],
      },
    ];
    (getWatchlist as jest.Mock).mockResolvedValue(mockWatchlist);

    const { result } = renderHook(() => useWatchList());

    await waitFor(() => result.current.loading === false);

    expect(getWatchlist).toHaveBeenCalledWith(user.id);
    expect(result.current.watchlist).toEqual(mockWatchlist);
    expect(result.current.loading).toBe(false);
  });

  it('should update watchlist when removeStock is called', async () => {
    const initialWatchlist = [
      {
        _id: 'watchlist1',
        stocks: [
          { _id: 'stock1', symbol: 'AAPL', name: 'Apple' },
          { _id: 'stock2', symbol: 'GOOGL', name: 'Google' },
        ],
      },
    ];
    (getWatchlist as jest.Mock).mockResolvedValue(initialWatchlist);
    (removeStockFromWatchlist as jest.Mock).mockResolvedValue({}); 

    const { result } = renderHook(() => useWatchList());
    await waitFor(() => result.current.loading === false);

    await act(async () => {
      await result.current.removeStock('stock1');
    });

    expect(removeStockFromWatchlist).toHaveBeenCalledWith(user.id, 'stock1');

    const expectedWatchlist = [
      {
        _id: 'watchlist1',
        stocks: [{ _id: 'stock2', symbol: 'GOOGL', name: 'Google' }],
      },
    ];
    expect(result.current.watchlist).toEqual(expectedWatchlist);
  });

  it('should alert error when removeStock fails', async () => {
    const initialWatchlist = [
      {
        _id: 'watchlist1',
        stocks: [
          { _id: 'stock1', symbol: 'AAPL', name: 'Apple' },
          { _id: 'stock2', symbol: 'GOOGL', name: 'Google' },
        ],
      },
    ];
    (getWatchlist as jest.Mock).mockResolvedValue(initialWatchlist);
    (removeStockFromWatchlist as jest.Mock).mockRejectedValue(new Error('Remove error'));

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useWatchList());
    await waitFor(() => result.current.loading === false);

    await act(async () => {
      await result.current.removeStock('stock1');
    });

    expect(removeStockFromWatchlist).toHaveBeenCalledWith(user.id, 'stock1');
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to remove stock from watchlist');

    alertSpy.mockRestore();
  });

  it('should do nothing if no user is present', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null });
    (getWatchlist as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useWatchList());

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.watchlist).toEqual([]);
    expect(result.current.loading).toBe(true);
  });
});