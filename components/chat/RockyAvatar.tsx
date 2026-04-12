import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

// Color palette
const P: Record<string, string> = {
  H: '#1a1a1a', // hair
  h: '#2d2d2d', // hair highlight
  S: '#c8956c', // skin
  s: '#a0693a', // skin shadow
  E: '#0d0d0d', // eye / pupil
  W: '#e8c9a0', // eye white
  N: '#8b5e3c', // nose shadow
  M: '#7a3e28', // mouth / lip
  G: '#c0392b', // glove red
  r: '#7b241c', // glove dark
  g: '#e74c3c', // glove highlight
  T: '#d4a574', // skin mid-tone (neck/chest)
  '.': '',       // transparent
};

// 20-wide × 22-tall pixel Rocky Balboa
const GRID = [
  '.....HHHHHHHHHH.....',
  '....HHHHHHHHHHHH....',
  '...HHHhHHHHHhHHH....',
  '...HHSSSSSSSSSSHH...',
  '...HSSSSSSSSSSSSH...',
  '...SSSSSSSSSSSSSS...',
  '...SSWESSSSSEWSS....',  // eyes — E at col 6 and col 11
  '...SSSSSSSSSSSS.....',
  '...SSSSNNSSSSS......',  // nose
  '...SSSMMMMSSSS......',  // mouth
  '....SSSSSSSS........',  // chin
  '....TSSSSSST........',  // neck
  '..GGTSSSSSSSTGG.....',  // shoulders
  '.GGGGsSSSSSsGGGG....',  // upper arms
  'GGGGGrrrrrrGGGGG....',  // gloves mid
  'GGGGGrrrrrrrGGGG....',
  '.GGGGGrrrrrGGGGG....',
  '..GGGGGrrrGGGGG.....',
  '...GGGGGrGGGGG......',
  '....GGGGGGGGG.......',
  '.....GGGGGGG........',
  '......GGGGG.........',
];

// Row and column indices of eye pixels (character 'E' in row 6)
const EYE_ROW = 6;
const EYE_COLS = GRID[EYE_ROW]
  .split('')
  .reduce<number[]>((acc, ch, i) => (ch === 'E' ? [...acc, i] : acc), []);

const PIXEL = 2;

interface Props {
  size?: number;
  isThinking?: boolean;
}

export function RockyAvatar({ size, isThinking = false }: Props) {
  const rows = GRID.length;
  const cols = GRID[0].length;
  const px = size ? size / Math.max(rows, cols) : PIXEL;

  // Animated value for eye opacity: 1 = visible, 0 = closed (blink)
  const eyeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isThinking) {
      // Snap eyes back to fully visible when done thinking
      eyeOpacity.setValue(1);
      return;
    }

    // Blink loop: fade to 0 over 150ms, hold, fade back over 150ms, hold 600ms
    const blink = Animated.sequence([
      Animated.timing(eyeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(eyeOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.delay(600),
    ]);

    const loop = Animated.loop(blink);
    loop.start();

    return () => {
      loop.stop();
      eyeOpacity.setValue(1);
    };
  }, [isThinking, eyeOpacity]);

  return (
    <View style={{ width: cols * px, height: rows * px }}>
      {GRID.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', height: px }}>
          {row.split('').map((ch, ci) => {
            const isEyePixel = ri === EYE_ROW && EYE_COLS.includes(ci);

            if (isEyePixel) {
              return (
                <Animated.View
                  key={ci}
                  style={{
                    width: px,
                    height: px,
                    backgroundColor: P[ch] ?? 'transparent',
                    opacity: eyeOpacity,
                  }}
                />
              );
            }

            return (
              <View
                key={ci}
                style={{
                  width: px,
                  height: px,
                  backgroundColor: P[ch] ?? 'transparent',
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
