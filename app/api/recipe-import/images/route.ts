import { NextResponse } from "next/server"
import { readdir } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

const localImageDirectory = path.join(process.cwd(), "public", "assets", "recipe_images", "pexels")
const localImageUrlBase = "/assets/recipe_images/pexels"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

async function findLocalImages(query: string) {
  const tokens = normalize(query).split(" ").filter(token => token.length > 1)
  const files = (await readdir(localImageDirectory)).filter(file => /\.(jpe?g|png)$/i.test(file))

  return files
    .map(file => {
      const normalizedFilename = normalize(path.parse(file).name)
      const matchingTokens = tokens.filter(token => normalizedFilename.includes(token)).length
      return { file, matchingTokens }
    })
    .sort((a, b) => b.matchingTokens - a.matchingTokens || a.file.localeCompare(b.file, "fr"))
    .slice(0, 6)
    .map(({ file }, index) => ({
      id: `local-${index}-${file}`,
      alt: path.parse(file).name.replaceAll("-", " "),
      photographer: "Bibliothèque locale Pexels",
      photographer_url: "",
      url: `${localImageUrlBase}/${encodeURIComponent(file)}`,
      src: { large: `${localImageUrlBase}/${encodeURIComponent(file)}` },
    }))
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim()

  if (!query) return NextResponse.json({ error: "Ajoutez un nom de recette." }, { status: 400 })
  const photos = await findLocalImages(query)
  return NextResponse.json({ photos })
}
