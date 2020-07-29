import {formatISO} from 'date-fns';

import {ChildDbRecord} from '../hooks/childrenHooks';
import {Appointment, AppointmentDb, ChildJoin} from '../hooks/types';
import {NoExtraProperties} from '../resources/constants';
import {UpdateTableTypes, updateByIdQuery} from '../utils/helpers';
import {sqLiteClient} from './index';

export function getAppointmentById(id: Appointment['id']): Promise<(AppointmentDb & ChildJoin) | undefined> {
  const query = `select appointments.*, children.name 'childName', children.id 'childId', children.gender 'childGender'
       from appointments
                left join children on appointments.childId = children.id
       where appointments.id = ?`;
  const queryRes = sqLiteClient.dB?.executeSql(query, [id]).then((value) => value[0].rows.item(0));
  return Promise.resolve(queryRes);
}

export function getAppointmentsByChildId(childId: ChildDbRecord['id']): Promise<AppointmentDb[] | undefined> {
  const query = sqLiteClient.dB
    ?.executeSql('select * from appointments where childId=? order by date desc', [childId])
    .then((value) => value[0].rows.raw() as AppointmentDb[]);
  return Promise.resolve(query);
}

export async function deleteAppointmentById(id: Appointment['id']) {
  const result = await sqLiteClient.dB?.executeSql('DELETE FROM appointments WHERE id = ?', [id]);
  return result && result[0].rowsAffected;
}

export function updateAppointmentById<T extends UpdateTableTypes['appointments']>(
  id: Appointment['id'],
  appointment: NoExtraProperties<UpdateTableTypes['appointments'], T>,
) {
  const updateData = {...appointment, date: appointment.date && formatISO(appointment.date)};
  return updateByIdQuery(id, 'appointments', updateData);
}
