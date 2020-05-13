import React, {useState} from 'react';
import {Dimensions, ScrollView, ScrollViewProps} from 'react-native';

const AEScrollView: React.FC<ScrollViewProps> = ({children, contentContainerStyle, ...rest}) => {
  const [scrollEnabled, setScrollEnabled] = useState(rest.scrollEnabled || true);
  return (
    <ScrollView
      bounces={false}
      onContentSizeChange={(w, h) => {
        if (h === Dimensions.get('window').height) {
          setScrollEnabled(false);
        }
      }}
      style={{flex: 1}}
      contentContainerStyle={{flexGrow: 1}}
      {...rest}
      scrollEnabled={scrollEnabled}>
      {children}
    </ScrollView>
  );
};

export default AEScrollView;
