import React from 'react';
import Svg, {Circle, Path, SvgProps} from 'react-native-svg';

const PhotoChevronLeft: React.FC<SvgProps> = (props) => {
  return (
    <Svg data-name="Group 33" width={22} height={22} viewBox="0 0 22 22" {...props}>
      <Circle data-name="Ellipse 40" cx={11} cy={11} r={11} fill="#fff" opacity={0.8} />
      <Path
        data-name="Path 50"
        d="M12.967 5.067L7 11.034l5.967 5.967"
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
      />
    </Svg>
  );
};

export default PhotoChevronLeft;
