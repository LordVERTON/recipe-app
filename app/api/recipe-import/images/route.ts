import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim()
  const apiKey = process.env.PEXELS_API_KEY

  if (!query) return NextResponse.json({ error: "Ajoutez un nom de recette." }, { status: 400 })
  if (!apiKey) return NextResponse.json({ error: "PEXELS_API_KEY est manquante." }, { status: 500 })

  const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape&locale=fr-FR`, {
    headers: { Authorization: apiKey },
    cache: "no-store",
  })

  if (!response.ok) return NextResponse.json({ error: "La recherche Pexels a échoué." }, { status: response.status })

  const data = await response.json() as { photos?: Array<{ id: number; alt: string; url: string; photographer: string; photographer_url: string; src: { large: string } }> }
  return NextResponse.json({ photos: data.photos ?? [] })
}
