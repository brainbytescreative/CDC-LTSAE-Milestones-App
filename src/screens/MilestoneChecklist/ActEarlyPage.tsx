import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Concern} from '../../resources/milestoneChecklist';
import {
  useGetConcern,
  useGetConcerns,
  useGetIsMissingMilestone,
  useGetMilestone,
  useSetConcern,
} from '../../hooks/checklistHooks';
import {useNavigation} from '@react-navigation/native';
import {DashboardStackNavigationProp} from '../Dashboard/DashboardScreen';
import {colors, missingConcerns, sharedStyle} from '../../resources/constants';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useTranslation} from 'react-i18next';
import CheckMark from '../../components/svg/CheckMark';
import NoteIcon from '../../components/svg/NoteIcon';
import ChevronRightBig from '../../components/svg/ChevronRightBig';
import {Text} from 'react-native-paper';
import _ from 'lodash';
import AEYellowBox from '../../components/AEYellowBox';
import PurpleArc from '../../components/svg/PurpleArc';

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
        id &&
          childId &&
          milestoneId &&
          setConcern({concernId: id, answer: !concern?.answer, childId: childId, note: concern?.note, milestoneId});
      };

  const saveNote = useCallback(
    _.debounce((text: string) => {
      id &&
        childId &&
        milestoneId &&
        setConcern({concernId: id, childId, note: text, answer: !!concern?.answer, milestoneId});
    }, 500),
    [id, childId, concern?.answer],
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
              saveNote(e.nativeEvent.text);
            }}
            multiline
            style={{flexGrow: 1, fontFamily: 'Montserrat-Regular', fontSize: 15}}
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
    marginTop: -20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 35,
  },
  checkMarkContainer: {
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginLeft: 30,
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

const ActEarlyPage: React.FC<{}> = () => {
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAgeFormatted, milestoneAge: milestoneId} = {}} = useGetMilestone();
  const {data: {concerns} = {}} = useGetConcerns();
  const navigation = useNavigation<DashboardStackNavigationProp>();
  const {data: {isMissingConcern = false, isNotYet = false} = {}} = useGetIsMissingMilestone({childId, milestoneId});

  const {t} = useTranslation('milestoneChecklist');
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
      <FlatList
        ListHeaderComponent={
          <View style={{marginBottom: 50}}>
            <Text style={[styles.header, {marginTop: 40}]}>{milestoneAgeFormatted}</Text>
            <Text style={[styles.header]}>{t('milestoneChecklist')}</Text>
            <Text style={[{textAlign: 'center', fontWeight: 'normal', fontSize: 15, marginTop: 16}]}>
              {t('complete')}
            </Text>
            <Text style={[styles.header, {marginTop: 16}]}>{t('whenToActEarly')}</Text>
            <Text style={{textAlign: 'center', marginTop: 10, marginHorizontal: 48}}>
              {t('actEarlyMessage1')} <Text style={{textDecorationLine: 'underline'}}>{t('actEarlyLinkText')}</Text>
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
                onPress={() => {
                  navigation.navigate('ChildSummary');
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
                  <Text style={{flexGrow: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold'}}>
                    {t('myChildSummary')}
                  </Text>
                  <ChevronRightBig width={10} height={20} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    fontSize: 20,
    textTransform: 'capitalize',
    marginTop: 5,
    fontFamily: 'Montserrat-Bold',
  },
  text: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    fontSize: 16,
  },
  answerButton: {
    borderWidth: 1,
    height: 50,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMarkSelected: {},
});

export default ActEarlyPage;
