import React from 'react';
import Svg, {ClipPath, Defs, G, Path, SvgProps} from 'react-native-svg';

const BabyPlaceholder: React.FC<{color?: string} & SvgProps> = ({color = '#94f5eb', ...props}) => {
  return (
    <Svg width={152} height={122.906} viewBox="0 0 152 122.906" {...props}>
      <Defs>
        <ClipPath id="prefix__a">
          <Path fill="none" stroke="#94f5eb" strokeWidth={5} d="M0 0h152v122.906H0z" />
        </ClipPath>
      </Defs>
      <G
        clipPath="url(#prefix__a)"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}>
        <Path d="M133.771 51.886a58.319 58.319 0 00-114.868.31 10.845 10.845 0 10.14 19.777 58.327 58.327 0 00114.582.32 10.845 10.845 0 10.146-20.407zM60.777 53.355a8.01 8.01 0 10-16.02 0M106.547 53.355a8.01 8.01 0 10-16.02 0M91.667 72.929a16.02 16.02 0 11-32.04 0" />
        <Path d="M77.458 23.73c8.1-3.65 4.036-11.442-1.147-11.442a8.7 8.7 0 00-8.669 8.722 10.435 10.435 0 0010.4 10.468 12.522 12.522 0 0012.483-12.561A15.026 15.026 0 0075.546 3.844" />
      </G>
    </Svg>
  );
};

export default BabyPlaceholder;
