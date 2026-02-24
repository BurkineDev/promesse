import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  // =====================
  // Helpers
  // =====================

  private async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 12);
  }

  private async signTokens(userId: string, email: string): Promise<Tokens> {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new UnauthorizedException("JWT secrets not configured");
    }

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: accessSecret,
        expiresIn: 60 * 15, // 15 minutes
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: refreshSecret,
        expiresIn: 60 * 60 * 24 * 7, // 7 days
      },
    );

    return { accessToken, refreshToken };
  }

  // =====================
  // Public methods
  // =====================

  async register(email: string, password: string): Promise<Tokens> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException("Email already in use");
    }

    const passwordHash = await this.hash(password);
    const user = await this.users.create(email, passwordHash);

    const tokens = await this.signTokens(user.id, user.email);

    const refreshTokenHash = await this.hash(tokens.refreshToken);
    await this.users.updateRefreshTokenHash(user.id, refreshTokenHash);

    return tokens;
  }

  async login(email: string, password: string): Promise<Tokens> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.signTokens(user.id, user.email);

    const refreshTokenHash = await this.hash(tokens.refreshToken);
    await this.users.updateRefreshTokenHash(user.id, refreshTokenHash);

    return tokens;
  }

  // =====================
  // REFRESH (Secure Version)
  // =====================

  async refresh(refreshToken: string): Promise<Tokens> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
      throw new UnauthorizedException("JWT secret not configured");
    }

    let payload: any;

    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const userId = payload.sub as string;

    const user = await this.users.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException("Access denied");
    }

    const refreshValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!refreshValid) {
      throw new UnauthorizedException("Access denied");
    }

    const tokens = await this.signTokens(user.id, user.email);

    const refreshTokenHash = await this.hash(tokens.refreshToken);
    await this.users.updateRefreshTokenHash(user.id, refreshTokenHash);

    return tokens;
  }

  // =====================
  // LOGOUT
  // =====================

  async logout(userId: string) {
    await this.users.updateRefreshTokenHash(userId, null);
    return { success: true };
  }
}
