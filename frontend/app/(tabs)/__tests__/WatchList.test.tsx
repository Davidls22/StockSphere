import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Watchlist from '../watchList';
import useWatchlist from '@/hooks/useWatchList';
import { useStockContext } from '@/contexts/StockContext';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/hooks/useWatchList', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/contexts/StockContext', () => ({
  useStockContext: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/Header', () => () => null);
jest.mock('@/components/LoadingIndicator', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>Loading...</Text>;
});
jest.mock('@/components/EmptyState', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.message}</Text>;
});
jest.mock('@/components/WatchListItem', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={() => props.onSelect(props.stock)}>
      <Text>{props.stock.symbol} - View Details</Text>
    </TouchableOpacity>
  );
});

describe('Watchlist screen', () => {
  const mockRouterPush = jest.fn();
  const mockSetStock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useStockContext as jest.Mock).mockReturnValue({ setStock: mockSetStock });
  });

  it('renders loading state when loading is true', () => {
    (useWatchlist as jest.Mock).mockReturnValue({
      watchlist: [],
      loading: true,
      removeStock: jest.fn(),
    });
    const { getByText } = render(<Watchlist />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders empty state when no stocks are in watchlist', () => {
    (useWatchlist as jest.Mock).mockReturnValue({
      watchlist: [{ _id: 'w1', stocks: [] }],
      loading: false,
      removeStock: jest.fn(),
    });
    const { getByText } = render(<Watchlist />);
    expect(getByText('No stocks in your watchlist.')).toBeTruthy();
  });

  it('renders watchlist items and handles stock selection', () => {
    const mockWatchlist = [
      {
        _id: 'w1',
        stocks: [
          { _id: 's1', symbol: 'AAPL', name: 'Apple Inc.' },
          { _id: 's2', symbol: 'GOOGL', name: 'Google' },
        ],
      },
    ];
    (useWatchlist as jest.Mock).mockReturnValue({
      watchlist: mockWatchlist,
      loading: false,
      removeStock: jest.fn(),
    });
    const { getByText } = render(<Watchlist />);
    expect(getByText(/AAPL/)).toBeTruthy();
    const viewDetailsButton = getByText('AAPL - View Details');
    fireEvent.press(viewDetailsButton);
    expect(mockSetStock).toHaveBeenCalledWith({
      _id: 's1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
    });
    expect(mockRouterPush).toHaveBeenCalledWith('/stockDetail/AAPL');
  });
});