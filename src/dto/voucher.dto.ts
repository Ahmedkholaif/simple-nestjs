import { IsString, IsEmail, IsDateString, IsUUID } from 'class-validator';

export class CreateVoucherDto {
  @IsString()
  @IsUUID()
  offerId: string;

  @IsDateString()
  expirationDate: string;
}

export class ValidateVoucherDto {
  @IsString()
  code: string;

  @IsEmail()
  email: string;
}

export class FilterByEmailBodyDto {
  @IsEmail()
  email: string;
}
