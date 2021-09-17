export type CreateUserData = {
  birthDate: string;
  firstName: string;
  imageUri: string;
  lastName: string;
  phone: string;
};

export type UpdateUserData = CreateUserData & { userId: string };

export type User = {
  birthDate: string;
  createdAt: string;
  firstName: string;
  imageUri: string;
  lastName: string;
  phone: string;
  userId: string;
  verified: boolean;
  appOrigin: string;
};
