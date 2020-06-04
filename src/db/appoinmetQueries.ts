import {PropType} from '../resources/constants';
import {sqLiteClient} from './index';
import {Appointment, AppointmentDb} from '../hooks/appointmentsHooks';
import {ChildDbRecord} from '../hooks/childrenHooks';

export function getAppointmentById(id: PropType<Appointment, 'id'>): Promise<AppointmentDb | undefined> {
  const query = `select appointments.*, children.name 'childName', children.id 'childId', children.gender 'childGender'
       from appointments
                left join children on appointments.childId = children.id
       where appointments.id = ?`;
  const queryRes = sqLiteClient.dB?.executeSql(query, [id]).then((value) => value[0].rows.item(0));
  return Promise.resolve(queryRes);
}

export function getAppointmentsByChildId(childId: PropType<ChildDbRecord, 'id'>): Promise<AppointmentDb[] | undefined> {
  const query = sqLiteClient.dB
    ?.executeSql('select * from appointments where childId=? order by date desc', [childId])
    .then((value) => value[0].rows.raw() as AppointmentDb[]);
  return Promise.resolve(query);
}

export async function deleteAppointmentById(id: PropType<AppointmentDb, 'id'>) {
  const result = await sqLiteClient.dB?.executeSql('DELETE FROM appointments WHERE id = ?', [id]);
  return result && result[0].rowsAffected;
}
