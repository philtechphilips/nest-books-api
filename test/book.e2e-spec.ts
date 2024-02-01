import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BooksModule } from '../src/books/books.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../src/books/entities/book.entity';

describe('BookController (e2e)', () => {
    let app: INestApplication;

    const mockBooksRepository = {
        find: jest.fn().mockResolvedValue([
            { id: 1, title: 'Book 1', author: 'Author 1', publisher: 'Publisher 1', year: '2025' },
            { id: 2, title: 'Book 2', author: 'Author 2', publisher: 'Publisher 2', year: '2026' }
        ]),
        findOne: jest.fn().mockImplementation((id) => {
            const book = { id: 1, title: 'Book 1', author: 'Author 1', publisher: 'Publisher 1', year: '2025' };
            if (id == 1) {
                return Promise.resolve(book);
            } else {
                return Promise.resolve(book);
            }
        }),
        create: jest.fn().mockImplementation(dto => ({
            id: 1,
            ...dto
        })),
        save: jest.fn().mockImplementation(book => Promise.resolve({ id: 1, ...book })),
        remove: jest.fn().mockResolvedValue({
            id: 1,
            title: 'Book 1',
            author: 'Author 1',
            publisher: 'Publisher 1',
            year: '2025',
        }),
    };


    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [BooksModule],
        }).overrideProvider(getRepositoryToken(Book)).useValue(mockBooksRepository).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/books (POST)', () => {
        return request(app.getHttpServer())
            .post('/books')
            .send({
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                publisher: "Scribner",
                year: "2004"
            })
            .expect(201)
            .then((response) => {
                expect(response.body).toEqual({
                    success: true,
                    data: {
                        id: 1,
                        title: "The Great Gatsby",
                        author: "F. Scott Fitzgerald",
                        publisher: "Scribner",
                        year: "2004"
                    },
                    message: 'Book created successfully!',
                });
            });
    });

    it('/books (GET All BOOKS)', () => {
        return request(app.getHttpServer())
            .get('/books')
            .expect(200);
    });

    it('/books (GET A BOOK BY ID)', () => {
        return request(app.getHttpServer())
            .get('/books/1')
            .expect(200);
    });

    it('/books/:id (PUT) - Book Updated', async () => {
        const updateBookDto = {
            title: 'Updated Title',
            author: 'Updated Author',
            publisher: 'Updated Publisher',
            year: 'Updated Year',
        };

        const response = await request(app.getHttpServer())
            .put('/books/1')
            .send(updateBookDto)
            .expect(HttpStatus.OK);

        expect(response.body.success).toEqual(true);
        expect(response.body.data).toEqual({ id: 1, ...updateBookDto });
        expect(response.body.message).toEqual('Book updated successfully!');
    });

    it('/books (DELETE A BOOK BY ID)', () => {
        return request(app.getHttpServer())
            .delete('/books/1')
            .expect(200);
    });
});
