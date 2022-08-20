import { Controller } from '@nestjs/common';
import { Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';

import { EssService } from './ess.service';
@Controller('api/ess')
export class EssController {
  constructor (
    private readonly authService: EssService,
  ) {}
}
