import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  page: number;
}

export class FilterQueryDto {
  @IsOptional()
  email: string;

  @IsOptional()
  @IsUUID()
  offerId: string;
}

export class PaginationResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
