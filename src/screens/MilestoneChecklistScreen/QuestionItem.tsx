import React from 'react';
import {SkillSection} from '../../resources/milestoneChecklist';
import {useTranslation} from 'react-i18next';
import {images} from '../../resources/constants';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import YouTube from 'react-native-youtube';
import ViewPager from '@react-native-community/viewpager';
import Text from '../../components/Text';
import {Answer, useGetQuestion, useSetQuestionAnswer} from '../../hooks/checklistHooks';

const QuestionItem: React.FC<SkillSection & {childId: number | undefined}> = ({id, value, photos, videos, childId}) => {
  const {data} = useGetQuestion({
    childId: childId,
    questionId: id,
  });

  const [answerQuestion] = useSetQuestionAnswer();

  const answer = data?.answer;

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

  const doAnswer = (answerValue: Answer) => () => {
    id && childId && answerQuestion({questionId: id, childId, answer: answerValue});
  };

  return (
    <View style={{paddingHorizontal: 20, paddingBottom: 20, flex: 1}}>
      {photos && photos.length > 0 && (
        <ViewPager style={{flex: 1, height: 260}} initialPage={0}>
          {photo}
        </ViewPager>
      )}
      {video}
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <TouchableOpacity
          onPress={doAnswer(Answer.YES)}
          style={[styles.answerButton, answer === Answer.YES ? styles.selected : undefined]}>
          <Text style={[answer === Answer.YES ? styles.selectedText : undefined]}>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doAnswer(Answer.UNSURE)}
          style={[
            styles.answerButton,
            {width: 50, borderRadius: 100},
            answer === Answer.UNSURE ? styles.selected : undefined,
          ]}>
          <Text style={[{fontSize: 9}, answer === Answer.UNSURE ? styles.selectedText : undefined]}>UNSURE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doAnswer(Answer.NOT_YET)}
          style={[styles.answerButton, answer === Answer.NOT_YET ? styles.selected : undefined]}>
          <Text style={[answer === Answer.NOT_YET ? styles.selectedText : undefined]}>NOT YET</Text>
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
  selected: {
    backgroundColor: 'gray',
  },
  selectedText: {
    color: 'white',
  },
});

export default QuestionItem;
