import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const IceColdArc: React.FC<SvgProps> = (props) => (
  <Svg width="375px" height="16px" viewBox="0 0 375 16" preserveAspectRatio="none" {...props}>
    <Path
      d="M375 203.003v14.904c-17.414.659-34.91-.282-51.993-2.547-81.883-9.611-161.267-10.521-238.152-2.73l-6.382.54c-26.599 2.233-53.25 4.295-78.476 5.445v-15.612H375z"
      transform="translate(0 -203)"
      fill="#94F5EB"
      fillRule="nonzero"
      stroke="none"
      strokeWidth={1}
    />
  </Svg>
);

export default IceColdArc;
