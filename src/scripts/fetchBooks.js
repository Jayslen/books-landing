import { Client } from '@notionhq/client'

export async function getBooksInfo({genreId, authorId, booksId}) {
  const notion = new Client({
    auth: 'secret_Cqih0LjqUSfVFdJhoZN9qQn35FcGF3xIpjxaNFrIOzn',
  })
  const [allGenres, allAuthors, allBooks] = await Promise.all([
    notion.databases.query({ database_id: genreId }),
    notion.databases.query({ database_id: authorId }),
    notion.databases.query({ database_id: booksId }),
  ])
  try {
    const { booksGenres, booksAuthors } = {
      booksGenres: allGenres.results.map(({ properties, id }) => {
        return properties['Total books'].rollup.number > 0 && {
          name: properties.Name.title[0].plain_text,
          id,
        }
      }).filter((genre) => genre),
      booksAuthors: allAuthors.results.map(({ properties, id }) => {
        return {
          authorName: properties.Name.title[0].plain_text,
          image: properties.photo.files[0]?.name,
          id,
        }
      }),
    }

    const books = allBooks.results.map(({ properties }) => {
      return {
        bookTitle: properties.Name.title[0].plain_text,
        bookImage: properties.Cover.files[0].external.url,
        publishedDate: properties['Published Year'].number,
        dateStarted: properties['Date Started']?.date?.start,
        dateFinished: properties['Date Finished']?.date?.start,
        raiting: properties.Rating.select?.name,
        bookStatus: properties.Status.status.name,
        author: booksAuthors?.find(
          (author) => author.id === properties.Authors.relation[0].id
        ).authorName,
        synopsis: properties.Summary.rich_text[0].plain_text,
        opinion: properties.Opinion.rich_text[0]?.plain_text,
        pages: properties.Pages.number,
        pagesRead: properties['Pages Read'].number,
        genres: properties.Genres.relation.map((genre) => {
          return booksGenres.find((bookGenre) => bookGenre.id === genre.id).name
        }),
        epubLink: properties.Epub?.files[0]?.file?.url,
        epubTitle: properties.Epub?.files[0]?.name
      }
    })

    return {books, booksGenres}
  } catch (error) {
    console.error(error)
  }
}