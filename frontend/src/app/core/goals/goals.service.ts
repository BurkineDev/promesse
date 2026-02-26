import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type Goal = {
  id: string;
  userId: string;
  accountId?: string | null;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  lockedUntil: string | null;
  targetAmountMinor: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private baseUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  listGoals() {
    return this.http.get<Goal[]>(this.baseUrl);
  }

  createGoal(name: string) {
    return this.http.post<Goal>(this.baseUrl, { name });
  }
}
