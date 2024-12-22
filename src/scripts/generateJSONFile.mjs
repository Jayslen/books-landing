import { getBooksInfo } from './fetchBooks.js'
import { writeFile } from 'node:fs/promises'

const { books } = await getBooksInfo({
  genreId: process.env.GENRE_DATABASE_ID,
  authorId: process.env.AUTHOR_DATABASE_ID,
  booksId: process.env.BOOKS_DATABASE_ID,
  secret: process.env.NOTION_SECRET,
})

try {
  await writeFile('../mocks/normalized-data.json', JSON.stringify(books, null, 2), {
    encoding: 'utf-8',
  })
  console.log('File created successfully')
} catch (error) {
  console.error(error)
}
