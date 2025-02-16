import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Home from '..';
import useStockSearch from '@/hooks/useStockSearch';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/hooks/useStockSearch', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/contexts/AuthContext', () => ({
  useUser: jest.fn(() => ({ user: { username: 'Test User' }, signOut: jest.fn() })),
}));
jest.mock('@/components/Header', () => () => null);
jest.mock('@/components/SearchInput', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return (props: any) => (
    <TextInput
      placeholder="Enter stock symbol"
      value={props.value}
      onChangeText={props.onChangeText}
    />
  );
});
jest.mock('@/components/SearchButton', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress}>
      <Text>{props.loading ? 'Loading...' : 'Search'}</Text>
    </TouchableOpacity>
  );
});

describe('Home screen', () => {
  it('renders correctly and calls handleSearch on button press', () => {
    const handleSearchMock = jest.fn();
    const setSearchSymbolMock = jest.fn();
    (useStockSearch as jest.Mock).mockReturnValue({
      searchSymbol: 'AAPL',
      setSearchSymbol: setSearchSymbolMock,
      loading: false,
      handleSearch: handleSearchMock,
    });
    const { getByText, getByPlaceholderText } = render(<Home />);
    expect(getByText('Welcome to StockSphere')).toBeTruthy();
    expect(getByPlaceholderText('Enter stock symbol')).toBeTruthy();
    const searchButton = getByText('Search');
    fireEvent.press(searchButton);
    expect(handleSearchMock).toHaveBeenCalled();
  });
});