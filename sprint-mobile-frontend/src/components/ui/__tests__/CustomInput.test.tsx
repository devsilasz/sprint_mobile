import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomInput } from '../CustomInput';

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

describe('CustomInput Component', () => {
  it('renders label and placeholder correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <CustomInput label="E-mail" placeholder="Digite seu e-mail" />
    );
    expect(getByText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Digite seu e-mail')).toBeTruthy();
  });

  it('triggers onChangeText when text is typed', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomInput label="E-mail" placeholder="Digite seu e-mail" onChangeText={onChangeTextMock} />
    );
    const input = getByPlaceholderText('Digite seu e-mail');
    fireEvent.changeText(input, 'test@example.com');
    expect(onChangeTextMock).toHaveBeenCalledWith('test@example.com');
  });

  it('displays error message when provided', () => {
    const { getByText } = render(
      <CustomInput label="E-mail" errorMessage="E-mail inválido" />
    );
    expect(getByText('E-mail inválido')).toBeTruthy();
  });

  it('handles focus and blur events', () => {
    const onFocusMock = jest.fn();
    const onBlurMock = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomInput
        label="E-mail"
        placeholder="Digite seu e-mail"
        onFocus={onFocusMock}
        onBlur={onBlurMock}
      />
    );
    const input = getByPlaceholderText('Digite seu e-mail');
    fireEvent(input, 'focus');
    expect(onFocusMock).toHaveBeenCalled();
    fireEvent(input, 'blur');
    expect(onBlurMock).toHaveBeenCalled();
  });
});
