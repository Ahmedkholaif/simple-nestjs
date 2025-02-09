import { IsString, IsNumber, Min, Max } from 'class-validator';
export class CreateSpecialOfferDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;
}
