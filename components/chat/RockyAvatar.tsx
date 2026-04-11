import { View } from 'react-native';

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
  '...SSWESSSSSEWSS....',  // eyes
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

const PIXEL = 2;

interface Props {
  size?: number;
}

export function RockyAvatar({ size }: Props) {
  const rows = GRID.length;
  const cols = GRID[0].length;
  const px = size ? size / Math.max(rows, cols) : PIXEL;

  return (
    <View style={{ width: cols * px, height: rows * px }}>
      {GRID.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', height: px }}>
          {row.split('').map((ch, ci) => (
            <View
              key={ci}
              style={{
                width: px,
                height: px,
                backgroundColor: P[ch] ?? 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
