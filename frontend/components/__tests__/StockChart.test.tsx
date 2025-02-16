import { render } from '@testing-library/react-native';

jest.mock('d3-scale', () => ({
    scaleTime: jest.fn(() => ({
      domain: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
    })),
  }));
  jest.mock('d3-shape', () => ({}));

import StockChart from '../../components/StockChart';

describe('StockChart component', () => {
  it('renders correctly with provided chartData and keyDates', () => {
    const chartData = [100, 150, 200, 250];
    const keyDates = [
      new Date('2023-01-01'),
      new Date('2023-01-02'),
      new Date('2023-01-03'),
      new Date('2023-01-04'),
    ];
    
    const { toJSON } = render(
      <StockChart chartData={chartData} keyDates={keyDates} isHistorical={false} />
    );
    expect(toJSON()).toBeTruthy();
  });
});