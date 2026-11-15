import { NextResponse } from "next/server"
import { parseInstagramCaption } from "@/lib/ocr/parse"

export async function POST(request: Request) {
  const { caption } = await request.json() as { caption?: string }
  if (!caption?.trim()) {
    return NextResponse.json({ error: "Ajoutez la description de la publication." }, { status: 400 })
  }

  return NextResponse.json(parseInstagramCaption(caption.trim()))
}
