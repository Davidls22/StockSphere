import { render } from '@testing-library/react-native';
import LoadingIndicator from '../../components/LoadingIndicator';

describe('LoadingIndicator component', () => {
  it('renders an ActivityIndicator and loading text', () => {
    const { getByText } = render(<LoadingIndicator />);
    expect(getByText('Loading...')).toBeTruthy();
  });
});