import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LaundryService } from './laundry.service';

@Controller('api/laundry')
export class LaundryController {
  constructor (
    private readonly laundryService: LaundryService,
  ) {};

  @Get('/user/view')
  async userViewCommand(@Req() req: Request, @Res() res: Response) {
    return this.laundryService.userViewCommand(req, res);
  }

  @Post('/user/update')
  async userUpdateCommand(@Req() req: Request, @Res() res: Response) {
    return this.laundryService.userUpdateCommand(req, res);
  }

  @Get('/admin/view')
  async adminViewCommand(@Req() req: Request, @Res() res: Response) {
    return this.laundryService.adminViewCommand(req, res);
  }

  @Post('/admin/create')
  async adminCreateCommand(@Req() req: Request, @Res() res: Response) {
    return this.laundryService.adminCreateCommand(req, res);
  }

  @Post('/admin/update')
  async adminUpdateCommand(@Req() req: Request, @Res() res: Response) {
    return this.laundryService.adminUpdateCommand(req, res);
  }
}
