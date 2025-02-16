import { render, fireEvent } from '@testing-library/react-native';
import SearchInput from '../../components/SearchInput';

describe('SearchInput', () => {
  it('renders a TextInput with the correct value and calls onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const value = 'AAPL';
    const { getByDisplayValue } = render(
      <SearchInput value={value} onChangeText={onChangeTextMock} />
    );
    const input = getByDisplayValue(value);
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'GOOG');
    expect(onChangeTextMock).toHaveBeenCalledWith('GOOG');
  });
});