import React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const NoteIcon: React.FC<SvgProps> = (props) => {
  return (
    <Svg width={26} height={26} {...props}>
      <Path
        data-name="Path 65"
        d="M26.458 7.045l-3.5-3.5a1.861 1.861 0 00-2.626 0L1.544 22.328A1.848 1.848 0 001 23.642v4.12A1.239 1.239 0 002.238 29h4.12a1.848 1.848 0 001.314-.544L26.458 9.671a1.861 1.861 0 000-2.626zM6.8 27.581a.629.629 0 01-.438.181H2.238v-4.12a.631.631 0 01.181-.438l16.6-16.6 4.377 4.377zM25.581 8.8l-1.314 1.314-4.376-4.382L21.2 4.419a.619.619 0 01.875 0l3.5 3.5a.617.617 0 01.006.881zm-1.057 19.581A.619.619 0 0123.9 29H11.524a.619.619 0 010-1.238H23.9a.619.619 0 01.624.619z"
        fill="#737373"
        transform="translate(-1 -3)"
      />
    </Svg>
  );
};

export default NoteIcon;
