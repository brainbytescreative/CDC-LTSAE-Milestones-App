import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const ChevronRight: React.FC<SvgProps> = (props) => (
  <Svg width={6.207} height={11.414} viewBox="0 0 6.207 11.414" {...props}>
    <Path d="M.707.707l5 5-5 5" fill="none" stroke="#454545" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default ChevronRight;
