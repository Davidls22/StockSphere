import React from 'react';
import { render } from '@testing-library/react-native';
import PortfolioDetails from '../portfolioAnalytics';
import usePortfolio from '@/hooks/usePortfolio';
import { Text } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/hooks/usePortfolio', () => ({
  __esModule: true,
  default: jest.fn(),
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
jest.mock('@/components/PortfolioItem', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return (props: any) => <Text>{props.stock.symbol}</Text>;
});

describe('PortfolioDetails screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders loading state when loading is true', () => {
    (usePortfolio as jest.Mock).mockReturnValue({
      portfolios: [],
      loading: true,
      removeStock: jest.fn(),
      totalValue: 0,
    });
    const { getByText } = render(<PortfolioDetails />);
    expect(getByText('Loading...')).toBeTruthy();
  });
  it('renders empty state when no portfolios are found', () => {
    (usePortfolio as jest.Mock).mockReturnValue({
      portfolios: [],
      loading: false,
      removeStock: jest.fn(),
      totalValue: 0,
    });
    const { getByText } = render(<PortfolioDetails />);
    expect(getByText('No portfolio found.')).toBeTruthy();
  });
  it('renders portfolio items and total value when portfolios exist', () => {
    const mockPortfolios = [
      {
        _id: 'p1',
        stocks: [
          { symbol: 'AAPL', quantity: 10, currentPrice: 150 },
          { symbol: 'GOOGL', quantity: 5, currentPrice: 200 },
        ],
      },
    ];
    (usePortfolio as jest.Mock).mockReturnValue({
      portfolios: mockPortfolios,
      loading: false,
      removeStock: jest.fn(),
      totalValue: 2500,
    });
    const { getByText } = render(<PortfolioDetails />);
    expect(getByText('Portfolio Details')).toBeTruthy();
    expect(getByText('Total Portfolio Value: $2500.00')).toBeTruthy();
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('GOOGL')).toBeTruthy();
  });
});