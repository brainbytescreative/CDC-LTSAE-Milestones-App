import {useActionSheet} from '@expo/react-native-action-sheet';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import _ from 'lodash';
import React, {useCallback, useMemo, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {ActivityIndicator, Alert, Linking, Platform, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {queryCache} from 'react-query';

import AEButtonMultiline from '../components/AEButtonMultiline';
import AEButtonRounded from '../components/AEButtonRounded';
import ChildPhoto from '../components/ChildPhoto';
import ChildSelectorModal from '../components/ChildSelectorModal';
import LanguageSelector from '../components/LanguageSelector';
import {ChildSummaryParamList, DashboardDrawerParamsList} from '../components/Navigator/types';
import NoteIcon from '../components/Svg/NoteIcon';
import PurpleArc from '../components/Svg/PurpleArc';
import ShortHeaderArc from '../components/Svg/ShortHeaderArc';
import withSuspense from '../components/withSuspense';
import {
  useGetChecklistQuestions,
  useGetComposeSummaryMail,
  useGetConcerns,
  useGetMilestone,
  useSetConcern,
  useSetQuestionAnswer,
} from '../hooks/checklistHooks';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import {Answer, MilestoneAnswer} from '../hooks/types';
import {PropType, colors, missingConcerns, sharedStyle, suspenseEnabled} from '../resources/constants';
import {
  trackEventByType,
  trackInteractionByType,
  trackSelectByType,
  trackSelectLanguage,
  trackSelectSummary,
} from '../utils/analytics';
import {formattedAge} from '../utils/helpers';

type IdType = PropType<MilestoneAnswer, 'questionId'>;
type NoteType = PropType<MilestoneAnswer, 'note'>;

interface ItemProps {
  value?: string;
  id?: IdType;
  note?: NoteType;
  onEditAnswerPress?: (id: IdType, note: NoteType) => void;
  onEditNotePress?: (id: IdType, note: NoteType, answer: any) => void;
  hideControls?: boolean;
  answer: any;
  key: string;
}

const Item: React.FC<ItemProps> = ({
  value,
  id,
  note,
  onEditAnswerPress,
  hideControls = false,
  onEditNotePress,
  answer,
}) => {
  const {t} = useTranslation('childSummary');
  const [noteLocal, setNote] = useState<string | undefined>(undefined);

  const onSavePress = () => {
    id && onEditNotePress && onEditNotePress(id, noteLocal, answer);
    setNote(undefined);
  };
  return (
    <View style={{marginTop: 32, marginHorizontal: 16}}>
      <Text style={{fontSize: 15}}>{value}</Text>
      {!!note && noteLocal === undefined && (
        <Text style={{fontSize: 15}}>
          <Text style={[sharedStyle.boldText]}>
            {t('note')}
            {': '}
          </Text>
          {note}
        </Text>
      )}

      {noteLocal !== undefined && (
        <View style={[itemStyles.addNoteContainer, sharedStyle.shadow]}>
          <TextInput
            value={noteLocal}
            onChange={(e) => {
              setNote(e.nativeEvent.text);
              // saveNote(e.nativeEvent.text);
            }}
            // returnKeyType={'done'}
            // onSubmitEditing={onSavePress}
            multiline
            style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 15}}
            placeholder={t('editNote')}
          />
          <NoteIcon style={{marginLeft: 10}} />
        </View>
      )}

      <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6}}>
        {!hideControls && (
          <TouchableOpacity
            accessibilityRole={'button'}
            onPress={() => {
              trackSelectByType('Edit Answer');
              id && onEditAnswerPress?.(id, note);
            }}>
            <Text style={{textDecorationLine: 'underline', fontSize: 12}}>{t('editAnswer')}</Text>
          </TouchableOpacity>
        )}
        {noteLocal === undefined && (
          <TouchableOpacity
            accessibilityRole={'button'}
            onPress={() => {
              trackSelectByType('Edit Note');
              setNote(note || '');
            }}>
            <Text
              style={{
                textDecorationLine: 'underline',
                fontSize: 12,
                marginLeft: 15,
              }}>
              {t('editNote')}
            </Text>
          </TouchableOpacity>
        )}
        {noteLocal !== undefined && (
          <TouchableOpacity onPress={onSavePress}>
            <Text
              style={{
                textDecorationLine: 'underline',
                fontSize: 12,
                marginLeft: 15,
              }}>
              {t('saveNote')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const itemStyles = StyleSheet.create({
  addNoteContainer: {
    minHeight: 50,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    flexGrow: 1,
    paddingHorizontal: 17,
    paddingVertical: 10,
    maxHeight: 100,
    marginVertical: 20,
  },
});

export type ChildSummaryStackNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DashboardDrawerParamsList, 'ChildSummaryStack'>,
  StackNavigationProp<ChildSummaryParamList>
>;

const SummaryItems = withSuspense(
  () => {
    const {t} = useTranslation('childSummary');
    const {data: child} = useGetCurrentChild();
    const {data: {milestoneAge} = {}} = useGetMilestone();
    const {data, refetch} = useGetChecklistQuestions();
    const {data: concerns, refetch: refetchConcerns} = useGetConcerns();
    const [answerQuestion] = useSetQuestionAnswer();
    const [setConcern] = useSetConcern();

    const {showActionSheetWithOptions} = useActionSheet();

    const onEditQuestionPress = useCallback<NonNullable<ItemProps['onEditAnswerPress']>>(
      (id, note) => {
        const options = [
          t('milestoneChecklist:answer_yes'),
          t('milestoneChecklist:answer_unsure'),
          t('milestoneChecklist:answer_not_yet'),
          t('common:cancel'),
        ].map((val) => _.upperFirst(val));

        showActionSheetWithOptions(
          {
            message: t('changeYourAnswerTitle'),
            cancelButtonIndex: options.length - 1,
            options,
            textStyle: {...sharedStyle.regularText},
            titleTextStyle: {...sharedStyle.regularText},
            messageTextStyle: {...sharedStyle.regularText},
          },
          (index) => {
            if (Object.values(Answer).includes(index) && child?.id && milestoneAge) {
              answerQuestion({answer: index, childId: child?.id, note, questionId: id, milestoneId: milestoneAge}).then(
                () => {
                  refetch();
                },
              );
              trackSelectSummary(index);
            }
          },
        );
      },
      [t, showActionSheetWithOptions, child?.id, milestoneAge, answerQuestion, refetch],
    );

    const onEditConcernPress = useCallback<NonNullable<ItemProps['onEditAnswerPress']>>(
      (id, note) => {
        const options = [
          t('common:delete'),
          // t('milestoneChecklist:answer_no'),

          t('common:cancel'),
        ].map((val) => _.upperFirst(val));

        showActionSheetWithOptions(
          {
            message: t('alert:concernUncheck'),
            cancelButtonIndex: options.length - 1,
            destructiveButtonIndex: 0,
            options,
            textStyle: {...sharedStyle.regularText},
            titleTextStyle: {...sharedStyle.regularText},
            messageTextStyle: {...sharedStyle.regularText},
          },
          (index) => {
            if (index === 0 && child?.id && milestoneAge) {
              setConcern({
                concernId: id,
                answer: false,
                childId: child?.id,
                note: note,
                milestoneId: milestoneAge,
              }).then(() => {
                return refetchConcerns();
              });
            }
          },
        );
        // Alert.alert(
        //   '',
        //   t('alert:concernUncheck'),
        //   [
        //     {
        //       text: t('dialog:no'),
        //       style: 'cancel',
        //     },
        //     {
        //       text: t('common:delete'),
        //       style: 'default',
        //       onPress: () => {
        //         if (child?.id && milestoneAge) {
        //           setConcern({
        //             concernId: id,
        //             answer: false,
        //             childId: child?.id,
        //             note: note,
        //             milestoneId: milestoneAge,
        //           }).then(() => {
        //             return refetchConcerns();
        //           });
        //         }
        //       },
        //     },
        //   ],
        //   {cancelable: false},
        // );
      },
      [t, showActionSheetWithOptions, child?.id, milestoneAge, setConcern, refetchConcerns],
    );

    const onSaveQuestionNotePress = useCallback<NonNullable<ItemProps['onEditNotePress']>>(
      (id, note, answer) => {
        child?.id &&
          milestoneAge &&
          answerQuestion({questionId: id, childId: child?.id, note, answer, milestoneId: milestoneAge}).then(() => {
            return refetch();
          });
      },
      [child?.id, milestoneAge, answerQuestion, refetch],
    );

    const onSaveConcernNotePress = useCallback<NonNullable<ItemProps['onEditNotePress']>>(
      (id, note, answer) => {
        child?.id &&
          milestoneAge &&
          setConcern({
            concernId: id,
            answer,
            childId: child?.id,
            note,
            milestoneId: milestoneAge,
          }).then(() => {
            return refetchConcerns();
          });
      },
      [child?.id, milestoneAge, setConcern, refetchConcerns],
    );

    const unanswered = data?.groupedByAnswer['undefined'] || [];
    const unsure = data?.groupedByAnswer[Answer.UNSURE] || [];
    const yes = data?.groupedByAnswer[Answer.YES] || [];
    const notYet = data?.groupedByAnswer[Answer.NOT_YET] || [];

    return (
      <View style={{marginHorizontal: 32}}>
        <View style={[styles.blockContainer, {backgroundColor: colors.iceCold}]}>
          <Text style={styles.blockText}>{t('unanswered')}</Text>
        </View>
        {unanswered.map((item) => (
          <Item
            answer={null}
            key={`answer-${item.id}`}
            onEditAnswerPress={onEditQuestionPress}
            onEditNotePress={onSaveQuestionNotePress}
            value={item.value}
            id={item.id}
            note={item.note}
          />
        ))}
        <View style={[styles.blockContainer, {backgroundColor: colors.azalea}]}>
          <Text style={styles.blockText}>{t('concerns')}</Text>
        </View>
        {concerns?.concerned?.map((item) => (
          <Item
            answer={true}
            key={`concern-${item.id}`}
            onEditAnswerPress={onEditConcernPress}
            onEditNotePress={onSaveConcernNotePress}
            hideControls={!!item.id && missingConcerns.includes(item.id)}
            value={item.value}
            note={item.note}
            id={item.id}
          />
        ))}
        <View style={[styles.blockContainer, {backgroundColor: colors.yellow}]}>
          <Text style={styles.blockText}>{t('notSure')}</Text>
        </View>
        {unsure.map((item) => (
          <Item
            answer={Answer.UNSURE}
            key={`answer-${item.id}`}
            onEditAnswerPress={onEditQuestionPress}
            onEditNotePress={onSaveQuestionNotePress}
            value={item.value}
            note={item.note}
            id={item.id}
          />
        ))}
        <View style={[styles.blockContainer, {backgroundColor: colors.tanHide}]}>
          <Text style={styles.blockText}>{t('notYet')}</Text>
        </View>
        {notYet.map((item) => (
          <Item
            answer={Answer.NOT_YET}
            key={`answer-${item.id}`}
            onEditAnswerPress={onEditQuestionPress}
            onEditNotePress={onSaveQuestionNotePress}
            value={item.value}
            note={item.note}
            id={item.id}
          />
        ))}
        <View style={[styles.blockContainer, {backgroundColor: colors.lightGreen}]}>
          <Text style={styles.blockText}>{t('yes')}</Text>
        </View>
        {yes.map((item) => (
          <Item
            key={`answer-${item.id}`}
            answer={Answer.YES}
            onEditAnswerPress={onEditQuestionPress}
            onEditNotePress={onSaveQuestionNotePress}
            value={item.value}
            note={item.note}
            id={item.id}
          />
        ))}
      </View>
    );
  },
  suspenseEnabled,
  <ActivityIndicator style={{marginTop: 32}} size={'large'} />,
);

const DisabledSummary = () => {
  const {t} = useTranslation('childSummary');
  return (
    <AEButtonRounded disabled style={{marginBottom: 0}}>
      {t('emailSummary')}
    </AEButtonRounded>
  );
};

const ComposeEmailButton = withSuspense(
  () => {
    const {compose: composeMail} = useGetComposeSummaryMail();
    const {t} = useTranslation('childSummary');
    return (
      <AEButtonMultiline
        onPress={() => {
          trackInteractionByType('Email Summary');
          composeMail().catch((e) => {
            Alert.alert('', e.message);
          });
        }}
        style={{marginBottom: 0}}>
        {t('emailSummary')}
      </AEButtonMultiline>
    );
  },
  suspenseEnabled,
  <DisabledSummary />,
);

const ChildSummaryScreen: React.FC = () => {
  const {t, i18n} = useTranslation('childSummary');
  const navigation = useNavigation<ChildSummaryStackNavigationProp>();

  const {data: child} = useGetCurrentChild();
  const {data: {milestoneAge} = {}} = useGetMilestone();
  const {bottom} = useSafeAreaInsets();

  const milestoneAgeFormatted = useMemo(() => {
    return formattedAge(Number(milestoneAge), t, i18n.language === 'en').milestoneAgeFormatted;
  }, [i18n.language, milestoneAge, t]);

  useFocusEffect(
    React.useCallback(() => {
      queryCache.invalidateQueries((query) => {
        const key = query.queryKey?.[0] as string | undefined;
        return Boolean(key?.startsWith('concerns') || key?.startsWith('questions'));
      });
      queryCache.invalidateQueries('questions');
    }, []),
  );

  return (
    <View style={{backgroundColor: colors.white}}>
      <View
        style={{
          width: '100%',
          backgroundColor: 'transparent',
        }}>
        <View style={{height: 16, backgroundColor: colors.iceCold}} />
        <ShortHeaderArc width={'100%'} />
      </View>
      <KeyboardAwareScrollView
        enableOnAndroid={Platform.OS === 'android'}
        bounces={false}
        contentContainerStyle={
          {
            // paddingBottom: bottom ? bottom + 32 : 72,
          }
        }
        extraHeight={Platform.select({
          ios: 200,
        })}>
        <ChildSelectorModal />
        <ChildPhoto photo={child?.photo} />
        <Text
          style={[
            {
              textAlign: 'center',
              marginTop: 20,
              marginHorizontal: 32,
            },
            sharedStyle.largeBoldText,
          ]}>
          {`${t('childSummary:title', {name: _.upperFirst(child?.name) ?? '', age: milestoneAgeFormatted ?? ''})}`}
        </Text>
        <View style={{paddingHorizontal: 32}}>
          {/*<Text style={{marginTop: 15, textAlign: 'center', fontSize: 15, flex: 1}}>*/}
          <View style={{marginTop: 15, alignItems: 'flex-start'}}>
            <Text>
              <Trans t={t} i18nKey={'message1'} tOptions={{name: child?.name ?? ''}}>
                <Text
                  numberOfLines={1}
                  accessibilityRole={'link'}
                  onPress={() => {
                    trackEventByType('Link', 'Find EI', {page: "My Child's Summary"});
                    return Linking.openURL(t('findElLink'));
                  }}
                  style={[{textDecorationLine: 'underline', textAlign: 'left'}, sharedStyle.boldText]}
                />
                <Text
                  numberOfLines={1}
                  accessibilityRole={'link'}
                  onPress={() => {
                    trackEventByType('Link', 'Concerned', {page: "My Child's Summary"});
                    return Linking.openURL(t('concernedLink'));
                  }}
                  style={[{textDecorationLine: 'underline', textAlign: 'left'}, sharedStyle.boldText]}
                />
                <Text style={[sharedStyle.boldText]} />
                <Text style={{textAlign: 'left'}} />
              </Trans>
            </Text>
          </View>
          {/*</Text>*/}
          {/*<Text>Show your doctor or email summary</Text>*/}
        </View>
        <View style={{marginTop: 35}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, paddingTop: 26, paddingBottom: 44}}>
            <ComposeEmailButton />
            <AEButtonMultiline
              onPress={() => {
                trackInteractionByType('Show Doctor');
                navigation.navigate('Revisit');
              }}
              style={{marginTop: 10, marginBottom: 30}}>
              {t('showDoctor')}
            </AEButtonMultiline>
            <LanguageSelector
              onLanguageChange={(lng) => {
                trackSelectLanguage(lng);
                queryCache.invalidateQueries('questions');
              }}
              style={{marginHorizontal: 32}}
            />
          </View>
        </View>
        <SummaryItems />
        <View style={{marginTop: 30}}>
          <PurpleArc width={'100%'} />
          <View style={{backgroundColor: colors.purple, paddingBottom: bottom ? bottom + 32 : 32, paddingTop: 16}}>
            <AEButtonRounded
              onPress={() => {
                trackEventByType('Select', 'Done');
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'DashboardStack',
                      state: {
                        index: 1,
                        routes: [
                          {
                            name: 'Dashboard',
                          },
                        ],
                      },
                    },
                  ],
                });
              }}>
              {t('common:done')}
            </AEButtonRounded>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  blockContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    ...sharedStyle.shadow,
  },
  blockText: {
    fontSize: 18,
    borderRadius: 10,
    fontFamily: 'Montserrat-Bold',
  },
});

export default ChildSummaryScreen;
