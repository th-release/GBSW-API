import { Injectable } from '@nestjs/common';

@Injectable()

export class ApiService {
  async getApiStatus() {
    return '<h2>API is running<br/><br/>Auth: ok<br/>Laundry: ok</h2>'
  }
}
