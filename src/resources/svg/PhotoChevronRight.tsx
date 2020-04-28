import React from 'react';
import Svg, {G, Circle, Path, SvgProps} from 'react-native-svg';

const PhotoChevronRight: React.FC<SvgProps> = (props) => {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" {...props}>
      <G data-name="Group 32" transform="translate(-311 -497)">
        <Circle
          data-name="Ellipse 40"
          cx={11}
          cy={11}
          r={11}
          transform="translate(311 497)"
          fill="#fff"
          opacity={0.8}
        />
        <Path
          data-name="Path 50"
          d="M320.033 502.067l5.967 5.966-5.967 5.967"
          fill="none"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
        />
      </G>
    </Svg>
  );
};

export default PhotoChevronRight;
