import { render } from '@testing-library/react-native';
import StockInfo from '../../components/StockInfo';

describe('StockInfo component', () => {
  it('renders stock details when latestData is provided', () => {
    const latestData = {
      '1. open': '100.00',
      '2. high': '110.00',
      '3. low': '95.00',
      '4. close': '105.00',
      '5. volume': '1000000',
    };

    const { getByText } = render(<StockInfo latestData={latestData} />);
    expect(getByText(/Open: 100.00/)).toBeTruthy();
    expect(getByText(/High: 110.00/)).toBeTruthy();
    expect(getByText(/Low: 95.00/)).toBeTruthy();
    expect(getByText(/Close: 105.00/)).toBeTruthy();
    expect(getByText(/Volume: 1000000/)).toBeTruthy();
  });

  it('renders nothing when latestData is null', () => {
    const { toJSON } = render(<StockInfo latestData={null} />);
    expect(toJSON()).toBeNull();
  });
});