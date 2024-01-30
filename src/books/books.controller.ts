import { Controller, Get, Post, Body, Param, Delete, Put, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createBookDto: CreateBookDto) {
    try {
      const book = await this.booksService.create(createBookDto);
      return { success: true, data: book, message: 'Book created successfully!' };
    } catch (error) {
      throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      const books = await this.booksService.findAll();
      return { success: true, data: books, message: 'Books fetched successfully!' };
    } catch (error) {
      throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const book = await this.booksService.findOne(+id);
      return { success: true, data: book, message: 'Book fetched successfully!' };
    } catch (error) {
      if (error.status === 404) {
        throw new HttpException({ success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    try {
      const book = await this.booksService.update(+id, updateBookDto);
      return { success: true, data: book, message: 'Book updated successfully!' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const book = await this.booksService.remove(+id);
      return { success: true, data: book, message: 'Book deleted successfully!' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

}
