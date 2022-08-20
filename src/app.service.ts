import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getList(): string {
    return '<h1>GBSW API</h1>';
  }
}
