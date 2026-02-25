import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface LogoProps {
  size?: number;
  width?: number;
  height?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  style?: StyleProp<ImageStyle>;
}

const Logo: React.FC<LogoProps> = ({ size = 28, width, height, resizeMode = 'contain', style }) => {
  return (
    <Image
      source={require('../../assets/logo copy.png')}
      style={[{
        width: width || size,
        height: height || size,
        borderRadius: 6
      }, style]}
      resizeMode={resizeMode}
    />
  );
};

export default Logo;
