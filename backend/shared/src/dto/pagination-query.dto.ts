import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * Base query DTO for every list endpoint. Concrete DTOs extend this and add
 * their own filters plus a `sortBy` whitelist.
 */
export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer.' })
  @Min(1, { message: 'page must be at least 1.' })
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'perPage must be an integer.' })
  @Min(1, { message: 'perPage must be at least 1.' })
  @Max(100, { message: 'perPage may not exceed 100.' })
  @IsOptional()
  perPage: number = 15;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @IsIn(['asc', 'desc'], { message: 'sortDir must be either asc or desc.' })
  @IsOptional()
  sortDir: 'asc' | 'desc' = 'desc';
}
