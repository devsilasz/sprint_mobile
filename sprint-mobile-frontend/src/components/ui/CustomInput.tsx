import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, StyleProp, ViewStyle, TextStyle, NativeSyntheticEvent, TargetedEvent } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Layout, Radius, Spacing, Typography } from '../../constants/theme';

interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  errorMessage?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function CustomInput({ label, errorMessage, style, inputStyle, onFocus, onBlur, ...rest }: CustomInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TargetedEvent>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: errorMessage 
              ? theme.colors.error 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.border,
          },
          inputStyle,
        ]}
        placeholderTextColor={theme.colors.textSecondary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {errorMessage ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  input: {
    height: Layout.controlHeight,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  error: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
});
