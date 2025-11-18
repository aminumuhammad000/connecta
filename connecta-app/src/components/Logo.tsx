import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const Logo: React.FC<LogoProps> = ({ size = 28, style }) => {
  return (
    <Image source={require('../../assets/favicon.png')} style={[{ width: size, height: size, borderRadius: 6 }, style]} />
  );
};

export default Logo;
