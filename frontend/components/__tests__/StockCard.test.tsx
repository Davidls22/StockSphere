import { render } from '@testing-library/react-native';
import StockCard from '../../components/StockCard';

describe('StockCard', () => {
  it('renders stock details correctly', () => {
    const stock = {
      symbol: 'AAPL',
      date: '2023-03-10',
      '1. open': '150.00',
      '4. close': '155.00',
    };
    const { getByText } = render(<StockCard stock={stock} />);
    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('2023-03-10')).toBeTruthy();
    expect(getByText('Open: 150.00')).toBeTruthy();
    expect(getByText('Close: 155.00')).toBeTruthy();
  });
});