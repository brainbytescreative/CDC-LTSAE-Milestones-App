import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const ChevronRightBig: React.FC<SvgProps> = (props) => {
  return (
    <Svg width={11.207} height={21.414} viewBox="0 0 11.207 21.414" {...props}>
      <Path
        data-name="Path 80"
        d="M.707.707l10 10-10 10"
        fill="none"
        stroke="#454545"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
      />
    </Svg>
  );
};

export default ChevronRightBig;
