import React, {useState} from 'react';
import {Dimensions, ScrollView, ScrollViewProps} from 'react-native';

const AEScrollView: React.FC<ScrollViewProps & {innerRef?: any}> = ({children, innerRef, ...rest}) => {
  const [scrollEnabled, setScrollEnabled] = useState(rest.scrollEnabled || true);

  return (
    <ScrollView
      ref={innerRef}
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
