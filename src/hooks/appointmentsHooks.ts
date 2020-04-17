import {queryCache, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {objectToQuery} from '../utils/helpers';
import {formatISO, parseISO} from 'date-fns';

export interface AppointmentDb {
  id: string;
  childId: string;
  date: string;
  notes?: string;
  apptType: string;
  doctorName?: string;
  questions?: string;
}

export type Appointment = Omit<AppointmentDb, 'date'> & {date: Date};
export type NewAppointment = Omit<Appointment, 'id'>;

export function useUpdateAppointment() {
  return useMutation<number, Appointment>(
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
      onSuccess: () => {
        queryCache.refetchQueries('appointment', {force: true});
      },
    },
  );
}

export function useAddAppointment() {
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
      onSuccess: (data, variables) => {
        queryCache.refetchQueries(['appointment', {childId: variables.childId}]);
      },
    },
  );
}

export function useDeleteAppointment() {
  return useMutation<void, string | number>(
    async (id) => {
      const result = await sqLiteClient.dB?.executeSql('delete FROM appointments where id = ?', [id]);

      const rowsAffected = result && result[0].rowsAffected;

      if (!rowsAffected) {
        throw new Error('Deletion failed');
      }
    },
    {
      throwOnError: false,
      onSuccess: () => {
        queryCache.refetchQueries('appointment');
      },
    },
  );
}

export function useGetAppointmentById(id: string | number | undefined) {
  return useQuery<Appointment, [string, {id: typeof id}]>(['appointment', {id}], async (key, variables) => {
    if (!variables.id) {
      throw new Error('Id is not defined');
    }

    const res = await sqLiteClient.dB?.executeSql('select * from appointments where id=?', [variables.id]);

    if (!res) {
      throw new Error('fetch failed');
    }

    const dbRes: AppointmentDb = res && res[0].rows.item(0);

    return {
      ...dbRes,
      date: parseISO(dbRes.date),
    } as Appointment;
  });
}

export function useGetChildAppointments(childId: number | string | undefined) {
  return useQuery<Appointment[], [string, {childId: typeof childId}]>(
    ['appointment', {childId: childId}],
    async (key, variables) => {
      if (!variables.childId) {
        return [];
      }
      const res = await sqLiteClient.dB?.executeSql('select * from appointments where childId=? order by date desc', [
        variables.childId,
      ]);

      if (!res) {
        throw new Error('fetch failed');
      }

      const dbRes: AppointmentDb[] = res && res[0].rows.raw();
      return dbRes.map((value) => ({
        ...value,
        date: parseISO(value.date),
      })) as Appointment[];
    },
  );
}
