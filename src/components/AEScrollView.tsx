import React, {useState} from 'react';
import {Dimensions, ScrollView, ScrollViewProps} from 'react-native';

const AEScrollView: React.FC<ScrollViewProps> = ({children, ...rest}) => {
  const [scrollEnabled, setScrollEnabled] = useState(rest.scrollEnabled || true);
  return (
    <ScrollView
      onContentSizeChange={(w, h) => {
        if (h === Dimensions.get('window').height) {
          setScrollEnabled(false);
        }
      }}
      {...rest}
      scrollEnabled={scrollEnabled}>
      {children}
    </ScrollView>
  );
};

export default AEScrollView;
