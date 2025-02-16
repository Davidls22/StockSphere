// usePortfolio.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import usePortfolio from '../../hooks/usePortfolio';
import { fetchPortfolio, removeStockFromPortfolio } from '../../services/api';
import { useUser } from '../../contexts/AuthContext';

// Mock the API functions and AuthContext hook
jest.mock('../../services/api', () => ({
  fetchPortfolio: jest.fn(),
  removeStockFromPortfolio: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useUser: jest.fn(),
}));

describe('usePortfolio hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set loading to false if no user is provided', async () => {
    // Simulate no user in the context
    (useUser as jest.Mock).mockReturnValue({ user: null });
    const { result } = renderHook(() => usePortfolio());

    // Wait until loading becomes false
    await waitFor(() => result.current.loading === false);

    expect(result.current.loading).toBe(false);
    expect(result.current.portfolios).toEqual([]);
    expect(result.current.totalValue).toBe(0);
  });

  it('should fetch portfolio for a user and update state', async () => {
    const mockUser = { id: 'user1' };
    const mockPortfolios = [
      {
        _id: 'portfolio1',
        user: { _id: 'user1', username: 'testuser' },
        stocks: [
          { symbol: 'AAPL', quantity: 10, currentPrice: 150 },
          { symbol: 'GOOG', quantity: 5, currentPrice: 200 },
        ],
      },
    ];
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (fetchPortfolio as jest.Mock).mockResolvedValue(mockPortfolios);

    const { result } = renderHook(() => usePortfolio());
    await waitFor(() => result.current.loading === false);

    expect(fetchPortfolio).toHaveBeenCalledWith('user1');
    expect(result.current.portfolios).toEqual(mockPortfolios);
    expect(result.current.loading).toBe(false);
    // Total value: (10 * 150) + (5 * 200) = 1500 + 1000 = 2500
    expect(result.current.totalValue).toEqual(2500);
  });

  it('should handle error during portfolio fetch and set loading to false', async () => {
    const mockUser = { id: 'user1' };
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    const error = new Error('Fetch error');
    (fetchPortfolio as jest.Mock).mockRejectedValue(error);

    // Suppress the expected console.error output during this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => usePortfolio());
    await waitFor(() => result.current.loading === false);

    expect(result.current.portfolios).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.totalValue).toEqual(0);

    consoleErrorSpy.mockRestore();
  });

  it('should update portfolios when removeStock is called', async () => {
    const mockUser = { id: 'user1' };
    const initialPortfolio = {
      _id: 'portfolio1',
      user: { _id: 'user1', username: 'testuser' },
      stocks: [
        { symbol: 'AAPL', quantity: 10, currentPrice: 150 },
        { symbol: 'GOOG', quantity: 5, currentPrice: 200 },
      ],
    };
    const updatedPortfolio = {
      _id: 'portfolio1',
      user: { _id: 'user1', username: 'testuser' },
      stocks: [
        // AAPL has been removed
        { symbol: 'GOOG', quantity: 5, currentPrice: 200 },
      ],
    };

    (useUser as jest.Mock).mockReturnValue({ user: mockUser });
    (fetchPortfolio as jest.Mock).mockResolvedValue([initialPortfolio]);
    (removeStockFromPortfolio as jest.Mock).mockResolvedValue(updatedPortfolio);

    const { result } = renderHook(() => usePortfolio());
    await waitFor(() => result.current.loading === false);

    await act(async () => {
      await result.current.removeStock('portfolio1', 'AAPL');
    });

    expect(removeStockFromPortfolio).toHaveBeenCalledWith('portfolio1', 'AAPL');
    expect(result.current.portfolios).toEqual([updatedPortfolio]);
    // Total value after removal: (5 * 200) = 1000
    expect(result.current.totalValue).toEqual(1000);
  });
});