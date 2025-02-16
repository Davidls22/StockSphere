import { render, fireEvent } from '@testing-library/react-native';
import SearchButton from '../../components/SearchButton';

describe('SearchButton', () => {
  it('renders an ActivityIndicator when loading is true', () => {
    const { queryByText, getByTestId } = render(
      <SearchButton loading={true} onPress={() => {}} />
    );
    expect(queryByText('Search')).toBeNull();
    expect(getByTestId('search-button-touchable')).toBeTruthy();
  });

  it('renders "Search" text when not loading', () => {
    const { getByText } = render(
      <SearchButton loading={false} onPress={() => {}} />
    );
    expect(getByText('Search')).toBeTruthy();
  });

  it('calls onPress when pressed and not loading', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <SearchButton loading={false} onPress={onPressMock} />
    );
    fireEvent.press(getByText('Search'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <SearchButton loading={true} onPress={onPressMock} />
    );
    const touchable = getByTestId('search-button-touchable');
    fireEvent.press(touchable);
    expect(onPressMock).not.toHaveBeenCalled();
  });
});