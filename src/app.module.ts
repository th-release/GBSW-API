import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiController } from './api/api.controller';
import { ApiService } from './api/api.service';
import { AuthController } from './api/auth/auth.controller';
import { AuthService } from './api/auth/auth.service';
import { LaundryController } from './api/laundry/laundry.controller';
import { LaundryService } from './api/laundry/laundry.service';
import { EssController } from './api/ess/ess.controller';
import { EssService } from './api/ess/ess.service';

@Module({
  imports: [],
  controllers: [AppController, ApiController, AuthController, LaundryController, EssController],
  providers: [AppService, ApiService, AuthService, LaundryService, EssService],
})
export class AppModule {}
