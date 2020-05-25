import {queryCache, QueryOptions, useMutation, useQuery} from 'react-query';
import {sqLiteClient} from '../db';
import {objectToQuery} from '../utils/helpers';
import {formatISO, parseISO} from 'date-fns';
import {PropType} from '../resources/constants';
import {ChildResult} from './childrenHooks';

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

export type Appointment = Omit<AppointmentDb, 'date'> & {date: Date};
type UpdateAppointment = Omit<Appointment, 'childName' | 'childGender'>;
export type NewAppointment = Omit<UpdateAppointment, 'id'>;

export function useUpdateAppointment() {
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
      onSuccess: () => {
        queryCache.refetchQueries(['appointment'], {force: true});
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
        queryCache.refetchQueries('appointment', {force: true});
      },
    },
  );
}

export function useGetAppointmentById(id: string | number | undefined) {
  return useQuery<(Appointment & {childName?: string}) | undefined, [string, {id: typeof id}]>(
    ['appointment', {id}],
    async (key, variables) => {
      if (!variables.id) {
        // throw new Error('Id is not defined');
        return;
      }

      // language=SQLite
      const query = `select appointments.*, children.name 'childName', children.id 'childId', children.gender 'childGender'
       from appointments
                left join children on appointments.childId = children.id
       where appointments.id = ?`;
      const res = await sqLiteClient.dB?.executeSql(query, [variables.id]);

      if (!res) {
        // throw new Error('fetch failed');
        return;
      }

      const dbRes: AppointmentDb = res && res[0].rows.item(0);

      return {
        ...dbRes,
        date: parseISO(dbRes.date),
      } as Appointment;
    },
  );
}

export function useGetChildAppointments(childId: number | string | undefined, options?: QueryOptions<Appointment[]>) {
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
    options,
  );
}
