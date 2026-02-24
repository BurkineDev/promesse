import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = 'me@local.dev';
  password = 'password';
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = null;
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (tokens) => {
        this.auth.saveTokens(tokens);
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err?.error?.message ?? 'Login failed';
      },
    });
  }
}
