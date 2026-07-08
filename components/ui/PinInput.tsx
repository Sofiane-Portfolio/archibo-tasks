import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withTiming, withSpring,
} from 'react-native-reanimated';
import { Colors, Radius } from '../../constants/theme';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  onComplete?: (code: string) => void;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 4, value, onChange, error = false, onComplete,
}) => {
  const inputRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10,  { duration: 50 }),
        withTiming(-8,  { duration: 50 }),
        withTiming(8,   { duration: 50 }),
        withSpring(0,   { stiffness: 400, damping: 12 })
      );
    }
  }, [error]);

  const shakeAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[styles.row, shakeAnim]}>
        {Array.from({ length }).map((_, i) => {
          const filled = i < value.length;
          const active = i === value.length;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                filled && styles.cellFilled,
                active && styles.cellActive,
                error && styles.cellError,
              ]}
            >
              {filled && <View style={styles.dot} />}
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hidden}
        autoFocus
        caretHidden
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, justifyContent: 'center' },
  cell: {
    width: 58,
    height: 64,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: Colors.orange,
    backgroundColor: Colors.orangeDim,
  },
  cellActive: {
    borderColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  cellError: {
    borderColor: Colors.urgent,
    backgroundColor: Colors.urgentDim,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.orange,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
