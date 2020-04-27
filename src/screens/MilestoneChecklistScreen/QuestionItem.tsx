import React from 'react';
import {SkillSection} from '../../resources/milestoneChecklist';
import {useTranslation} from 'react-i18next';
import {colors, images, sharedStyle} from '../../resources/constants';
import {Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import YouTube from 'react-native-youtube';
import ViewPager from '@react-native-community/viewpager';
import Text from '../../components/Text';
import {Answer, useGetQuestion, useSetQuestionAnswer} from '../../hooks/checklistHooks';
import NoteIcon from '../../resources/svg/NoteIcon';

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
        key={`photo-${index}`}
        accessibilityLabel={item.alt && t(item.alt)}
        source={image}
        style={{width: '100%', borderRadius: 10}}
      />
    );
  });

  const height = (Dimensions.get('window').width - 64) * 0.595;

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
        style={{alignSelf: 'stretch', height}}
      />
    );
  });

  const doAnswer = (answerValue: Answer) => () => {
    id && childId && answerQuestion({questionId: id, childId, answer: answerValue});
  };

  return (
    <View style={{flex: 1, marginTop: 38, marginHorizontal: 32}}>
      <Text>{value}</Text>
      {photos && photos.length > 0 && (
        <ViewPager style={{flex: 1, height}} initialPage={0}>
          {photo}
        </ViewPager>
      )}
      {video}
      <View style={[styles.buttonsContainer]}>
        <TouchableOpacity
          onPress={doAnswer(Answer.YES)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.YES ? {backgroundColor: '#BCFDAC'} : undefined,
          ]}>
          <Text>YES</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doAnswer(Answer.UNSURE)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            {marginHorizontal: 8},
            answer === Answer.UNSURE ? {backgroundColor: '#FC9554'} : undefined,
          ]}>
          <Text>UNSURE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doAnswer(Answer.NOT_YET)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.NOT_YET ? {backgroundColor: '#EB7373'} : undefined,
          ]}>
          <Text>NOT YET</Text>
        </TouchableOpacity>
      </View>

      {/*<View style={[styles.addNoteContainer, sharedStyle.shadow]}>*/}
      {/*  <TextInput*/}
      {/*    // onChange={(e) => {}}*/}
      {/*    multiline*/}
      {/*    style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 15}}*/}
      {/*    placeholder={t('addANote')}*/}
      {/*  />*/}
      {/*  <NoteIcon style={{marginLeft: 10}} />*/}
      {/*</View>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -30,
  },
  answerButton: {
    borderWidth: 0.5,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderColor: colors.gray,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  selected: {
    backgroundColor: 'gray',
  },
  selectedText: {
    color: 'white',
  },
  addNoteContainer: {
    minHeight: 50,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.gray,
    // paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    flexGrow: 1,
    width: 0,
    paddingHorizontal: 17,
    paddingVertical: 10,
    maxHeight: 100,
  },
});

export default QuestionItem;
