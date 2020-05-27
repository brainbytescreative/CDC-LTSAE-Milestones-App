import React from 'react';
import Svg, {G, Path, SvgProps} from 'react-native-svg';

const ActEarlySign: React.FC<SvgProps> = (props) => (
  <Svg width={41} height={41} viewBox="0 0 41 41" {...props}>
    <G fill="none" stroke="#f67e41" strokeWidth={3}>
      <Path
        d="M65.769 84.8a19 19 0 10-19-19 19.037 19.037 0 0019 19z"
        strokeMiterlimit={22.926}
        transform="translate(-45.269 -45.297)"
      />
      <Path
        d="M65.769 76.719V77m0-22.406v14.679"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-45.269 -45.297)"
      />
    </G>
  </Svg>
);

export default ActEarlySign;
