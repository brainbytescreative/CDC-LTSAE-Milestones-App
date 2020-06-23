import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import OnboardingHowToUseScreen from '../../screens/Onboarding/OnboardingHowToUseScreen';
import {RootStackParamList} from './types';
import RootDrawer from './RootDrawer';
import {useGetOnboarding} from '../../hooks/onboardingHooks';
import {initialize, sqLiteClient} from '../../db';
import SQLiteClient, {DowngradeError} from '../../db/SQLiteClient';
import OnboardingInfoScreen from '../../screens/Onboarding/OnboardingInfoScreen';
import OnboardingParentProfileScreen from '../../screens/Onboarding/OnboardingParentProfileScreen';
import AddChildScreen from '../../screens/AddChildScreen';
import withSuspense from '../withSuspense';
import ErrorBoundary from '../ErrorBoundary';
import crashlytics from '@react-native-firebase/crashlytics';
import {queryCache, useQuery} from 'react-query';
import * as Notifications from 'expo-notifications';
import {useNavigateNotification} from '../../hooks/notificationsHooks';
import {NavigationContainerRef} from '@react-navigation/core';
import i18next from '../../resources/l18n';
import {I18nextProvider} from 'react-i18next';
import {formatISO, fromUnixTime} from 'date-fns';
import {objectToQuery} from '../../utils/helpers';
import _ from 'lodash';
import milestoneChecklist from '../../resources/milestoneChecklist';

const Stack = createStackNavigator<RootStackParamList>();

type ChildIOSDB = {
  id: number;
  name: string;
  dateOfBirth: number;
  gender: 0 | 1;
  doctorName: string;
  parentName: string | null;
  parentEmail: string | null;
  doctorEmail: string | null;
};

type AppointmentIOSDB = {
  date: number | null;
  notes: string | null;
};

type MilestoneAnswerOld = {
  answer: number;
  questionId: number;
  note: string | null;
};

const Navigator: React.FC<{navigation: NavigationContainerRef | null}> = ({navigation}) => {
  const {data: isOnboarded} = useGetOnboarding();
  // const [, setLoading] = useState(true);
  const [navigateNotification] = useNavigateNotification();

  useQuery(
    'dbConnect',
    async () => {
      await initialize().catch((err) => {
        // todo implement error handling
        if (err instanceof DowngradeError) {
          // setErrorMessage('Downgrade error');
        } else {
          // setErrorMessage('Unexpected error');
        }
        // setError(true);
        // setLoading(false);
        crashlytics().recordError(err);
        // setLoading(false);
      });
    },
    {suspense: true},
  );

  useEffect(() => {
    console.log('<<<<<');

    new SQLiteClient('act_early', [])
      .connect()
      .then(async (oldDbClient) => {
        const questions = milestoneChecklist
          .map(
            (value) =>
              (value.milestones && Object.values(value.milestones).flat())?.map((q) => ({
                ...q,
                milestoneId: value.id,
              })) || [],
          )
          .flat();

        const res = await oldDbClient.executeSql('SELECT * FROM Children');
        const children: ChildIOSDB[] = (res && res[0].rows.raw()) || [];

        const childrenRecords = children.map(({dateOfBirth, ...rest}) => ({
          birthday: formatISO(fromUnixTime(Math.floor(dateOfBirth))),
          ...rest,
        }));

        await Promise.all(
          childrenRecords.map((record) =>
            sqLiteClient.dB?.transaction(async (tx) => {
              const query = objectToQuery(_.omit(record, 'id'), 'children');
              const [, {insertId: newChildId}] = await tx.executeSql(query[0], query[1]);

              const [{rows: aptRows}] = await oldDbClient.executeSql(
                `
                          SELECT apptDate 'date', N.noteContent 'notes'
                          FROM Appointments apt
                                   LEFT JOIN Notes N ON apt.noteId = N.id
                          WHERE apt.childId = ?1`,
                [record.id],
              );

              const aptRecords: AppointmentIOSDB[] = aptRows.raw();
              await Promise.all(
                aptRecords.map(async ({date, notes}) => {
                  const newApt = {
                    date: formatISO(fromUnixTime(Math.floor(date || 0))),
                    notes,
                    childId: newChildId,
                    apptType: `${record.name}`,
                  };

                  const [queryText, params] = objectToQuery(newApt, 'appointments');
                  await sqLiteClient.dB?.executeSql(queryText, params);
                }),
              );

              const [{rows: milestoneAnswersOldRes}] = await oldDbClient.executeSql(
                `
                          SELECT CASE ma.answer WHEN 3 THEN 0 ELSE ma.answer END 'answer',
                                 mq.questionId,
                                 n.noteContent                                   'note',
                                 ma.childId
                          FROM MilestonesAnswers ma
                                   LEFT JOIN Notes n ON n.id = ma.noteId
                                   INNER JOIN MilestonesQuestions mq ON ma.questionId = mq.id
                          WHERE childId = ?
                `,
                [record.id],
              );

              const milestoneAnswersOldRecords: MilestoneAnswerOld[] = milestoneAnswersOldRes.raw();

              await Promise.all(
                milestoneAnswersOldRecords.map((value) => {
                  const question = _.find(questions, {
                    id: value.questionId,
                  });
                  const object = {...value, childId: newChildId, milestoneId: question.milestoneId || 0};
                  const [milestonesQuery, params] = objectToQuery(object, 'milestones_answers');

                  sqLiteClient.dB?.executeSql(milestonesQuery, params);
                }),
              );
            }),
          ),
        );
      })
      .catch((e) => {
        console.log('<<<', e);
      });
  }, []);

  // useQuery('translations', async (key) => {
  //   const response = await axios.get(
  //     `https://localise.biz/api/export/locale/${lng}.json?index=id&format=i18next3&fallback=en&order=id&key=fJZGm8wQxOD8GUd0vZgsCTmJT4uxwGyg`,
  //   );
  // });

  React.useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('addNotificationReceivedListener', notification);
      setTimeout(() => {
        queryCache.refetchQueries('unreadNotifications', {force: true});
      }, 2000);
    });
    return () => subscription.remove();
  }, []);

  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigation && navigateNotification(response.notification.request.identifier, navigation);
    });
    return () => subscription.remove();
  }, [navigation, navigateNotification]);

  // const isOnboarded = data; //data;
  return (
    <I18nextProvider i18n={i18next}>
      <ErrorBoundary>
        <Stack.Navigator headerMode={'none'}>
          {!isOnboarded && (
            <>
              <Stack.Screen name={'OnboardingInfo'} component={OnboardingInfoScreen} />
              <Stack.Screen name={'OnboardingParentProfile'} component={OnboardingParentProfileScreen} />
              <Stack.Screen name={'AddChild'} initialParams={{onboarding: true}} component={AddChildScreen} />
              <Stack.Screen name={'OnboardingHowToUse'} component={OnboardingHowToUseScreen} />
            </>
          )}
          <Stack.Screen name={'Dashboard'} component={RootDrawer} />
        </Stack.Navigator>
      </ErrorBoundary>
    </I18nextProvider>
  );
};

export default withSuspense(Navigator);
