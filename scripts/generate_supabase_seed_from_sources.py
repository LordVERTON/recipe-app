import json
import re
import sys
import unicodedata
import uuid
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
DEFAULT_XLSX = Path(r"c:\Users\verto\Documents\projet recettes\script-python\recettes_crous_supabase.xlsx")
DEFAULT_INGREDIENTS = Path(r"c:\Users\verto\Documents\projet recettes\script-python\ingredients.txt")


def repair_text(value):
    if value is None:
        return None
    text = str(value)
    replacements = {
        "Ã©": "é",
        "Ã¨": "è",
        "Ãª": "ê",
        "Ã«": "ë",
        "Ã ": "à",
        "Ã¢": "â",
        "Ã¹": "ù",
        "Ã»": "û",
        "Ã®": "î",
        "Ã¯": "ï",
        "Ã´": "ô",
        "Ã¶": "ö",
        "Ã§": "ç",
        "Ã‰": "É",
        "Ã€": "À",
        "Ã‡": "Ç",
        "Ãœ": "Ü",
        "Å“": "œ",
        "Å’": "Œ",
        "â€™": "’",
        "â€“": "–",
        "â€”": "—",
        "â€¦": "…",
        "â€œ": "“",
        "â€": "”",
        "Â½": "½",
        "Â°": "°",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    return text


def column_index(cell_ref):
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    index = 0
    for letter in letters:
        index = index * 26 + ord(letter) - ord("A") + 1
    return index - 1


def shared_strings(archive):
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return [repair_text("".join(node.text or "" for node in item.iter(f"{NS}t"))) for item in root.findall(f"{NS}si")]


def cell_value(cell, strings):
    value = cell.find(f"{NS}v")
    if value is None:
        inline = cell.find(f"{NS}is")
        if inline is None:
            return None
        return repair_text("".join(node.text or "" for node in inline.iter(f"{NS}t")))
    text = value.text or ""
    if cell.get("t") == "s":
        return strings[int(text)]
    return repair_text(text)


def sheet_rows(xlsx_path):
    with zipfile.ZipFile(xlsx_path) as archive:
        strings = shared_strings(archive)
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        for row in root.iter(f"{NS}row"):
            values = []
            for cell in row.findall(f"{NS}c"):
                idx = column_index(cell.get("r", "A1"))
                while len(values) <= idx:
                    values.append(None)
                values[idx] = cell_value(cell, strings)
            yield values


def parse_json_list(value):
    if not value:
        return []
    if isinstance(value, list):
        return value
    try:
        parsed = json.loads(value)
        if isinstance(parsed, list):
            return [repair_text(item) for item in parsed if item]
    except json.JSONDecodeError:
        pass
    return [repair_text(item.strip()) for item in re.split(r"\n|;", value) if item.strip()]


def bool_value(value):
    return str(value).strip().lower() in {"true", "1", "oui", "yes"}


def int_value(value):
    if value in (None, ""):
        return None
    try:
        return int(float(str(value)))
    except ValueError:
        return None


def slugify(value):
    normalized = unicodedata.normalize("NFD", value.lower())
    ascii_value = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    ascii_value = ascii_value.replace("œ", "oe").replace("&", " et ")
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", ascii_value))


def recipe_from_row(row):
    instructions = parse_json_list(row.get("instructions"))
    ingredients = [
        {"name": item, "canonical": True}
        for item in parse_json_list(row.get("ingredients"))
    ]
    image_url = f"/assets/recipe_images/pexels/{slugify(row['nom'])}.jpg"

    return {
        "id": row["id"],
        "nom": row["nom"],
        "description": None,
        "saison": row["saison"],
        "mois": row["mois"],
        "mois_numero": int_value(row["mois_numero"]) or 1,
        "semaine": int_value(row.get("semaine")),
        "jour": row.get("jour"),
        "tag": row["tag"],
        "categorie": row["categorie"],
        "theme_special": row.get("theme_special"),
        "portions": row.get("portions") or "1 personne",
        "estimated_time": None,
        "difficulty": None,
        "image_url": image_url,
        "ingredients": ingredients,
        "instructions": instructions,
        "astuce": row.get("astuce"),
        "cuisson_micro_ondes": bool_value(row.get("cuisson_micro_ondes")),
        "sans_four": bool_value(row.get("sans_four")),
        "source": "crous",
        "source_pdf": row.get("source_pdf"),
        "source_page": int_value(row.get("source_page")),
        "dietary_tags": [],
        "main_ingredients": [],
        "equipment": [],
        "canonical_ingredients_status": "verified",
    }


def read_recipes(xlsx_path):
    rows = list(sheet_rows(xlsx_path))
    headers = [repair_text(value) for value in rows[0]]
    recipes = []
    for values in rows[1:]:
        if not values or not values[0]:
            continue
        row = {headers[index]: repair_text(values[index]) if index < len(values) else None for index in range(len(headers))}
        recipes.append(recipe_from_row(row))
    return recipes


def parse_ingredients_file(path):
    current_category = None
    ingredients = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = repair_text(raw_line).strip()
        if line.startswith("## "):
            current_category = line.removeprefix("## ").strip()
            continue
        if not line.startswith("* ") or current_category is None:
            continue
        item = line.removeprefix("* ").strip()
        match = re.match(r"(.+?)\s*\*\((.+)\)\*", item)
        if match:
            name = match.group(1).strip()
            aliases = [alias.strip() for alias in match.group(2).split(",") if alias.strip()]
        else:
            name = item.strip()
            aliases = []
        ingredients[name.lower()] = {"name": name, "category": current_category, "aliases": aliases}
    return list(ingredients.values())


def sql_string(value):
    if value in (None, ""):
        return "null"
    return "'" + str(value).replace("'", "''") + "'"


def sql_number(value):
    return "null" if value is None else str(value)


def sql_bool(value):
    return "true" if value else "false"


def sql_json(value):
    return "'" + json.dumps(value or [], ensure_ascii=False).replace("'", "''") + "'::jsonb"


def sql_text_array(value):
    values = value or []
    if not values:
        return "'{}'::text[]"
    return "array[" + ", ".join(sql_string(item) for item in values) + "]::text[]"


def build_seed(recipes, ingredients):
    recipe_columns = [
        "id", "nom", "description", "saison", "mois", "mois_numero", "semaine", "jour",
        "tag", "categorie", "theme_special", "portions", "estimated_time", "difficulty",
        "image_url", "ingredients", "instructions", "astuce", "cuisson_micro_ondes",
        "sans_four", "source", "source_pdf", "source_page", "dietary_tags",
        "main_ingredients", "equipment", "canonical_ingredients_status",
    ]
    recipe_rows = []
    for recipe in recipes:
        recipe_rows.append("(" + ", ".join([
            sql_string(recipe["id"]),
            sql_string(recipe["nom"]),
            sql_string(recipe["description"]),
            sql_string(recipe["saison"]),
            sql_string(recipe["mois"]),
            sql_number(recipe["mois_numero"]),
            sql_number(recipe["semaine"]),
            sql_string(recipe["jour"]),
            sql_string(recipe["tag"]),
            sql_string(recipe["categorie"]),
            sql_string(recipe["theme_special"]),
            sql_string(recipe["portions"]),
            sql_number(recipe["estimated_time"]),
            sql_string(recipe["difficulty"]),
            sql_string(recipe["image_url"]),
            sql_json(recipe["ingredients"]),
            sql_json(recipe["instructions"]),
            sql_string(recipe["astuce"]),
            sql_bool(recipe["cuisson_micro_ondes"]),
            sql_bool(recipe["sans_four"]),
            sql_string(recipe["source"]),
            sql_string(recipe["source_pdf"]),
            sql_number(recipe["source_page"]),
            sql_text_array(recipe["dietary_tags"]),
            sql_text_array(recipe["main_ingredients"]),
            sql_text_array(recipe["equipment"]),
            sql_string(recipe["canonical_ingredients_status"]),
        ]) + ")")

    ingredient_rows = []
    for ingredient in ingredients:
        ingredient_rows.append("(" + ", ".join([
            sql_string(str(uuid.uuid5(uuid.NAMESPACE_URL, ingredient["name"].lower()))),
            sql_string(ingredient["name"]),
            sql_string(ingredient["category"]),
            sql_text_array(ingredient["aliases"]),
        ]) + ")")

    return f"""-- Generated from recettes_crous_supabase.xlsx and ingredients.txt.
begin;

truncate table public.recipes restart identity cascade;
truncate table public.ingredients restart identity cascade;

insert into public.recipes ({", ".join(recipe_columns)})
values
{",\n".join(recipe_rows)}
on conflict (id) do update set
  nom = excluded.nom,
  description = excluded.description,
  saison = excluded.saison,
  mois = excluded.mois,
  mois_numero = excluded.mois_numero,
  semaine = excluded.semaine,
  jour = excluded.jour,
  tag = excluded.tag,
  categorie = excluded.categorie,
  theme_special = excluded.theme_special,
  portions = excluded.portions,
  estimated_time = excluded.estimated_time,
  difficulty = excluded.difficulty,
  image_url = excluded.image_url,
  ingredients = excluded.ingredients,
  instructions = excluded.instructions,
  astuce = excluded.astuce,
  cuisson_micro_ondes = excluded.cuisson_micro_ondes,
  sans_four = excluded.sans_four,
  source = excluded.source,
  source_pdf = excluded.source_pdf,
  source_page = excluded.source_page,
  dietary_tags = excluded.dietary_tags,
  main_ingredients = excluded.main_ingredients,
  equipment = excluded.equipment,
  canonical_ingredients_status = excluded.canonical_ingredients_status;

insert into public.ingredients (id, name, category, aliases)
values
{",\n".join(ingredient_rows)}
on conflict (name) do update set
  category = excluded.category,
  aliases = excluded.aliases;

commit;
"""


def main():
    xlsx_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    ingredients_path = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_INGREDIENTS
    output_path = Path("supabase/seed.sql")
    recipes = read_recipes(xlsx_path)
    ingredients = parse_ingredients_file(ingredients_path)
    output_path.write_text(build_seed(recipes, ingredients), encoding="utf-8")
    print(f"Generated {output_path} with {len(recipes)} recipes and {len(ingredients)} ingredients.")


if __name__ == "__main__":
    main()
