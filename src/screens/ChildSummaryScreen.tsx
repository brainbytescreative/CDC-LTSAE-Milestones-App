import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChildSelectorModal from '../components/ChildSelectorModal';
import {Trans, useTranslation} from 'react-i18next';
import {
  Answer,
  MilestoneAnswer,
  useGetChecklistQuestions,
  useGetConcerns,
  useGetMilestone,
  useSetConcern,
  useSetQuestionAnswer,
} from '../hooks/checklistHooks';
import {Text} from 'react-native-paper';
import LanguageSelector from '../components/LanguageSelector';
import {CompositeNavigationProp, useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeArea} from 'react-native-safe-area-context';
import {colors, missingConcerns, PropType, sharedStyle} from '../resources/constants';
import ShortHeaderArc from '../resources/svg/ShortHeaderArc';
import {useGetCurrentChild} from '../hooks/childrenHooks';
import ChildPhoto from '../components/ChildPhoto';
import AEButtonRounded from '../components/Navigator/AEButtonRounded';
import {PurpleArc} from '../resources/svg';
import * as MailComposer from 'expo-mail-composer';
import emailSummaryContent from '../resources/EmailChildSummary';
import nunjucks from 'nunjucks';
import {formatDate, tOpt} from '../utils/helpers';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {ChildSummaryParamList, DashboardDrawerParamsList} from '../components/Navigator/types';
import {StackNavigationProp} from '@react-navigation/stack';
import {useActionSheet} from '@expo/react-native-action-sheet';
import _ from 'lodash';
import NoteIcon from '../resources/svg/NoteIcon';
import AEKeyboardAvoidingView from '../AEKeyboardAvoidingView';

type IdType = PropType<MilestoneAnswer, 'questionId'>;
type NoteType = PropType<MilestoneAnswer, 'note'>;

interface ItemProps {
  value?: string;
  id?: IdType;
  note?: NoteType;
  onEditAnswerPress?: (id: IdType, note: NoteType) => void;
  onEditNotePress?: (id: IdType, note: NoteType) => void;
  hideControls?: boolean;
}

const Item: React.FC<ItemProps> = ({value, id, note, onEditAnswerPress, hideControls = false, onEditNotePress}) => {
  const {t} = useTranslation('childSummary');
  const [noteLocal, setNote] = useState<string | undefined>(undefined);

  const onSavePress = () => {
    id && onEditNotePress && onEditNotePress(id, noteLocal);
    setNote(undefined);
  };
  return (
    <View style={{marginTop: 32, marginHorizontal: 16}}>
      <Text style={{fontSize: 15}} key={`${id}`}>
        {value}
      </Text>
      {!!note && noteLocal === undefined && (
        <Text style={{fontSize: 15}} key={`${id}`}>
          <Text style={{fontFamily: 'Montserrat-Bold'}}>
            {t('note')}
            {': '}
          </Text>{' '}
          {note}
        </Text>
      )}

      {noteLocal !== undefined && (
        <View style={[itemStyles.addNoteContainer, sharedStyle.shadow]}>
          <TextInput
            value={noteLocal || note || ''}
            onChange={(e) => {
              setNote(e.nativeEvent.text);
              // saveNote(e.nativeEvent.text);
            }}
            returnKeyType={'done'}
            onSubmitEditing={onSavePress}
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
            onPress={() => {
              id && onEditAnswerPress && onEditAnswerPress(id, note);
            }}>
            <Text style={{textDecorationLine: 'underline', fontSize: 12}}>{t('editAnswer')}</Text>
          </TouchableOpacity>
        )}
        {noteLocal === undefined && (
          <TouchableOpacity
            onPress={() => {
              setNote('');
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

const ChildSummaryScreen: React.FC<{}> = () => {
  const {t} = useTranslation('childSummary');
  const navigation = useNavigation<ChildSummaryStackNavigationProp>();
  const {data, refetch} = useGetChecklistQuestions();
  const {data: {milestoneAgeFormatted} = {}} = useGetMilestone();
  const {data: concerns, refetch: refetchConcerns} = useGetConcerns();
  const {data: child} = useGetCurrentChild();
  const {bottom} = useSafeArea();
  const [answerQuestion] = useSetQuestionAnswer();
  const [setConcern] = useSetConcern();

  useFocusEffect(
    React.useCallback(() => {
      refetch({force: true}).then();
      refetchConcerns({force: true}).then();
    }, [refetch, refetchConcerns]),
  );
  const link1 = t('link1Text');
  const link2 = t('link2Text');

  const {showActionSheetWithOptions} = useActionSheet();

  const onEditQuestionPress = useCallback<NonNullable<PropType<ItemProps, 'onEditAnswerPress'>>>(
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
          Object.values(Answer).includes(index) &&
            child?.id &&
            answerQuestion({answer: index, childId: child?.id, note, questionId: id}).then(() => {
              refetch({force: true});
            });
        },
      );
    },
    [refetch, t, answerQuestion, child, showActionSheetWithOptions],
  );

  const onEditConcernPress = useCallback<NonNullable<PropType<ItemProps, 'onEditAnswerPress'>>>(
    (id, note) => {
      const options = [
        t('milestoneChecklist:answer_yes'),
        t('milestoneChecklist:answer_no'),

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
          [0, 1].includes(index) &&
            child?.id &&
            setConcern({concernId: id, answer: !index, childId: child?.id, note: note}).then(() =>
              refetchConcerns({force: true}),
            );
        },
      );
    },
    [refetchConcerns, t, child, showActionSheetWithOptions, setConcern],
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
      <KeyboardAvoidingView behavior={Platform.select({ios: 'padding'})}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            paddingBottom: bottom + 76,
          }}>
          <ChildSelectorModal />
          <ChildPhoto photo={child?.photo} />
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 22,
              textTransform: 'capitalize',
              marginHorizontal: 32,
              fontFamily: 'Montserrat-Bold',
            }}>
            {`${child?.name}${t('childSummary:title')}`}
            {'\n'}
            {milestoneAgeFormatted}
          </Text>
          <View style={{paddingHorizontal: 32}}>
            <Text style={{marginTop: 15, textAlign: 'center', fontSize: 15}}>
              <Trans t={t} i18nKey={'message1'}>
                <Text style={{textDecorationLine: 'underline'}}>{{link1}}</Text>
                <Text style={{textDecorationLine: 'underline'}}>{{link2}}</Text>
              </Trans>
            </Text>
            {/*<Text>Show your doctor or email summary</Text>*/}
          </View>
          <View style={{marginTop: 35}}>
            <PurpleArc width={'100%'} />
            <View style={{backgroundColor: colors.purple, paddingTop: 26, paddingBottom: 44}}>
              <AEButtonRounded
                onPress={() => {
                  MailComposer.composeAsync({
                    isHtml: true,
                    body: nunjucks.renderString(emailSummaryContent.en, {
                      childName: child?.name,
                      concerns: concerns?.concerned,
                      skippedItems: data?.groupedByAnswer[`${undefined}`],
                      yesItems: data?.groupedByAnswer['0'],
                      notSureItems: data?.groupedByAnswer['1'],
                      notYetItems: data?.groupedByAnswer['2'],
                      formattedAge: milestoneAgeFormatted,
                      currentDayText: formatDate(new Date(), 'date'),
                      ...tOpt({t, gender: child?.gender}),
                    }),
                  });
                }}
                style={{marginBottom: 0}}>
                {t('emailSummary')}
              </AEButtonRounded>
              <AEButtonRounded
                onPress={() => {
                  navigation.navigate('Revisit');
                }}
                style={{marginTop: 10, marginBottom: 30}}>
                {t('showDoctor')}
              </AEButtonRounded>
              <LanguageSelector onLanguageChange={() => refetch({force: true})} style={{marginHorizontal: 32}} />
            </View>
          </View>

          <View style={{marginHorizontal: 32}}>
            <View style={[styles.blockContainer, {backgroundColor: colors.iceCold}]}>
              <Text style={styles.blockText}>{t('unanswered')}</Text>
            </View>
            {data?.groupedByAnswer['undefined']?.map((item) => (
              <Item
                key={`answer-${item.id}`}
                onEditAnswerPress={onEditQuestionPress}
                value={item.value}
                id={item.id}
                note={item.note}
              />
            ))}
            <View style={[styles.blockContainer, {backgroundColor: colors.yellow}]}>
              <Text style={styles.blockText}>{t('concerns')}</Text>
            </View>
            {concerns?.concerned?.map((item) => (
              <Item
                key={`concern-${item.id}`}
                onEditAnswerPress={onEditConcernPress}
                hideControls={!!item.id && missingConcerns.includes(item.id)}
                value={item.value}
                note={item.note}
                id={item.id}
              />
            ))}
            <View style={[styles.blockContainer, {backgroundColor: colors.tanHide}]}>
              <Text style={styles.blockText}>{t('notSure')}</Text>
            </View>
            {data?.groupedByAnswer['1']?.map((item) => (
              <Item
                key={`answer-${item.id}`}
                onEditAnswerPress={onEditQuestionPress}
                value={item.value}
                note={item.note}
                id={item.id}
              />
            ))}
            <View style={[styles.blockContainer, {backgroundColor: colors.apricot}]}>
              <Text style={styles.blockText}>{t('notYet')}</Text>
            </View>
            {data?.groupedByAnswer['2']?.map((item) => (
              <Item
                key={`answer-${item.id}`}
                onEditAnswerPress={onEditQuestionPress}
                value={item.value}
                note={item.note}
                id={item.id}
              />
            ))}
            <View style={[styles.blockContainer, {backgroundColor: colors.lightGreen}]}>
              <Text style={styles.blockText}>{t('yes')}</Text>
            </View>
            {data?.groupedByAnswer['0']?.map((item) => (
              <Item
                key={`answer-${item.id}`}
                onEditAnswerPress={onEditQuestionPress}
                value={item.value}
                note={item.note}
                id={item.id}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    textTransform: 'capitalize',
  },
});

export default ChildSummaryScreen;
