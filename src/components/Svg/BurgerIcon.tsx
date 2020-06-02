import React from 'react';
import Svg, {G, Path, SvgProps} from 'react-native-svg';

const BurgerIcon: React.FC<SvgProps> = (props) => (
  <Svg width={19.739} height={17.5} viewBox="0 0 19.739 17.5" {...props}>
    <G transform="translate(218 -108.5)" fill="none" stroke="#454545" strokeLinecap="round" strokeWidth={3}>
      <Path transform="translate(-216.5 110)" d="M0 0L16.739 0" />
      <Path transform="translate(-216.5 117.25)" d="M0 0L16.739 0" />
      <Path transform="translate(-216.5 124.5)" d="M0 0L16.739 0" />
    </G>
  </Svg>
);

export default BurgerIcon;
