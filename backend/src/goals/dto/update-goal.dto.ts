import { IsOptional, IsString } from "class-validator";

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  targetAmountMinor?: string; // bigint as string

  @IsOptional()
  @IsString()
  targetDate?: string; // ISO string
}
