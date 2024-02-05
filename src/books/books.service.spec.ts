import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookDto } from './dto/create-book.dto';

describe('BooksService', () => {
    let service: BooksService;

    const mockRepository = {
        create: jest.fn().mockImplementation(dto => dto),
        save: jest.fn().mockImplementation(book => Promise.resolve({ id: 1, ...book })),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BooksService,
                {
                    provide: getRepositoryToken(Book),
                    useValue: mockRepository,
                }
            ],
        }).compile();

        service = module.get<BooksService>(BooksService);
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe("create", () => {
        const mockBook = {
            title: "Book Title",
            author: "Book author",
            publisher: "Book Publisher",
            year: "2000"
        }
        it('should create a new book and return that', async () => {
            expect(await service.create(mockBook)).toEqual({
                id: 1,
                ...mockBook
            });
            expect(mockRepository.create).toHaveBeenCalledWith(mockBook);
            expect(mockRepository.save).toHaveBeenCalledWith(mockBook);
        });

        it('should throw an error if creation fails', async () => {

            const mockError = new Error('Failed to create book');

            mockRepository.create.mockReturnValueOnce(mockBook);
            mockRepository.save.mockRejectedValueOnce(mockError);

            await expect(service.create(mockBook)).rejects.toThrowError(mockError);

            expect(mockRepository.create).toHaveBeenCalledWith(mockBook);
            expect(mockRepository.save).toHaveBeenCalledWith(mockBook);
        });

        it('should throw an error if the book already exists', async () => {
            const createBookDto: CreateBookDto = {
              title: 'Test Book',
              author: 'Test Author',
              publisher: 'Test Publisher',
              year: '2022',
            };

            (mockRepository.findOne as jest.Mock).mockResolvedValue(createBookDto);
      
            await expect(service.create(createBookDto)).rejects.toThrowError('This book exist in collection!');
          });
    });

    describe("findAll", () => {

        it('should return all books', async () => {
            const mockBooks: Book[] = [
                { id: 1, title: 'Book 1', author: 'Author 1', publisher: "Publisher 1", year: "2025" },
                { id: 2, title: 'Book 2', author: 'Author 2', publisher: "Publisher 2", year: "2025" },
            ];

            mockRepository.find.mockResolvedValueOnce(mockBooks);

            const result = await service.findAll();

            expect(result).toEqual(mockBooks);
            expect(mockRepository.find).toHaveBeenCalled();
        });

        it('should throw an error if finding books fails', async () => {
            const mockError = new Error('Failed to find books');

            // Mocking behavior of repository method
            mockRepository.find.mockRejectedValueOnce(mockError);

            await expect(service.findAll()).rejects.toThrowError(mockError);

            expect(mockRepository.find).toHaveBeenCalled();
        });
    })

    describe("findById", () => {
        it('should return the book with the specified id', async () => {
            const id = 1;
            const mockBook: Book = { id, title: 'Mock Book', author: 'Mock Author', publisher: "Mock Publisher", year: "1998" };
        
            mockRepository.findOne.mockResolvedValueOnce(mockBook);
        
            const result = await service.findOne(id);
        
            expect(result).toEqual(mockBook);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
          });
        
          it('should throw NotFoundException if the book with the specified id is not found', async () => {
            const id = 1;

            mockRepository.findOne.mockResolvedValueOnce(undefined);
        
            await expect(service.findOne(id)).rejects.toThrowError(NotFoundException);
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
          });
        
          it('should throw an error if an error occurs during book retrieval', async () => {
            const id = 1;
            const mockError = new Error('Failed to retrieve book');
        
            mockRepository.findOne.mockRejectedValueOnce(mockError);
        
            await expect(service.findOne(id)).rejects.toThrowError(mockError);
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
          });
    })

    describe("delete", () => {
        it('should remove the book with the specified id', async () => {
            const id = 1;
            const mockBook: Book = { id, title: 'Mock Book', author: 'Mock Author', publisher: "Mock Publisher", year: "1998" };
        
            mockRepository.findOne.mockResolvedValueOnce(mockBook);
            mockRepository.remove.mockResolvedValueOnce(mockBook);
        
            await service.remove(id);
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockBook);
          });
        
          it('should throw an HttpException with status NOT_FOUND if the book with the specified id is not found', async () => {
            const id = 1;
        
            mockRepository.findOne.mockResolvedValueOnce(undefined);
        
            await expect(service.remove(id)).rejects.toThrowError(new HttpException(
              { success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND
            ));
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(mockRepository.remove).not.toHaveBeenCalled();
          });
        
          it('should throw an error if an error occurs during book removal', async () => {
            const id = 1;
            const mockBook: Book = { id, title: 'Mock Book', author: 'Mock Author', publisher: "Mock Publisher", year: "1998" };
            const mockError = new Error('Failed to remove book');
        
            mockRepository.findOne.mockResolvedValueOnce(mockBook);
            mockRepository.remove.mockRejectedValueOnce(mockError);
        
            await expect(service.remove(id)).rejects.toThrowError(mockError);
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockBook);
          });
    })

    describe("update by id", () => {
        it('should update the book with the specified id', async () => {
            const id = 1;
            const updateBookDto: UpdateBookDto = { title: 'Updated Title', author: 'Updated Author', publisher: "Publisher", year: "2000" };
            const mockBook: Book = { id, title: 'Mock Book', author: 'Mock Author', publisher: "Publisher", year: "2000" };
       
            mockRepository.findOne.mockResolvedValueOnce(mockBook);
            mockRepository.save.mockResolvedValueOnce({ ...mockBook, ...updateBookDto });
        
            const result = await service.update(id, updateBookDto);
        
            expect(result).toEqual({ ...mockBook, ...updateBookDto });
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(mockRepository.save).toHaveBeenCalledWith({ ...mockBook, ...updateBookDto });
          });
        
          it('should throw an HttpException with status NOT_FOUND if the book with the specified id is not found', async () => {
            const id = 1;
            const updateBookDto: UpdateBookDto = { title: 'Updated Title', author: 'Updated Author', publisher: "Publisher", year: "2000" };
        
            mockRepository.findOne.mockResolvedValueOnce(undefined);
        
            await expect(service.update(id, updateBookDto)).rejects.toThrowError(new HttpException(
              { success: false, message: 'Book not found!' }, HttpStatus.NOT_FOUND
            ));
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(mockRepository.save).not.toHaveBeenCalled();
          });
        
          it('should throw an error if an error occurs during book update', async () => {
            const id = 1;
            const updateBookDto: UpdateBookDto = { title: 'Updated Title', author: 'Updated Author', publisher: "Updated Publisher", year: "1998" };
            const mockBook: Book = { id, title: 'Mock Book', author: 'Mock Author',  publisher: "Mock Publisher", year: "1998" };
            const mockError = new Error('Failed to update book');
        
            mockRepository.findOne.mockResolvedValueOnce(mockBook);
            mockRepository.save.mockRejectedValueOnce(mockError);
        
            await expect(service.update(id, updateBookDto)).rejects.toThrowError(mockError);
        
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(mockRepository.save).toHaveBeenCalledWith({ ...mockBook, ...updateBookDto });
          });
    })

});