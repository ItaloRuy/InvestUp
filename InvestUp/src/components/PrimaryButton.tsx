/**
 * PrimaryButton — Botão principal do InvestUp
 * UX/UI Agent | Tier 1
 *
 * Suporta 5 variantes, 3 tamanhos, loading state e ícones.
 * Acessível: role="button", accessibilityLabel obrigatório quando sem texto.
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, radius, touchTarget, animation } from '@/design-system/tokens';
import { buttonVariants, ButtonVariant } from '@/design-system/theme';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────
interface PrimaryButtonProps {
  /** Texto exibido no botão */
  label: string;
  /** Callback ao pressionar */
  onPress: () => void;
  /** Variante visual */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Exibe spinner e desabilita interação */
  loading?: boolean;
  /** Desabilita o botão */
  disabled?: boolean;
  /** Ícone antes do texto (componente React) */
  iconLeft?: React.ReactNode;
  /** Ícone após o texto */
  iconRight?: React.ReactNode;
  /** Ocupa 100% da largura do container */
  fullWidth?: boolean;
  /** Acessibilidade — obrigatório quando o label não descreve a ação */
  accessibilityLabel?: string;
  /** Style extra para o container */
  style?: ViewStyle;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  accessibilityLabel,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const variantStyle = buttonVariants[variant];
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: animation.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={[
          styles.base,
          styles[size],
          {
            backgroundColor: variantStyle.background,
            borderColor: variantStyle.border,
            borderWidth: variantStyle.border === 'transparent' ? 0 : 1.5,
          },
          isDisabled && styles.disabled,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyle.text}
            accessibilityLabel="Carregando"
          />
        ) : (
          <View style={styles.content}>
            {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
            <Text
              style={[
                styles.label,
                labelSizeMap[size],
                { color: isDisabled ? colors.textMuted : variantStyle.text },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const labelSizeMap: Record<'sm' | 'md' | 'lg', TextStyle> = {
  sm: { ...typography.label, fontWeight: '600' },
  md: { ...typography.bodyBold },
  lg: { ...typography.h3 },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  // Tamanhos — altura mínima sempre ≥ 44px (WCAG)
  sm: {
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  md: {
    minHeight: touchTarget.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + spacing.xs,
  },
  lg: {
    minHeight: touchTarget.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  disabled: {
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  label: {
    textAlign: 'center',
  },
});
