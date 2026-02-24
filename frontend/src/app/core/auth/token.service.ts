import { Injectable } from '@angular/core';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable({ providedIn: 'root' })
export class TokenService {
  private ACCESS_KEY = 'accessToken';
  private REFRESH_KEY = 'refreshToken';

  setTokens(tokens: Tokens) {
    localStorage.setItem(this.ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_KEY, tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  clear() {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }
}

