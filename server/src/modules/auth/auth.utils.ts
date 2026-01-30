import { prisma } from '../../utils/prisma.utils';
import { CreateUserWithPasswordType } from './auth.schemas';

export const checkUserEmailExists = async (email: string) => {
   const existingEmail = await prisma.user.findFirst({
      where: {
         email,
      },
   });

   return !!existingEmail;
};

export const createNewUserWithPassword = async (
   input: CreateUserWithPasswordType & { passwordHash: string }
) => {
   const { password, ...inputWithPassword } = input;
   const newUser = await prisma.user.create({
      data: inputWithPassword,
   });

   return newUser;
};
