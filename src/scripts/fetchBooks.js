import { Client } from '@notionhq/client'

export async function getBooksInfo({genreId, authorId, booksId, secret}) {
  const notion = new Client({
    auth: secret,
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

    const books = allBooks.results.map(({ properties,id }) => {
      return {
        id,
        bookTitle: properties.Name.title[0].plain_text,
        bookImage: properties.Cover.files[0].external.url,
        publishedDate: properties['Published Year']?.date?.start,
        dateStarted: properties['Date Started']?.date?.start,
        dateFinished: properties['Date Finished']?.date?.start,
        raiting: properties.Rating.select?.name,
        bookStatus: properties.Status.status.name,
        author: booksAuthors?.find(
          (author) => author.id === properties.Authors.relation[0].id
        ).authorName,
        synopsis: properties.Summary.rich_text[0].plain_text,
        opinion: properties.Opinion.checkbox,
        pages: properties.Pages.number,
        pagesRead: properties['Pages Read'].number,
        genres: properties.Genres.relation.map((genre) => {
          return booksGenres.find((bookGenre) => bookGenre.id === genre.id).name
        }),
      }
    }).sort((a, b) => {
      return new Date(a.publishedDate) - new Date(b.publishedDate)
    }).sort((a, b) => {
      return a.author.localeCompare(b.author)
    })

    return {books, booksGenres}
  } catch (error) {
    console.error(error)
  }
}

getBooksInfo({
  genreId: '0b424cbe27d7435ebe1e87f7bb9c747d',
  authorId: 'e91d6f0b69e64e3b86ef1e0f17de7c55',
  booksId: '0f220582bb9a44f19d8b18ae82b57ac9',
  secret: 'secret_Cqih0LjqUSfVFdJhoZN9qQn35FcGF3xIpjxaNFrIOzn'
}).then((data) => {
  console.log(data)
})
