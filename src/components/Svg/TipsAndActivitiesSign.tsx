import React from 'react';
import Svg, {ClipPath, Defs, G, Path, SvgProps} from 'react-native-svg';

const iconColor = '#9DF786';

const TipsAndActivitiesSign: React.FC<SvgProps> = (props) => (
  <Svg width={45} height={45} viewBox="0 0 45 45" {...props}>
    <Defs>
      <ClipPath id="a">
        <Path fill={iconColor} stroke={iconColor} strokeWidth={0.5} d="M0 0H45V45H0z" />
      </ClipPath>
    </Defs>
    <G clipPath="url(#a)">
      <Path
        d="M19.869 39.979a2.308 2.308 0 01-1.542.885L6.5 42.389h-.01a2.29 2.29 0 01-.3.019 2.327 2.327 0 01-2.3-2.027L2.416 28.909a2.332 2.332 0 012.008-2.6l11.845-1.52a2.321 2.321 0 012.6 2.008l1.476 11.47a2.309 2.309 0 01-.476 1.712zm.8-13.419a4.16 4.16 0 00-4.116-3.621 4.245 4.245 0 00-.531.034l-11.84 1.523a4.16 4.16 0 00-3.587 4.646l1.484 11.471a4.158 4.158 0 004.114 3.621 4.253 4.253 0 00.532-.034l11.84-1.523a4.155 4.155 0 003.587-4.646z"
        fill={iconColor}
        stroke={iconColor}
        strokeWidth={0.5}
      />
    </G>
    <G clipPath="url(#a)">
      <Path
        d="M12.877 33.656l-2.754.352.876-2.949c.03-.122.063-.251.1-.38zm-1.389-4.7l-1.207.154a.787.787 0 00-.689.61l-2.724 9.056 1.926-.246.813-2.753 4.213-.539 1.48 2.459 1.937-.248-4.9-8.045a.813.813 0 00-.849-.45z"
        fill={iconColor}
        stroke={iconColor}
        strokeWidth={0.5}
      />
    </G>
    <G clipPath="url(#a)">
      <Path
        d="M38.598 42.34c-.066.031-.131.06-.2.089l-.02.009a8.573 8.573 0 01-3.437.714 8.812 8.812 0 01-7.974-5.039 8.759 8.759 0 014.228-11.628c.066-.031.132-.06.2-.09a8.576 8.576 0 013.457-.722 8.743 8.743 0 013.746 16.668zm5.769-12.346a10.525 10.525 0 00-9.523-6.02 10.226 10.226 0 00-4.366.971 10.462 10.462 0 00-5.049 13.889 10.524 10.524 0 009.523 6.019 10.244 10.244 0 004.131-.863l.02-.009q.108-.048.216-.1a10.461 10.461 0 005.048-13.887z"
        fill={iconColor}
        stroke={iconColor}
        strokeWidth={0.5}
      />
    </G>
    <G clipPath="url(#a)">
      <Path
        d="M35.102 33.459l-1.97.862-.827-1.888 1.736-.759a4.9 4.9 0 011.694-.524c.342 0 .529.152.717.58.287.655.246 1.017-1.35 1.729zm1.691 3.562c-.811.355-1.519.665-2.084.9l-.945-2.161 1.965-.86a4.671 4.671 0 011.643-.472c.43 0 .669.2.914.757.306.707.257 1.07-1.493 1.836zm1.243-4.034a2.559 2.559 0 00-2-3.611 6.856 6.856 0 00-2.622.744c-1.37.6-2.122.939-3.087 1.458l-.309.166 3.646 8.335.334-.118c1.1-.392 1.9-.725 3.6-1.466 2.148-.94 3.308-1.917 2.45-3.877a2.3 2.3 0 00-2.012-1.631z"
        fill={iconColor}
        stroke={iconColor}
        strokeWidth={0.5}
      />
    </G>
    <G clipPath="url(#a)">
      <Path
        d="M23.486 2.76c.348 0 .728.308 1.044.845l8.942 15.226a1.411 1.411 0 01.228 1.327 1.412 1.412 0 01-1.256.485l-17.656.129h-.025a1.393 1.393 0 01-1.24-.469 1.414 1.414 0 01.209-1.328l8.717-15.356c.308-.546.687-.859 1.037-.859zM14.76 22.6h0l17.694-.129a3.129 3.129 0 002.832-1.41 3.128 3.128 0 00-.241-3.154L26.105 2.68a2.832 2.832 0 00-5.248.038L12.14 18.074a2.828 2.828 0 002.62 4.526z"
        fill={iconColor}
        stroke={iconColor}
        strokeWidth={0.5}
      />
    </G>
    <G clipPath="url(#a)">
      <Path
        d="M23.954 18.387a13.87 13.87 0 003.2-.288l.353-.077-.252-1.516-.359.041a24.726 24.726 0 01-2.937.131c-2.073 0-2.673-.676-2.673-3.013s.6-3.013 2.673-3.013c1.173 0 1.762.032 2.719.108l.344.028.273-1.523-.368-.071a13.65 13.65 0 00-2.968-.25c-3.328 0-4.565 1.28-4.565 4.723s1.229 4.72 4.56 4.72z"
        fill={iconColor}
        stroke={iconColor}
        strokeWidth={0.5}
      />
    </G>
  </Svg>
);

export default TipsAndActivitiesSign;
