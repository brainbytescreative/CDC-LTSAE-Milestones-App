import ViewPager from '@react-native-community/viewpager';
import i18next from 'i18next';
import _ from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';
import {WebView} from 'react-native-webview';

import NoteIcon from '../../components/Svg/NoteIcon';
import PhotoChevronLeft from '../../components/Svg/PhotoChevronLeft';
import PhotoChevronRight from '../../components/Svg/PhotoChevronRight';
import withSuspense from '../../components/withSuspense';
import {useGetMilestone, useGetQuestionAnswer, useSetQuestionAnswer} from '../../hooks/checklistHooks';
import {Answer} from '../../hooks/types';
import {colors, images, sharedStyle, verticalImages} from '../../resources/constants';
import {SkillSection} from '../../resources/milestoneChecklist';
import {trackChecklistAnswer, trackInteractionByType} from '../../utils/analytics';

function getVideoHtml(videId: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head >
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">

    <style>
        body { margin: 0; width:100%; height:100%;  background-color:#000000; }
        html { width:100%; height:100%; background-color:#000000; }
    
        .video-placeholder iframe,
        .video-placeholder object,
        .video-placeholder embed {
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100% !important;
        }
        </style><title>Video</title>

</head>
<body style="margin:0;padding:0;overflow:hidden; height: 100%">
<div id="video-placeholder"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>

var player,
    time_update_interval = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('video-placeholder', {
        width: window.innerWidth,
        height: window.innerHeight,
        videoId: '${videId}',
        playerVars: {
            color: 'white',
            rel: 0,
            controls: 0,
            playsinline: 1,
            hl:'${i18next.language}'
        },
        events: {
            onReady: initialize,
            onStateChange: onStateChange
        }
    });
}

function onStateChange(event){
    if (event.data === 0) {
        player.seekTo(0);
        player.stopVideo();
    }
    if (event.data === 1){
     window.ReactNativeWebView.postMessage("PLAYING"); 
    }
}
window.onresize = function() {
        player.setSize(window.innerWidth, window.innerHeight);
}
function initialize(){
    
}
</script>
</body>
</html>
`;
}

const QuestionItem: React.FC<SkillSection & {childId: number | undefined}> = ({id, value, photos, videos, childId}) => {
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data, isFetching} = useGetQuestionAnswer({
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
  const hasVerticalImage = Boolean(photos.filter(({name}) => verticalImages.includes(name)).length);
  const ratio = hasVerticalImage ? 1.68 : 0.595;
  const height = (Dimensions.get('window').width - 64) * ratio;

  const video =
    videos?.map((item) => {
      const code = item.name && t(item?.name);
      if (!code) {
        return null;
      }

      return (
        <View>
          <WebView
            onMessage={(event) => {
              event.nativeEvent.data === 'PLAYING' && trackInteractionByType('Play Video');
            }}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            key={`video-${code}`}
            style={{width: '100%', height}}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState
            scrollEnabled={false}
            source={{html: getVideoHtml(code)}}
          />
        </View>
      );
    }) || [];

  const photo =
    (photos?.map((item, index) => {
      const name = (item.name && t(item.name)) || '';
      const image = images[name];
      return (
        <Image
          // resizeMode={'contain'}
          key={`photo-${index}-${id}`}
          accessibilityLabel={item.alt && t(`milestones:alts:${item.alt}`)}
          accessibilityRole={'image'}
          accessible={true}
          source={image}
          style={{width: '100%', borderRadius: 10}}
        />
      );
    }) as any) || [];

  const doAnswer = (answerValue: Answer) => () => {
    id &&
      childId &&
      milestoneId &&
      answerQuestion({questionId: id, childId, answer: answerValue, note: note, milestoneId});
    if (answerValue !== answer) {
      trackChecklistAnswer(answerValue, {questionData: {milestoneId: Number(milestoneId), questionId: id}});
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveNote = useCallback(
    _.debounce((text: string) => {
      id &&
        childId &&
        milestoneId &&
        answerQuestion({questionId: id, answer: data?.answer, childId, note: text, milestoneId});
      trackInteractionByType('Add Milestone Note');
    }, 500),
    [id, childId, milestoneId, data?.answer],
  );

  useEffect(() => {
    !isFetching && setNote(data?.note || '');
  }, [data, isFetching]);

  const mediaItems = [...photo, ...video];

  // noinspection ConstantConditionalExpressionJS
  return (
    <View style={{flex: 1, marginTop: 38, marginHorizontal: 32}}>
      <View style={{backgroundColor: colors.purple, borderRadius: 10, overflow: 'hidden'}}>
        <Text style={{margin: 15, textAlign: 'center', fontSize: 15}}>{value}</Text>
        {mediaItems && mediaItems.length > 0 && (
          <View>
            <ViewPager
              onPageSelected={(event) => {
                setPage(event.nativeEvent.position);
              }}
              scrollEnabled={mediaItems.length > 1}
              ref={viewPagerRef}
              style={{flex: 1, height}}
              initialPage={0}>
              {/*{__DEV__*/}
              {/*  ? photo.map((item: any, index: number) => {*/}
              {/*      return (*/}
              {/*        <View key={index}>*/}
              {/*          <Text accessible={false}>{`${photos?.[index].alt}\n${t(*/}
              {/*            `milestones:alts:${photos?.[index].alt}`,*/}
              {/*          )}`}</Text>*/}
              {/*          {item}*/}
              {/*        </View>*/}
              {/*      );*/}
              {/*    })*/}
              {/*  : photo}*/}
              {/*{photo}*/}
              {/*{video}*/}
              {mediaItems}
            </ViewPager>
            {mediaItems && mediaItems?.length > 1 && (
              <>
                <TouchableOpacity
                  accessibilityLabel={t('accessibility:previousButton')}
                  onPress={() => {
                    trackInteractionByType('Scroll Photo');
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
                  accessibilityLabel={t('accessibility:nextButton')}
                  onPress={() => {
                    trackInteractionByType('Scroll Photo');
                    const nextPage = page + 1 > mediaItems?.length - 1 ? 0 : page + 1;
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
      </View>
      <View style={[styles.buttonsContainer]}>
        <TouchableOpacity
          accessibilityState={{
            selected: answer === Answer.YES,
          }}
          accessibilityRole={'button'}
          onPress={doAnswer(Answer.YES)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.YES ? {backgroundColor: colors.lightGreen} : undefined,
          ]}>
          <Text numberOfLines={1}>{t('milestoneChecklist:answer_yes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityState={{
            selected: answer === Answer.UNSURE,
          }}
          accessibilityRole={'button'}
          onPress={doAnswer(Answer.UNSURE)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            {marginHorizontal: 8},
            answer === Answer.UNSURE ? {backgroundColor: colors.yellow} : undefined,
          ]}>
          {i18next.language === 'es' ? (
            <Text style={{width: 70, textAlign: 'center'}} numberOfLines={2}>
              {t('milestoneChecklist:answer_unsure')}
            </Text>
          ) : (
            <Text numberOfLines={1}>{t('milestoneChecklist:answer_unsure')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityState={{
            selected: answer === Answer.NOT_YET,
          }}
          accessibilityRole={'button'}
          onPress={doAnswer(Answer.NOT_YET)}
          style={[
            styles.answerButton,
            sharedStyle.shadow,
            answer === Answer.NOT_YET ? {backgroundColor: colors.tanHide} : undefined,
          ]}>
          <Text numberOfLines={1} adjustsFontSizeToFit>
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
          style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 14, minHeight: 43, margin: 1}}
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
    shared: {
      suspense: true,
    },
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
