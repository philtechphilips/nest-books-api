import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) { }

  async create(createBookDto: CreateBookDto) {
    try {
      const book = this.bookRepository.create(createBookDto);
      return await this.bookRepository.save(book);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.bookRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.bookRepository.findOne({ where: { id } });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      return book;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    try {
      const book = await this.bookRepository.findOne({ where: { id } });

      if (!book) {
        throw new HttpException({ success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND);
      }

      Object.assign(book, updateBookDto);

      return await this.bookRepository.save(book);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const book = await this.bookRepository.findOne({ where: { id } });

      if (!book) {
        throw new HttpException({ success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND);
      }

      return await this.bookRepository.remove(book);
    } catch (error) {
      throw error;
    }
  }

}
