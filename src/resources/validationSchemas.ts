import * as yup from 'yup';

export const childSchema = yup
  .object({
    name: yup.string().required(),
    gender: yup.number().required().min(0).max(1),
    birthday: yup.date<Date>().defined().required(),
    photo: yup.string().nullable(),
    isPremature: yup.boolean().default(false).defined(),
    weeksPremature: yup.number().nullable(),
  })
  .defined();

export const updateChildSchema = childSchema.concat(
  yup
    .object({
      id: yup.number().required(),
    })
    .defined(),
);

export const addEditChildSchema = yup
  .object({
    firstChild: childSchema,
    anotherChildren: yup.array().of(childSchema),
  })
  .defined();

export type AddEditChildSchemaType = yup.InferType<typeof addEditChildSchema>;

export const addAppointmentSchema = yup.object({
  apptType: yup.string().required().defined(),
  date: yup.date().required().defined(),
  time: yup.date().required().defined(),
  doctorName: yup.string().nullable(true),
  notes: yup.string().nullable(true),
  questions: yup.string().nullable(true),
});

export const editProfileSchema = yup.object({
  guardian: yup.string(),
  territory: yup.string().required(),
});
