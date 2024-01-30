import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'books' })

export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    author: string;

    @Column()
    publisher: string;

    @Column()
    year: string;
}
