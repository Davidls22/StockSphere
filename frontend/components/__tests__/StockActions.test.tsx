import { render, fireEvent } from '@testing-library/react-native';
import StockActions from '../../components/StockActions';

describe('StockActions component', () => {
  const onQuantityChangeMock = jest.fn();
  const onAddToPortfolioMock = jest.fn();
  const onAddToWatchlistMock = jest.fn();

  it('renders buttons and input correctly', () => {
    const quantity = '5';
    const { getByText, getByPlaceholderText } = render(
      <StockActions
        quantity={quantity}
        onQuantityChange={onQuantityChangeMock}
        onAddToPortfolio={onAddToPortfolioMock}
        onAddToWatchlist={onAddToWatchlistMock}
      />
    );
    expect(getByText('Add to Watchlist')).toBeTruthy();
    expect(getByText('Add to Portfolio')).toBeTruthy();
    expect(getByPlaceholderText('Quantity')).toBeTruthy();
  });

  it('calls onAddToWatchlist when the "Add to Watchlist" button is pressed', () => {
    const quantity = '';
    const { getByText } = render(
      <StockActions
        quantity={quantity}
        onQuantityChange={onQuantityChangeMock}
        onAddToPortfolio={onAddToPortfolioMock}
        onAddToWatchlist={onAddToWatchlistMock}
      />
    );
    fireEvent.press(getByText('Add to Watchlist'));
    expect(onAddToWatchlistMock).toHaveBeenCalled();
  });

  it('calls onAddToPortfolio when the "Add to Portfolio" button is pressed', () => {
    const quantity = '10';
    const { getByText } = render(
      <StockActions
        quantity={quantity}
        onQuantityChange={onQuantityChangeMock}
        onAddToPortfolio={onAddToPortfolioMock}
        onAddToWatchlist={onAddToWatchlistMock}
      />
    );
    fireEvent.press(getByText('Add to Portfolio'));
    expect(onAddToPortfolioMock).toHaveBeenCalled();
  });

  it('calls onQuantityChange when text input changes', () => {
    const quantity = '';
    const { getByPlaceholderText } = render(
      <StockActions
        quantity={quantity}
        onQuantityChange={onQuantityChangeMock}
        onAddToPortfolio={onAddToPortfolioMock}
        onAddToWatchlist={onAddToWatchlistMock}
      />
    );
    const input = getByPlaceholderText('Quantity');
    fireEvent.changeText(input, '15');
    expect(onQuantityChangeMock).toHaveBeenCalledWith('15');
  });
});