import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SkillSection} from '../../resources/milestoneChecklist';
import {useTranslation} from 'react-i18next';
import {colors, images, sharedStyle} from '../../resources/constants';
import {Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import YouTube from 'react-native-youtube';
import ViewPager from '@react-native-community/viewpager';
import {Answer, useGetQuestion, useSetQuestionAnswer} from '../../hooks/checklistHooks';
import NoteIcon from '../../resources/svg/NoteIcon';
import _ from 'lodash';
import {Text} from 'react-native-paper';
import PhotoChevronLeft from '../../resources/svg/PhotoChevronLeft';
import PhotoChevronRight from '../../resources/svg/PhotoChevronRight';

const QuestionItem: React.FC<SkillSection & {childId: number | undefined}> = ({id, value, photos, videos, childId}) => {
  const {data, isFetching} = useGetQuestion({
    childId: childId,
    questionId: id,
  });

  const [answerQuestion] = useSetQuestionAnswer();
  const [note, setNote] = useState('');
  const [page, setPage] = useState(0);
  const viewPagerRef = useRef<ViewPager | null>(null);

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

  const saveNote = useCallback(
    _.debounce((text: string) => {
      id && childId && answerQuestion({questionId: id, answer: data?.answer, childId, note: text});
    }, 500),
    [id, childId, data?.answer],
  );

  useEffect(() => {
    !isFetching && setNote(data?.note || '');
  }, [data, isFetching]);

  return (
    <View style={{flex: 1, marginTop: 38, marginHorizontal: 32}}>
      <View style={{backgroundColor: colors.purple, borderRadius: 10, overflow: 'hidden'}}>
        <Text style={{margin: 15, textAlign: 'center', fontSize: 15}}>{value}</Text>
        {photos && photos.length > 0 && (
          <View>
            <ViewPager
              onPageSelected={(event) => {
                setPage(event.nativeEvent.position);
              }}
              ref={viewPagerRef}
              style={{flex: 1, height}}
              initialPage={0}>
              {photo}
            </ViewPager>
            {photo && photo?.length > 1 && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    const prevPage = page - 1 < 0 ? photo?.length - 1 : page - 1;
                    viewPagerRef?.current?.setPage(prevPage);
                  }}
                  style={{
                    width: 100,
                    height: '100%',
                    position: 'absolute',
                    zIndex: 100,
                    justifyContent: 'center',
                    left: 0,
                  }}>
                  <PhotoChevronLeft style={{marginLeft: 16}} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const nextPage = page + 1 > photos?.length - 1 ? 0 : page + 1;
                    viewPagerRef?.current?.setPage(nextPage);
                  }}
                  style={{
                    width: 100,
                    height: '100%',
                    position: 'absolute',
                    zIndex: 100,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    right: 0,
                  }}>
                  <PhotoChevronRight style={{marginRight: 16}} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        {video}
      </View>
      <View style={[styles.buttonsContainer]}>
        <TouchableOpacity
          onPress={doAnswer(Answer.YES)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.YES ? {backgroundColor: '#BCFDAC'} : undefined,
          ]}>
          <Text numberOfLines={1} style={{textTransform: 'uppercase'}}>
            {t('milestoneChecklist:answer_yes')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doAnswer(Answer.UNSURE)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            {marginHorizontal: 8},
            answer === Answer.UNSURE ? {backgroundColor: '#FC9554'} : undefined,
          ]}>
          <Text numberOfLines={1} style={{textTransform: 'uppercase'}}>
            {t('milestoneChecklist:answer_unsure')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={doAnswer(Answer.NOT_YET)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.NOT_YET ? {backgroundColor: '#EB7373'} : undefined,
          ]}>
          <Text numberOfLines={1} adjustsFontSizeToFit style={{textTransform: 'uppercase'}}>
            {t('milestoneChecklist:answer_not_yet')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.addNoteContainer, sharedStyle.shadow]}>
        <TextInput
          value={note}
          onChange={(e) => {
            setNote(e.nativeEvent.text);
            saveNote(e.nativeEvent.text);
          }}
          multiline
          style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, minHeight: 43, margin: 1}}
          placeholder={t('milestoneChecklist:addANoteLong')}
        />
        <NoteIcon style={{marginLeft: 10}} />
      </View>
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
    paddingHorizontal: 14,
  },
  selected: {
    backgroundColor: 'gray',
  },
  selectedText: {
    color: 'white',
  },
  addNoteContainer: {
    marginTop: 15,
    minHeight: 50,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    flexGrow: 1,
    // width: 0,
    paddingHorizontal: 17,
    paddingVertical: 10,
    maxHeight: 100,
  },
});

export default QuestionItem;
