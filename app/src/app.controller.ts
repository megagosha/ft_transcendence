import { Controller, Get, Logger, Req, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthService } from "./auth/auth.service";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("yo")
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req): Promise<any> {
    return req.user;
  }
}
