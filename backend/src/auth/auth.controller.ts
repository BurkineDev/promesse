import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

/* =======================
   DTOs
======================= */

class RegisterDto {
  email!: string;
  password!: string;
}

class LoginDto {
  email!: string;
  password!: string;
}

class RefreshDto {
  refreshToken!: string;
}

/* =======================
   Controller
======================= */

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /* ---------- REGISTER ---------- */

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  /* ---------- LOGIN ---------- */

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  /* ---------- ME (PROTECTED) ---------- */

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any) {
    return req.user; // { id, email }
  }

  /* ---------- REFRESH ---------- */

  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  /* ---------- LOGOUT ---------- */

  @Post("logout")
  logout(@Body() dto: { userId: string }) {
    return this.auth.logout(dto.userId);
  }
}
