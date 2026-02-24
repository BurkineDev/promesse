import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type Me = {
  id: string;
  email: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokens: TokenService
  ) {}

  register(email: string, password: string) {
    return this.http.post<Tokens>(`${this.baseUrl}/register`, {
      email,
      password,
    });
  }

  login(email: string, password: string) {
    return this.http.post<Tokens>(`${this.baseUrl}/login`, {
      email,
      password,
    });
  }

  me() {
    return this.http.get<Me>(`${this.baseUrl}/me`);
  }

  refresh(refreshToken: string) {
    return this.http.post<Tokens>(`${this.baseUrl}/refresh`, {
      refreshToken,
    });
  }

  logout(userId: string) {
    return this.http.post(`${this.baseUrl}/logout`, { userId });
  }

  saveTokens(tokens: Tokens) {
    this.tokens.setTokens(tokens);
  }

  clearTokens() {
    this.tokens.clear();
  }
}
