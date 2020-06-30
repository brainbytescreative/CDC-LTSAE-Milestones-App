import React, {useCallback, useEffect, useRef, useState} from 'react';
import {SkillSection} from '../../resources/milestoneChecklist';
import {useTranslation} from 'react-i18next';
import {colors, images, sharedStyle} from '../../resources/constants';
import {ActivityIndicator, Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import {useGetMilestone, useGetQuestion, useSetQuestionAnswer} from '../../hooks/checklistHooks';
import NoteIcon from '../../components/Svg/NoteIcon';
import _ from 'lodash';
import {Text} from 'react-native-paper';
import PhotoChevronLeft from '../../components/Svg/PhotoChevronLeft';
import PhotoChevronRight from '../../components/Svg/PhotoChevronRight';
import {WebView} from 'react-native-webview';
import i18next from 'i18next';
import {Answer} from '../../hooks/types';
import withSuspense from '../../components/withSuspense';

const QuestionItem: React.FC<SkillSection & {childId: number | undefined}> = ({id, value, photos, videos, childId}) => {
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data, isFetching} = useGetQuestion({
    childId: childId || 0,
    questionId: id || 0,
    milestoneId: milestoneId || 0,
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
        key={`photo-${index}-${id}`}
        accessibilityLabel={item.alt && t(item.alt)}
        source={image}
        style={{width: '100%', borderRadius: 10}}
      />
    );
  }) as any;

  const height = (Dimensions.get('window').width - 64) * 0.595;

  const video = videos?.map((item) => {
    const code = item.name && t(item?.name);
    return (
      <WebView
        key={`video-${item.name}`}
        style={{alignSelf: 'stretch', height}}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState
        scrollEnabled={false}
        source={{uri: `https://www.youtube.com/embed/${code}?controls=0&hl=${i18next.language}&rel=0`}}
      />
    );
  });

  const doAnswer = (answerValue: Answer) => () => {
    id &&
      childId &&
      milestoneId &&
      answerQuestion({questionId: id, childId, answer: answerValue, note: note, milestoneId});
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveNote = useCallback(
    _.debounce((text: string) => {
      id &&
        childId &&
        milestoneId &&
        answerQuestion({questionId: id, answer: data?.answer, childId, note: text, milestoneId});
    }, 500),
    [id, childId, milestoneId, data?.answer],
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
              {__DEV__
                ? photo.map((item: any, index: number) => {
                    return (
                      <View key={index}>
                        <Text>{photos[index].name}</Text>
                        {item}
                      </View>
                    );
                  })
                : photo}
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
            answer === Answer.YES ? {backgroundColor: colors.lightGreen} : undefined,
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
            answer === Answer.UNSURE ? {backgroundColor: colors.yellow} : undefined,
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
            answer === Answer.NOT_YET ? {backgroundColor: colors.tanHide} : undefined,
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

export default withSuspense(
  QuestionItem,
  {
    suspense: true,
  },
  <View
    style={{
      borderRadius: 10,
      backgroundColor: colors.purple,
      justifyContent: 'center',
      height: 300,
      flex: 1,
      marginHorizontal: 32,
      marginTop: 32,
    }}>
    <ActivityIndicator color={colors.white} size={'small'} />
  </View>,
);
