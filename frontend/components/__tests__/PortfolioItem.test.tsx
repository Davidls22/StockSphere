import { render, fireEvent } from '@testing-library/react-native';
import PortfolioItem from '../../components/PortfolioItem';

describe('PortfolioItem component', () => {
  const onRemoveStockMock = jest.fn();
  const portfolioId = 'portfolio1';
  const stock = { symbol: 'AAPL', quantity: 10, currentPrice: 150 };

  it('renders stock details correctly', () => {
    const { getByText } = render(
      <PortfolioItem
        portfolioId={portfolioId}
        stock={stock}
        onRemoveStock={onRemoveStockMock}
      />
    );
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('Quantity: 10')).toBeTruthy();
    expect(getByText('Current Price: $150.00')).toBeTruthy();
    expect(getByText('Total Value: $1500.00')).toBeTruthy();
  });

  it('calls onRemoveStock when Remove button is pressed', () => {
    const { getByText } = render(
      <PortfolioItem
        portfolioId={portfolioId}
        stock={stock}
        onRemoveStock={onRemoveStockMock}
      />
    );
    const removeButton = getByText('Remove');
    fireEvent.press(removeButton);
    expect(onRemoveStockMock).toHaveBeenCalledWith(portfolioId, stock.symbol);
  });
});