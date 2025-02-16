import { render, fireEvent } from '@testing-library/react-native';
import WatchlistItem from '../../components/WatchListItem';

describe('WatchlistItem component', () => {
  const onRemoveMock = jest.fn();
  const onSelectMock = jest.fn();
  const stock = {
    _id: 'stock1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
  };

  it('renders stock symbol and company name', () => {
    const { getByText } = render(
      <WatchlistItem stock={stock} onRemove={onRemoveMock} onSelect={onSelectMock} />
    );
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('Apple Inc.')).toBeTruthy();
  });

  it('calls onSelect when "View Details" is pressed', () => {
    const { getByText } = render(
      <WatchlistItem stock={stock} onRemove={onRemoveMock} onSelect={onSelectMock} />
    );
    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);
    expect(onSelectMock).toHaveBeenCalledWith(stock);
  });

  it('calls onRemove when "Remove" is pressed', () => {
    const { getByText } = render(
      <WatchlistItem stock={stock} onRemove={onRemoveMock} onSelect={onSelectMock} />
    );
    const removeButton = getByText('Remove');
    fireEvent.press(removeButton);
    expect(onRemoveMock).toHaveBeenCalledWith(stock._id);
  });
});