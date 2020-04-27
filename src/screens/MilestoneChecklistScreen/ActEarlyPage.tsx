import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {Concern} from '../../resources/milestoneChecklist';
import {useGetConcern, useGetConcerns, useGetMilestone, useSetConcern} from '../../hooks/checklistHooks';
import {useNavigation} from '@react-navigation/native';
import {DashboardStackNavigationProp} from '../Dashboard/DashboardScreen';
import {colors, missingConcerns, sharedStyle} from '../../resources/constants';
import {useGetCurrentChild} from '../../hooks/childrenHooks';
import {useTranslation} from 'react-i18next';
import CheckMark from '../../resources/svg/CheckMark';
import NoteIcon from '../../resources/svg/NoteIcon';
import AEButtonRounded from '../../components/Navigator/AEButtonRounded';
import ChevronRightBig from '../../resources/svg/ChevronRightBig';
import {Text, Title} from 'react-native-paper';
import {PurpleArc} from '../../resources/svg';

const Item: React.FC<Concern & {childId?: number}> = ({id, value, childId}) => {
  const [setConcern] = useSetConcern();
  const {data: concern} = useGetConcern({concernId: id, childId});
  const {t} = useTranslation('milestoneChecklist');

  const isMissingAnswerConcern = missingConcerns.includes(id || 0);
  const onPress = isMissingAnswerConcern
    ? undefined
    : () => {
        id && childId && setConcern({concernId: id, answer: !concern?.answer, childId: childId});
      };

  return (
    <View style={[itemStyles.container, sharedStyle.shadow]}>
      <View
        style={{
          paddingHorizontal: 16,
        }}>
        <Text style={{textAlign: 'center'}}>{value}</Text>
      </View>
      <View style={itemStyles.buttonsContainer}>
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

        <TouchableOpacity style={itemStyles.addNoteContainer}>
          <NoteIcon />
          <Text>{t('addANote')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    marginHorizontal: 32,
    marginBottom: 30 + 35, //buttonsContainer margin + margin
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: colors.purple,
    borderRadius: 10,
  },
  buttonsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    bottom: -30,
  },
  checkMarkContainer: {
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginLeft: 30,
    width: 58,
    height: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteContainer: {
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginRight: 20,
    backgroundColor: 'white',
  },
});

const ActEarlyPage: React.FC<{}> = () => {
  const {data: {id: childId} = {}} = useGetCurrentChild();
  const {data: {milestoneAgeFormatted} = {}} = useGetMilestone();
  const {data: concerns} = useGetConcerns();
  const navigation = useNavigation<DashboardStackNavigationProp>();
  const {t} = useTranslation('milestoneChecklist');
  return (
    <FlatList
      ListHeaderComponent={
        <View>
          <Title style={[styles.header, {marginTop: 40}]}>{milestoneAgeFormatted}</Title>
          <Title style={[styles.header]}>{t('milestoneChecklist')}</Title>
          <Text style={[{textAlign: 'center', fontWeight: 'normal', fontSize: 15, marginTop: 16}]}>
            {t('complete')}
          </Text>
          <Title style={[styles.header, {marginTop: 16}]}>{t('whenToActEarly')}</Title>
          <Text style={{textAlign: 'center', marginTop: 10, marginHorizontal: 48}}>
            {t('actEarlyMessage1')} <Text style={{textDecorationLine: 'underline'}}>{t('actEarlyLinkText')}</Text>
          </Text>
          <Text
            style={[
              {
                backgroundColor: colors.yellow,
                padding: 5,
                marginHorizontal: 32,
                marginTop: 20,
                marginBottom: 50,
                textAlign: 'center',
                fontSize: 15,
              },
              sharedStyle.shadow,
            ]}>
            {t('actEarlyWarning')}
          </Text>
        </View>
      }
      data={concerns?.concerns || []}
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
                <Title style={{flexGrow: 1, textAlign: 'center'}}>My Child’s Summary</Title>
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
    textTransform: 'capitalize',
    marginTop: 5,
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
