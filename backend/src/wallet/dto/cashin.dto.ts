import { IsOptional, IsString } from "class-validator";

export class CashinDto {
  @IsString()
  amountMinor!: string; // BigInt string

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
