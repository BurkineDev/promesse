import { IsOptional, IsString } from "class-validator";

export class SavingsMovementDto {
  @IsString()
  amountMinor!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
