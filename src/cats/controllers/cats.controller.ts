import { multerOptions } from '../../common/utils/multer.options';
import { Cat } from '../cats.schema';
import { JwtAuthGuard } from '../../auth/jwt/jwt.guard';
import { LoginRequestDto } from '../../auth/dto/login.request.dto';
import { AuthService } from '../../auth/auth.service';
import { ReadOnlyCatDto } from '../dtos/cat.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UseFilters,
  Body,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { CatsService } from '../services/cats.service';
import { SuccessInterceptor } from '../../common/interceptors/success.interceptor';
import { HttpExceptionFilter } from '../../common/exceptions/http-exception.filter';
import { CatRequestDto } from '../dtos/cats.request.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentCat } from 'src/common/decorators/user.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('cats')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class CatsController {
  constructor(
    private readonly catsService: CatsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: '현재 고양이 가져오기' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getCurrentCat(@CurrentCat() cat: Cat) {
    return cat.readOnlyData;
  }

  @ApiOperation({ summary: '모든 고양이 가져오기' })
  @Get('all')
  getAllCat() {
    return this.catsService.getAllCat();
  }

  /* @ApiOperation({ summary: '고양이 하나 찾기' })
  @Get(':id')
  getOneCat(@Param('id', ParseIntPipe) param) {
    console.log(param);
    return 'one cat';
  }

  @ApiOperation({ summary: '고양이 수정하기' })
  @Put(':id')
  updateCat() {
    return 'update cat';
  }

  @ApiOperation({ summary: '고양이 보내주기' })
  @Delete(':id')
  deleteCat() {
    return 'delete cat';
  } */

  @ApiResponse({
    status: 500,
    description: '서버 오류',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: ReadOnlyCatDto,
  })
  @ApiOperation({ summary: '고양이 가입' })
  @Post()
  async signUp(@Body() body: CatRequestDto) {
    return await this.catsService.signUp(body);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  logIn(@Body() data: LoginRequestDto) {
    return this.authService.jwtLogIn(data);
  }

  //로그아웃은 프론트에서 JWT 지우면 완성

  @ApiOperation({ summary: '고양이 이미지 업로드' })
  @UseInterceptors(FilesInterceptor('image', 10, multerOptions('cats')))
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  uploadCatImg(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentCat() cat: Cat,
  ) {
    console.log(files);

    //return { image: `http://localhost:PORT/media/cats/${files[0].filename}` };
    return this.catsService.uploadImg(cat, files);
  }
}
