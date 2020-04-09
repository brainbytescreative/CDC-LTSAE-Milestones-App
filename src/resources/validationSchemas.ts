import * as yup from 'yup';

export const addEditChildSchema = yup.object({
  name: yup.string().required(),
  gender: yup.number().required().min(0).max(1),
  birthday: yup.date().required(),
  photo: yup.string().nullable(),
});

export const addAppointmentSchema = yup.object({
  apptType: yup.string().required(),
  date: yup.date().required(),
  time: yup.date().required(),
  doctorName: yup.string().nullable(true),
  notes: yup.string().nullable(true),
  questions: yup.string().nullable(true),
});
