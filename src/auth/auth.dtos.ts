import { IsNotEmpty, IsString } from 'class-validator'

export class AuthLoginRequestDto {
  @IsNotEmpty()
  @IsString()
  username: string

  @IsNotEmpty()
  @IsString()
  password: string
}

export class AuthLogoutDto {
  @IsNotEmpty()
  @IsString()
  username: string
}
