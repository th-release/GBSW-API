import { Controller } from '@nestjs/common';
import { Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor (
    private readonly authService: AuthService,
  ) {}
  
  @Post('/ident')
  async getAuthorize(@Req() req: Request, @Res() res: Response) {
    return this.authService.getIdent(req, res);
  }

  @Post('/signin')
  async login(@Req() req: Request, @Res() res: Response) {
    return this.authService.login(req, res);
  }

  @Post('/signup')
  async signup(@Req() req: Request, @Res() res: Response) {
    return this.authService.signup(req, res);
  }
}
