import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateBookDto {
    @IsString()
    @IsNotEmpty({ message: "the book should have a title"})
    @Length(3, 255)
    title: string;

    @IsString()
    @IsNotEmpty({ message: "the book should have an author"})
    @Length(3, 255)
    author: string;

    @IsString()
    @IsNotEmpty({ message: "the book should have a publisher"})
    @Length(3, 255)
    publisher: string;

    @IsString()
    @IsNotEmpty({ message: "the book should have a published year"})
    @Length(3, 255)
    year: string;
}
