import React, { useEffect } from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '../../constants/theme';

interface Props {
  checked: boolean;
  onToggle: () => void;
  urgentColor?: string;
  size?: number;
}

export const CircularCheckbox: React.FC<Props> = ({
  checked, onToggle, urgentColor, size = 24,
}) => {
  const progress = useSharedValue(checked ? 1 : 0);
  const scale    = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(checked ? 1 : 0, { stiffness: 220, damping: 18 });
  }, [checked]);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [urgentColor ?? Colors.textDisabled, Colors.success]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['transparent', Colors.successDim]),
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 0.5, 1], [0.2, 1.3, 1]) }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.82, { stiffness: 400, damping: 15 }, () => {
      scale.value = withSpring(1, { stiffness: 300, damping: 12 });
    });
    onToggle();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Animated.View style={[{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
      }, containerStyle]}>
        <Animated.Text style={[{ color: Colors.success, fontSize: size * 0.48, fontWeight: '700' }, checkStyle]}>
          ✓
        </Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
