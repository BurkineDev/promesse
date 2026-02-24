import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  user: { id: string; email: string } | null = null;
  error: string | null = null;
  loading = true;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (u) => {
        this.user = u;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Unauthorized';
        this.loading = false;
      },
    });
  }
}
