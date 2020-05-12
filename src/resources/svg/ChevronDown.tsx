import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const ChevronDown: React.FC<SvgProps & {direction?: 'up' | 'down' | 'left' | 'right'}> = ({
  direction = 'down',
  ...props
}) => {
  let rotate = '0deg';

  switch (direction) {
    case 'up':
      rotate = '180deg';
      break;
    case 'down':
      rotate = '0deg';
      break;
    case 'left':
      rotate = '90deg';
      break;
    case 'right':
      rotate = '270deg';
      break;
  }

  return (
    <Svg
      style={{transform: [{rotate}]}}
      width={21.414}
      height={11.207}
      // transform={}
      viewBox="0 0 21.414 11.207"
      {...props}>
      <Path
        data-name="Path 30"
        d="M20.708.707l-10 10-10-10"
        fill="none"
        stroke="#454545"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
      />
    </Svg>
  );
};

export default ChevronDown;
