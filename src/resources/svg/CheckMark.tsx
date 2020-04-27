import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const CheckMark: React.FC<SvgProps> = (props) => {
  return (
    <Svg width={28.654} height={23.979} viewBox="0 0 28.654 23.979" {...props}>
      <Path
        data-name="Path 76"
        d="M2.818 13.638l6.981 8.341L25.837 2.818"
        fill="none"
        stroke="#454545"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
    </Svg>
  );
};

export default CheckMark;
