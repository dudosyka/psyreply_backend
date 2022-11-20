import {Controller, Post} from '@nestjs/common';

@Controller('auth')
export class UserController {
    @Post('/')
    async firstStep() {

    }
}
