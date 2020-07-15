import {queryCache, QueryOptions, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {objectToQuery} from '../utils/helpers';
import {formatISO, parseISO} from 'date-fns';
import {PropType} from '../resources/constants';
import {ChildDbRecord} from './childrenHooks';
import {useDeleteNotificationsByAppointmentId, useSetAppointmentNotifications} from './notificationsHooks';
import {deleteAppointmentById, getAppointmentById, getAppointmentsByChildId} from '../db/appoinmetQueries';
import {ChildResult} from './types';

export interface AppointmentDb {
  id: number;
  childId: PropType<ChildResult, 'id'>;
  childName: PropType<ChildResult, 'name'>;
  childGender: PropType<ChildResult, 'gender'>;
  date: string;
  notes?: string;
  apptType: string;
  doctorName?: string;
  questions?: string;
}
type JoinedChildFields = 'childName' | 'childGender';
export type Appointment = Omit<AppointmentDb, 'date'> & {date: Date};
export type UpdateAppointment = Omit<Appointment, JoinedChildFields>;
export type NewAppointment = Omit<UpdateAppointment, 'id'>;

export function useUpdateAppointment() {
  const [setAppointmentNotifications] = useSetAppointmentNotifications();
  return useMutation<number, UpdateAppointment>(
    async (variables) => {
      const [query, values] = objectToQuery(
        {
          ...variables,
          date: formatISO(variables.date),
        },
        'appointments',
        'updateById',
      );
      const res = await sqLiteClient.dB?.executeSql(query, values);
      const rowsAffected = res && res[0].rowsAffected;
      if (!rowsAffected || rowsAffected === 0) {
        throw new Error('Update appointment failed');
      }

      return rowsAffected;
    },
    {
      onSuccess: (data, variables) => {
        queryCache.invalidateQueries('appointment');
        setAppointmentNotifications({appointmentId: variables.id});
      },
    },
  );
}

export function useAddAppointment() {
  const [setAppointmentNotifications] = useSetAppointmentNotifications();
  return useMutation<number, NewAppointment>(
    async (variables) => {
      const [query, values] = objectToQuery(
        {
          ...variables,
          date: formatISO(variables.date),
        },
        'appointments',
      );
      const res = await sqLiteClient.dB?.executeSql(query, values);
      const [{insertId}] = res || [{}];
      const rowsAffected = res && res[0].rowsAffected;
      if (!rowsAffected || rowsAffected === 0 || !insertId) {
        throw new Error('Add appointment failed');
      }

      return insertId;
    },
    {
      onSuccess: (data) => {
        queryCache.invalidateQueries(['appointment']);
        setAppointmentNotifications({
          appointmentId: data,
        });
      },
    },
  );
}

export function useDeleteAppointment() {
  const [deleteNotificationsByAppointmentId] = useDeleteNotificationsByAppointmentId();
  return useMutation<void, PropType<AppointmentDb, 'id'>>(
    async (id) => {
      const rowsAffected = await deleteAppointmentById(id);

      if (!rowsAffected) {
        throw new Error('Deletion failed');
      }
    },
    {
      throwOnError: false,
      onSuccess: (data, id) => {
        queryCache.invalidateQueries('appointment');
        deleteNotificationsByAppointmentId({id});
      },
    },
  );
}

export function useGetAppointmentById(id?: PropType<Appointment, 'id'>) {
  return useQuery<(Appointment & {childName?: string}) | undefined, [string, {id: typeof id}]>(
    ['appointment', {id}],
    async (key, variables) => {
      if (!variables.id) {
        // throw new Error('Id is not defined');
        return;
      }

      // language=SQLite
      const appointment = await getAppointmentById(variables.id);

      if (!appointment) {
        // throw new Error('fetch failed');
        return;
      }

      return {
        ...appointment,
        date: parseISO(appointment.date),
      } as Appointment;
    },
  );
}

export function useGetChildAppointments(
  childId?: PropType<ChildDbRecord, 'id'>,
  options?: QueryOptions<Appointment[]>,
) {
  return useQuery<Appointment[], [string, {childId: typeof childId}]>(
    ['appointment', {childId: childId}],
    async (key, variables) => {
      if (!variables.childId) {
        return [];
      }
      const dbRes = await getAppointmentsByChildId(variables.childId);

      if (!dbRes) {
        throw new Error('fetch failed');
      }

      return dbRes.map((value) => ({
        ...value,
        date: parseISO(value.date),
      })) as Appointment[];
    },
    options ?? {},
  );
}
