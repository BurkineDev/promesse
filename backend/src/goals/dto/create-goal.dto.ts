export class CreateGoalDto {
  name!: string;

  // BigInt in JSON as string
  targetAmountMinor?: string;

  // ISO strings
  targetDate?: string;
  lockedUntil?: string;
}
