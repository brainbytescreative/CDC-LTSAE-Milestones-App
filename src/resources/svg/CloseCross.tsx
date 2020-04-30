import React from 'react';
import Svg, {G, Path, SvgProps} from 'react-native-svg';

const CloseCross: React.FC<SvgProps> = (props) => {
  return (
    <Svg width={11.482} height={11.482} viewBox="0 0 11.482 11.482" {...props}>
      <G
        data-name="Group 71"
        transform="translate(-5755.793 -394.726) translate(5756.5 395.433)"
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeWidth={1}>
        <Path data-name="Line 10" d="M0 10.067L10.067 0" />
        <Path data-name="Line 11" d="M0 0L10.067 10.067" />
      </G>
    </Svg>
  );
};

export default CloseCross;
