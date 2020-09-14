import {useNavigation} from '@react-navigation/native';
import _ from 'lodash';
import React, {useEffect, useRef, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import {Text} from 'react-native-paper';

import AEYellowBox from '../../components/AEYellowBox';
import CheckMark from '../../components/Svg/CheckMark';
import ChevronRightBig from '../../components/Svg/ChevronRightBig';
import NoteIcon from '../../components/Svg/NoteIcon';
import PurpleArc from '../../components/Svg/PurpleArc';
import {
  useGetConcern,
  useGetConcerns,
  useGetIsMissingMilestone,
  useGetMilestone,
  useSetConcern,
} from '../../hooks/checklistHooks';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {colors, missingConcerns, sharedStyle} from '../../resources/constants';
import {Concern} from '../../resources/milestoneChecklist';
import {trackInteractionByType} from '../../utils/analytics';
import {DashboardStackNavigationProp} from '../Dashboard/DashboardScreen';

const Item: React.FC<Concern & {childId?: number}> = React.memo(({id, value, childId}) => {
  const [setConcern] = useSetConcern();
  const {t} = useTranslation('milestoneChecklist');
  const [note, setNote] = useState('');
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data: concern, isFetching} = useGetConcern({concernId: id, childId, milestoneId});

  const isMissingAnswerConcern = missingConcerns.includes(id || 0);
  const onPress = isMissingAnswerConcern
    ? undefined
    : () => {
        if (id && childId && milestoneId) {
          setConcern({concernId: id, answer: !concern?.answer, childId: childId, note: concern?.note, milestoneId});
        }
        !concern?.answer &&
          trackInteractionByType('Checked Act Early Item', {
            page: 'When to Act Early',
            concernData: {concernId: Number(id), milestoneId: Number(milestoneId)},
          });

        // if (id && childId && milestoneId && !concern?.answer) {
        //   setConcern({concernId: id, answer: true, childId: childId, note: concern?.note, milestoneId});
        // }
        //
        // if (concern?.answer) {
        //   Alert.alert(
        //     '',
        //     t('alert:concernUncheck'),
        //     [
        //       {
        //         text: t('dialog:no'),
        //         style: 'cancel',
        //       },
        //       {
        //         text: t('dialog:yes'),
        //         style: 'default',
        //         onPress: () => {
        //           if (id && childId && milestoneId) {
        //             setConcern({concernId: id, answer: false, childId: childId, note: null, milestoneId});
        //           }
        //         },
        //       },
        //     ],
        //     {cancelable: false},
        //   );
        // } else {
        //   trackInteractionByType('Checked Act Early Item', {page: 'When to Act Early'});
        // }
      };

  const saveNote = useRef(
    _.debounce((text: string) => {
      id && childId && milestoneId && setConcern({concernId: id, childId, note: text, milestoneId});
      trackInteractionByType('Add Act Early Note', {page: 'When to Act Early'});
    }, 500),
  );

  useEffect(() => {
    !isFetching && setNote(concern?.note || '');
  }, [concern, isFetching]);

  return (
    <View>
      <View style={[itemStyles.container, sharedStyle.shadow]}>
        <View
          style={{
            paddingHorizontal: 16,
          }}>
          <Text style={{textAlign: 'center'}}>{value}</Text>
        </View>
      </View>
      <View style={[itemStyles.buttonsContainer]}>
        <TouchableOpacity
          accessible={!isMissingAnswerConcern}
          accessibilityRole={'button'}
          accessibilityLabel={t('accessibility:concernToggleButton')}
          disabled={isMissingAnswerConcern}
          onPress={onPress}
          style={[
            itemStyles.checkMarkContainer,
            sharedStyle.shadow,
            concern?.answer && {backgroundColor: colors.yellow},
          ]}>
          <CheckMark />
        </TouchableOpacity>

        <View style={[itemStyles.addNoteContainer, sharedStyle.shadow]}>
          <TextInput
            value={note}
            onChange={(e) => {
              setNote(e.nativeEvent.text);
              saveNote.current(e.nativeEvent.text);
            }}
            multiline
            style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, padding: 0}}
            placeholder={t('addANote')}
          />
          {Dimensions.get('window').width > 320 && <NoteIcon style={{marginLeft: 10}} />}
        </View>
      </View>
    </View>
  );
});

const itemStyles = StyleSheet.create({
  container: {
    marginHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: colors.purple,
    borderRadius: 10,
  },
  buttonsContainer: {
    marginHorizontal: 32,
    paddingHorizontal: 18,
    marginTop: -20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 35,
  },
  checkMarkContainer: {
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    // marginLeft: 30,
    marginRight: 23,
    width: 58,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteContainer: {
    minHeight: 50,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.gray,
    // paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    flexGrow: 1,
    width: 0,
    paddingHorizontal: 17,
    paddingVertical: 10,
    maxHeight: 100,
  },
});

const ActEarlyPage: React.FC<{onChildSummaryPress?: () => void}> = ({onChildSummaryPress}) => {
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data: {concerns} = {}} = useGetConcerns();
  const navigation = useNavigation<DashboardStackNavigationProp>();
  const {data: {isMissingConcern = false, isNotYet = false} = {}} = useGetIsMissingMilestone({childId, milestoneId});

  useEffect(() => {
    trackInteractionByType('Started When to Act Early', {page: 'When to Act Early'});
    return () => {
      trackInteractionByType('Completed When to Act Early', {page: 'When to Act Early'});
    };
  }, []);

  const {t} = useTranslation('milestoneChecklist');
  return (
    <KeyboardAwareFlatList
      enableOnAndroid={Platform.OS === 'android'}
      extraHeight={Platform.select({
        ios: 200,
      })}
      scrollIndicatorInsets={{right: 0.1}}
      bounces={false}
      ListHeaderComponent={
        <View style={{marginBottom: 50}}>
          {/*<Text style={[{textAlign: 'center', fontWeight: 'normal', fontSize: 15, marginTop: 16}]}>*/}
          {/*  {totalProgressValue === 1 ? t('complete') : t('incomplete')}*/}
          {/*</Text>*/}
          <Text style={[styles.header, {marginTop: 16}]}>{t('whenToActEarly')}</Text>
          <Text style={[{textAlign: 'center', marginTop: 10, marginHorizontal: 48}]}>
            <Trans t={t} i18nKey={'quickViewMessageActEarly'}>
              <Text
                accessibilityRole={'link'}
                onPress={() => {
                  Linking.openURL(t('actEarlyMessageLink'));
                }}
                style={[{textDecorationLine: 'underline', textAlign: 'center'}, sharedStyle.boldText]}
              />
              <Text style={[sharedStyle.boldText, {textAlign: 'center'}]} />
            </Trans>
          </Text>
          {(isMissingConcern || isNotYet) && (
            <AEYellowBox containerStyle={{marginBottom: 0}}>{t('actEarlyWarning')}</AEYellowBox>
          )}
        </View>
      }
      data={concerns || []}
      renderItem={({item}) => <Item {...item} childId={childId} />}
      keyExtractor={(item) => `concern-${item.id}`}
      ListFooterComponent={() => (
        <View>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple}}>
            <TouchableWithoutFeedback
              accessibilityRole={'button'}
              onPress={() => {
                onChildSummaryPress ? onChildSummaryPress() : navigation.navigate('ChildSummary');
                trackInteractionByType('My Child Summary');
              }}>
              <View
                style={[
                  {
                    backgroundColor: colors.white,
                    margin: 32,
                    borderRadius: 10,
                    flexDirection: 'row',
                    padding: 16,
                    height: 60,
                    alignItems: 'center',
                  },
                  sharedStyle.shadow,
                ]}>
                <Text style={{flexGrow: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold', fontSize: 18}}>
                  {t('myChildSummary')}
                </Text>
                <ChevronRightBig width={10} height={20} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 5,
    fontFamily: 'Montserrat-Bold',
  },
});

export default ActEarlyPage;
