import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const PurpleArc: React.FC<SvgProps> = (props) => (
  <Svg width="375px" height="18px" viewBox="0 0 375 18" preserveAspectRatio="none" {...props}>
    <Path
      d="M375.001 91.923v2.036H0v-1.861a1088.085 1088.085 0 01185.093-16.101H188a1088.87 1088.87 0 01187 15.926z"
      transform="translate(0 -76)"
      fill="#CEB9EF"
      fillRule="nonzero"
      stroke="none"
      strokeWidth={1}
    />
  </Svg>
);

export default PurpleArc;
