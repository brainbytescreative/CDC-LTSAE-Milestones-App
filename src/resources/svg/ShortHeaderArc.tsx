import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const ShortHeaderArc: React.FC<SvgProps> = (props) => {
  return (
    <Svg width="375px" preserveAspectRatio={'none'} height="13px" viewBox="0 0 375 13" {...props}>
      <Path
        d="M375 140.062v11.845c-17.414.659-34.91-.282-51.993-2.547-81.883-9.611-161.267-10.521-238.152-2.73l-6.382.54c-26.599 2.233-53.25 4.295-78.476 5.445v-12.553H375z"
        transform="translate(0 -140)"
        fill="#94F5EB"
        fillRule="nonzero"
        stroke="none"
        strokeWidth={1}
      />
    </Svg>
  );
};

export default ShortHeaderArc;
