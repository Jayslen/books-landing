import { Client } from '@notionhq/client'

export async function getContent({ secret, block_id }) {
  const notion = new Client({
    auth: secret,
  })

  const data = (await notion.blocks.children.list({block_id})).results
  const content = data.map((block) => {
    return block[block.type].rich_text[0]?.text.content
  })

  return content
}


