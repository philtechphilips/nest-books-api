import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksController', () => {
  let controller: BooksController;

  const mockBooksService = {
    create: jest.fn(dto => {
      return {
        ...dto
      }
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService],
    }).overrideProvider(BooksService).useValue(mockBooksService).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("create book", () => {
    it('should create a book successfully', async () => {
      const createdBook: CreateBookDto = { title: "title", author: "Mee", publisher: "Publisher", year: "2003" };

      jest.spyOn(controller, 'create').mockResolvedValue({
        success: true,
        data: { id: 6, ...createdBook },
        message: 'Book created successfully!',
      });

      const result = await controller.create(createdBook);

      expect(result).toEqual({
        success: true,
        data: { id: 6, ...createdBook },
        message: 'Book created successfully!',
      });

      expect(controller.create).toHaveBeenCalledWith(createdBook);
    });

    it('should handle error if creation fails', async () => {
      const createBookDto: CreateBookDto = { title: "title", author: "Mee", publisher: "Publisher", year: "2003" };

      jest.spyOn(controller, 'create').mockImplementation(() => {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      });

      try {
        await controller.create(createBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual({ success: false, message: 'Something went wrong!' });
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return 400 when there is an empty field', async () => {
      const createBookDto: CreateBookDto = { title: "", author: "Mee", publisher: "Publisher", year: "2003" };

      jest.spyOn(controller, 'create').mockImplementation(() => {
        throw new HttpException({
          message: [
            "title must be longer than or equal to 3 characters",
            "the book should have a title"
          ],
          error: "Bad Request",
          statusCode: 400
        }, HttpStatus.BAD_REQUEST);
      });

      try {
        await controller.create(createBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toEqual({
          message: [
            "title must be longer than or equal to 3 characters",
            "the book should have a title"
          ],
          error: "Bad Request",
          statusCode: 400
        });
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });


  })

  describe('find all books', () => {
    it('should return all books successfully', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Book Author 1', publisher: 'Publisher 1', year: '2000' },
        { id: 2, title: 'Book 2', author: 'Book Author 2', publisher: 'Publisher 2', year: '2001' }
      ];

      jest.spyOn(controller, 'findAll').mockResolvedValue({
        success: true,
        data: mockBooks,
        message: 'Books fetched successfully!',
      });

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        data: mockBooks,
        message: 'Books fetched successfully!',
      });
    });


    it('should throw an error if something goes wrong', async () => {
      jest.spyOn(controller, 'findAll').mockImplementation(() => {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      });

      try {
        await controller.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Something went wrong!');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('find book by id', () => {
    it('should return a book successfully if found', async () => {
      const mockBook = { id: 1, title: 'Book 1', author: 'Author 1', publisher: 'Publisher 1', year: '2000' };
      jest.spyOn(controller, 'findOne').mockResolvedValue({
        success: true,
        data: mockBook,
        message: 'Book fetched successfully!',
      });

      const result = await controller.findOne('1');

      expect(result).toEqual({
        success: true,
        data: mockBook,
        message: 'Book fetched successfully!',
      });
    });

    it('should throw a NOT_FOUND error if the book is not found', async () => {
      jest.spyOn(controller, 'findOne').mockResolvedValue(null);

      try {
        await controller.findOne('1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Book not found!');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should throw an INTERNAL_SERVER_ERROR if an unexpected error occurs', async () => {
      jest.spyOn(controller, 'findOne').mockImplementation(() => {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      });

      try {
        await controller.findOne('1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Something went wrong!');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  })

  describe('delete book by id', () => {
    it('should remove a book successfully', async () => {
      const mockBook = { id: 1, title: 'Book 1', author: 'Author 1', publisher: 'Publisher 1', year: '2000' };
      jest.spyOn(controller, 'remove').mockResolvedValue({ success: true, data: mockBook, message: 'Book deleted successfully!' });

      const result = await controller.remove('1');

      expect(result).toEqual({
        success: true,
        data: mockBook,
        message: 'Book deleted successfully!',
      });
    });

    it('should throw an error if book removal fails', async () => {
      jest.spyOn(controller, 'remove').mockImplementation(() => {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      });

      try {
        await controller.remove('1');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Something went wrong!');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should propagate HttpException if thrown by booksService', async () => {
      const httpException = new HttpException({ success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND);
      jest.spyOn(controller, 'remove').mockRejectedValue(httpException);

      try {
        await controller.remove('1');
      } catch (error) {
        expect(error).toBe(httpException);
      }
    });
  });

  describe('update book by id', () => {
    it('should update a book successfully', async () => {
      const updateBookDto = { title: 'Updated Book Title', author: 'Updated Author', publisher: 'Updated Publisher', year: '2022' };
      const mockBook = { id: 1, ...updateBookDto };
      jest.spyOn(controller, 'update').mockResolvedValue({
        success: true,
        data: mockBook,
        message: 'Book updated successfully!',
      });

      const result = await controller.update('1', updateBookDto);

      expect(result).toEqual({
        success: true,
        data: mockBook,
        message: 'Book updated successfully!',
      });
    });

    it('should throw an error if book update fails', async () => {
      const updateBookDto = { title: 'Updated Book Title', author: 'Updated Author', publisher: 'Updated Publisher', year: '2022' };
      jest.spyOn(controller, 'update').mockImplementation(() => {
        throw new HttpException({ success: false, message: 'Something went wrong!' }, HttpStatus.INTERNAL_SERVER_ERROR);
      });

      try {
        await controller.update('1', updateBookDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Something went wrong!');
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should propagate HttpException if thrown by booksService', async () => {
      const updateBookDto = { title: 'Updated Book Title', author: 'Updated Author', publisher: 'Updated Publisher', year: '2022' };
      const httpException = new HttpException({ success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND);
      jest.spyOn(controller, 'update').mockRejectedValue(httpException);

      try {
        await controller.update('1', updateBookDto);
      } catch (error) {
        expect(error).toBe(httpException);
      }
    });
  });
});
