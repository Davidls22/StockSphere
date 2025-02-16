import { render } from '@testing-library/react-native';
import EmptyState from '../EmptyState';

describe('EmptyState component', () => {
  it('renders the provided message', () => {
    const message = 'No data available';
    const { getByText } = render(<EmptyState message={message} />);
    expect(getByText(message)).toBeTruthy();
  });
});