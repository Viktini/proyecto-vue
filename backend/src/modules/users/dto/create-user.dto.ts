import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @Matches(/^(user|admin)$/)
  role?: string = 'user';
}