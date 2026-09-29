import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from '../CustomButton';

jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#003478',
        secondary: '#FF9900',
        background: '#F5F5F5',
        surface: '#FFFFFF',
        text: '#111111',
        textSecondary: '#666666',
        border: '#E0E0E0',
        error: '#D32F2F',
        success: '#388E3C',
      },
    },
  }),
}));

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: <T extends unknown>(component: T): T => component,
    },
    useAnimatedStyle: <T extends unknown>(fn: () => T): T => fn(),
    useSharedValue: <T extends unknown>(val: T) => ({ value: val }),
    withSpring: <T extends unknown>(val: T): T => val,
  };
});

describe('CustomButton Component', () => {
  it('renders the button with correct text', () => {
    const { getByText } = render(<CustomButton title="Entrar" />);
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('triggers onPress function when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<CustomButton title="Entrar" onPress={onPressMock} />);
    fireEvent.press(getByText('Entrar'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('displays ActivityIndicator when loading is true', () => {
    const { queryByText, UNSAFE_root } = render(<CustomButton title="Entrar" loading={true} />);
    expect(queryByText('Entrar')).toBeNull();
    const activityIndicator = UNSAFE_root.findByType('ActivityIndicator');
    expect(activityIndicator).toBeTruthy();
  });

  it('does not trigger onPress when disabled or loading', () => {
    const onPressMock = jest.fn();
    const { getByText: getByTextDisabled } = render(
      <CustomButton title="Disabled" disabled={true} onPress={onPressMock} />
    );
    fireEvent.press(getByTextDisabled('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();

    const { queryByText } = render(
      <CustomButton title="Loading" loading={true} onPress={onPressMock} testID="loading-btn" />
    );
    expect(queryByText('Loading')).toBeNull();
  });
});
