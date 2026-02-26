import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { GoalsService, Goal } from '../../core/goals/goals.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  user: { id: string; email: string } | null = null;

  error: string | null = null;
  loading = true;

  goals: Goal[] = [];
  goalsLoading = false;
  goalsError: string | null = null;

  newGoalName = '';
  creatingGoal = false;
  createError: string | null = null;

  constructor(
    private auth: AuthService,
    private goalsService: GoalsService
  ) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (u) => {
        this.user = u;
        this.loading = false;
        this.loadGoals();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Unauthorized';
        this.loading = false;
      },
    });
  }

  private loadGoals() {
    this.goalsLoading = true;
    this.goalsError = null;

    this.goalsService.listGoals().subscribe({
      next: (gs) => {
        this.goals = gs;
        this.goalsLoading = false;
      },
      error: (err) => {
        this.goalsError = err?.error?.message ?? 'Failed to load goals';
        this.goalsLoading = false;
      },
    });
  }

  createGoal() {
    const name = this.newGoalName.trim();
    if (!name) return;

    this.creatingGoal = true;
    this.createError = null;

    this.goalsService.createGoal(name).subscribe({
      next: (g) => {
        this.goals.unshift(g);
        this.newGoalName = '';
        this.creatingGoal = false;
      },
      error: (err) => {
        this.createError = err?.error?.message ?? 'Failed to create goal';
        this.creatingGoal = false;
      },
    });
  }
}
