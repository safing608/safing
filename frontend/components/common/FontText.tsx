import React from 'react';
import { Text, TextProps } from 'react-native';
import { COLORS } from '@/constants/colors';
import { FONT_SIZES } from '@/constants/sizes';

type FontWeight = 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extraBold' | 'black';

const fontMap: Record<FontWeight, string> = {
  thin: 'Pretendard-Thin',
  light: 'Pretendard-Light',
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-SemiBold',
  extraBold: 'Pretendard-ExtraBold',
  black: 'Pretendard-Black',
};

interface FontTextProps extends TextProps {
  weight?: FontWeight;
  size?: number;
  color?: string;
  children: React.ReactNode;
}

function FontText({ 
  weight = 'regular', 
  size = FONT_SIZES.BODY, 
  color = COLORS.BLACK, 
  style,
  children,
  ...props 
}: FontTextProps) {
  return (
    <Text 
      style={[
        { 
          fontFamily: fontMap[weight], 
          fontSize: size, 
          color 
        }, 
        style
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}


export default FontText;