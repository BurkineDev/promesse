export class CreateGoalDto {
  name!: string;

  // BigInt in JSON: string (minor units)
  targetAmountMinor?: string;

  // ISO strings
  targetDate?: string;
  lockedUntil?: string;
}
