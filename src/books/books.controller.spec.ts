import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    create: jest.fn(dto => {
      return {
        id: 1,
        ...dto
      }
    }),
    findAll: jest.fn().mockResolvedValue([
      { id: 1, title: 'Book 1', author: 'Book Author 1', publisher: 'Publisher 1', year: '2000' },
      { id: 2, title: 'Book 2', author: 'Book Author 2', publisher: 'Publisher 2', year: '2001' }
    ]),    
    findOne: jest.fn(),
    remove: jest.fn(),
    update: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService],
    }).overrideProvider(BooksService).useValue(mockBooksService).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("create book", () => {
    it('should create a book successfully', async () => {
      const createdBook: CreateBookDto = { title: "title", author: "Mee", publisher: "Publisher", year: "2003" };
      const result = await controller.create(createdBook);

      expect(result.data).toEqual({
        id: 1,
        ...createdBook
      });
    });

    it('should handle other errors correctly', async () => {
      const createBookDto = new CreateBookDto();

      jest.spyOn(service, 'create').mockRejectedValue({ status: 500 });

      await expect(controller.create(createBookDto)).rejects.toThrowError(
        new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should handle 400 error correctly', async () => {
      const createBookDto = new CreateBookDto();

      jest.spyOn(service, 'create').mockRejectedValue({ status: 400, message: 'Bad request' });

      await expect(controller.create(createBookDto)).rejects.toThrowError(
        new HttpException({ success: false, message: 'Bad request' }, HttpStatus.BAD_REQUEST)
      );
    });

  })

  describe('find all books', () => {
    it('should fetch books successfully', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Book Author 1', publisher: 'Publisher 1', year: '2000' },
        { id: 2, title: 'Book 2', author: 'Book Author 2', publisher: 'Publisher 2', year: '2001' }
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(mockBooks);

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        data: mockBooks,
        message: 'Books fetched successfully!',
      });
    });


    it('should handle errors correctly', async () => {
      // Mock the service method to throw an error
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error('Some error'));

      await expect(controller.findAll()).rejects.toThrowError(
        new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  });

  describe('find book by id', () => {
    it('should return the book when found', async () => {
      const mockBook = {id: 1, title: 'Book 1', author: 'Book Author 1', publisher: 'Publisher 1', year: '2000'};
      
      jest.spyOn(service, 'findOne').mockResolvedValue(mockBook);

      const result = await controller.findOne("1");
      expect(result).toEqual({
        success: true,
        data: mockBook,
        message: 'Book fetched successfully!',
      });
    });

    it('should throw NotFoundException when book is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue({ status: 404 });
    
      await expect(controller.findOne("1")).rejects.toThrowError(
        new HttpException({ success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND)
      );
    });

    it('should handle errors correctly', async () => {

      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Some error'));

      await expect(controller.findOne("1")).rejects.toThrowError(
        new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });
  })

  describe('delete book by id', () => {
    it('should delete the book successfully', async () => {
      const mockBook = {id: 1, title: 'Book 1', author: 'Book Author 1', publisher: 'Publisher 1', year: '2000'};
      jest.spyOn(service, 'remove').mockResolvedValue(mockBook);

      const result = await controller.remove('1');

      expect(result).toEqual({
        success: true,
        data: mockBook,
        message: 'Book deleted successfully!',
      });
    });

    it('should throw an HttpException when an error occurs', async () => {
      const errorMessage = 'Some error';
      jest.spyOn(service, 'remove').mockRejectedValue(new Error(errorMessage));

      await expect(controller.remove('1')).rejects.toThrowError(
        new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should rethrow HttpException when an HttpException occurs', async () => {
      const httpException = new HttpException({ success: false, message: 'Custom error' }, HttpStatus.BAD_REQUEST);
      jest.spyOn(service, 'remove').mockRejectedValue(httpException);

      await expect(controller.remove('1')).rejects.toThrowError(httpException);
    });
  });

  describe('update book by id', () => {
    it('should update the book successfully', async () => {
      const mockUpdateBookDto = new UpdateBookDto();
      const mockBook = {id: 1, title: 'Book 1', author: 'Book Author 1', publisher: 'Publisher 1', year: '2000'};
      jest.spyOn(service, 'update').mockResolvedValue(mockBook);

      const result = await controller.update('1', mockUpdateBookDto);

      expect(result).toEqual({
        success: true,
        data: mockBook,
        message: 'Book updated successfully!',
      });
    });

    it('should throw an HttpException when an error occurs', async () => {
      const errorMessage = 'Some error';
      const mockUpdateBookDto = new UpdateBookDto();
      jest.spyOn(service, 'update').mockRejectedValue(new Error(errorMessage));

      await expect(controller.update('1', mockUpdateBookDto)).rejects.toThrowError(
        new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR)
      );
    });

    it('should rethrow HttpException when an HttpException occurs', async () => {
      const httpException = new HttpException({ success: false, message: 'Custom error' }, HttpStatus.BAD_REQUEST);
      const mockUpdateBookDto = new UpdateBookDto();
      jest.spyOn(service, 'update').mockRejectedValue(httpException);

      await expect(controller.update('1', mockUpdateBookDto)).rejects.toThrowError(httpException);
    });
  });
});
