import { NextResponse } from "next/server"

const ingredientHeading = /^(ingredients?|ingrédients?)\s*[:：]?$/i
const instructionHeading = /^(instructions?|préparation|etapes?|étapes?|méthode)\s*[:：]?$/i
const ignoredLine = /^(https?:\/\/|#|@[\w.]+|\*|\||---)/

function cleanLine(line: string) {
  return line
    .replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "")
    .replace(/\s+/g, " ")
    .trim()
}

function inferTitle(lines: string[]) {
  return lines.find(line => {
    const clean = cleanLine(line)
    return clean.length > 3 && clean.length < 90 && !ignoredLine.test(clean) && !ingredientHeading.test(clean) && !instructionHeading.test(clean)
  }) || "Nouvelle recette"
}

function parseCaption(caption: string) {
  const lines = caption.split(/\r?\n/).map(cleanLine).filter(Boolean)
  const ingredients: { name: string; quantity?: string }[] = []
  const instructions: string[] = []
  let section: "ingredients" | "instructions" | null = null

  for (const line of lines) {
    if (ingredientHeading.test(line)) {
      section = "ingredients"
      continue
    }
    if (instructionHeading.test(line)) {
      section = "instructions"
      continue
    }
    if (section === "ingredients" && !ignoredLine.test(line)) {
      const match = line.match(/^((?:\d+[\d.,/]*|une?|un|quelques?)\s*(?:g|kg|ml|cl|l|c\.?(?:à|a)\s*soupe|c\.?(?:à|a)\s*café|cuillères?[^ ]*)?)\s+(.+)$/i)
      ingredients.push(match ? { quantity: match[1], name: match[2] } : { name: line })
    }
    if (section === "instructions" && !ignoredLine.test(line)) {
      instructions.push(line)
    }
  }

  return {
    title: inferTitle(lines),
    ingredients,
    instructions,
    description: caption.slice(0, 500),
  }
}

export async function POST(request: Request) {
  const { caption } = await request.json() as { caption?: string }
  if (!caption?.trim()) {
    return NextResponse.json({ error: "Ajoutez la description de la publication." }, { status: 400 })
  }

  return NextResponse.json(parseCaption(caption.trim()))
}
