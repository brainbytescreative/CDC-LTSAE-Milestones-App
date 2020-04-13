import React from 'react';
import {SkillSection} from '../../resources/milestoneChecklist';
import {useTranslation} from 'react-i18next';
import {images} from '../../resources/constants';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import YouTube from 'react-native-youtube';
import ViewPager from '@react-native-community/viewpager';
import Text from '../../components/Text';

const QuestionItem: React.FC<SkillSection> = ({id, value, photos, videos}) => {
  const {t} = useTranslation('milestones');
  const photo = photos?.map((item, index) => {
    const name = (item.name && t(item.name)) || '';
    const image = images[name];
    return (
      <Image
        // resizeMethod={'scale'}
        resizeMode={'contain'}
        key={`photo-${index}`}
        accessibilityLabel={item.alt && t(item.alt)}
        source={image}
        style={{width: '100%'}}
      />
    );
  });

  const video = videos?.map((item, index) => {
    const code = item.name && t(item?.name);
    return (
      <YouTube
        key={`video-${index}`}
        videoId={code} // The YouTube video ID
        play={false} // control playback of video with true/false
        fullscreen={false} // control whether the video should play in fullscreen or inline
        loop={false} // control whether the video should loop when ended
        // onReady={(e) => this.setState({isReady: true})}
        // onChangeState={(e) => this.setState({status: e.state})}
        // onChangeQuality={(e) => this.setState({quality: e.quality})}
        // onError={(e) => this.setState({error: e.error})}
        style={{alignSelf: 'stretch', height: 260}}
      />
    );
  });

  return (
    <View style={{paddingHorizontal: 20, paddingBottom: 20, flex: 1}}>
      {photos && photos.length > 0 && (
        <ViewPager style={{flex: 1, height: 260}} initialPage={0}>
          {photo}
        </ViewPager>
      )}
      {video}
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <TouchableOpacity style={styles.answerButton}>
          <Text>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.answerButton, {width: 50, borderRadius: 100}]}>
          <Text style={{fontSize: 9}}>UNSURE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.answerButton}>
          <Text>NOT YET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  answerButton: {
    borderWidth: 1,
    height: 50,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestionItem;
