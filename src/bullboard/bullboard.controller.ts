import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('dashboard')
export class BullBoardController {
  @Get()
  async getDashboard(@Res() res: Response) {
    return res.redirect('/dashboard');
  }
}
