import * as yup from 'yup';

export const addEditChildSchema = yup.object({
  name: yup.string().required(),
  gender: yup.number().required().min(0).max(1),
  birthday: yup.date().required(),
  photo: yup.string().nullable(),
});
