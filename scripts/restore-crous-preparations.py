import argparse, json, re, unicodedata, hashlib
from pathlib import Path
from difflib import SequenceMatcher
import pymupdf

def normalize(text):
    text = unicodedata.normalize('NFKD', text.lower().replace('œ','oe'))
    return re.sub(r'[^a-z0-9]+', ' ', ''.join(c for c in text if not unicodedata.combining(c))).strip()

def clean(text):
    text = re.sub(r'([\wÀ-ÿ])-\s*\n\s*([a-zà-ÿ])', r'\1\2', text)
    return re.sub(r'\s+', ' ', text.replace('\x07','')).strip()

parser = argparse.ArgumentParser(description='Restore Crous PDF columns without modifying any database.')
parser.add_argument('--source-dir', type=Path, required=True)
parser.add_argument('--catalog', type=Path, help='Optional read-only JSON export of recipes')
parser.add_argument('--output', type=Path, default=Path('lib/data/crous-preparations.json'))
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
if args.catalog:
    catalog = json.loads(args.catalog.read_text(encoding='utf8'))
else:
    existing = json.loads(args.output.read_text(encoding='utf8'))['recipes']
    catalog = [dict(id=id, nom=r['title'], portions=r.get('legacyPortions',''), source_pdf=r['sourcePdf'], source_page=r['sourcePage'], instructions=r['legacyInstructions'], ingredients=r.get('legacyIngredients', [])) for id,r in existing.items()]
pdfs = {}
corrections = {}
problems = []
report = []
for recipe in catalog:
    source = recipe['source_pdf']
    if not source: continue
    if source not in pdfs: pdfs[source] = pymupdf.open(args.source_dir / source)
    page_number = 13 if recipe['id']=='06988833c621' else recipe['source_page']
    page = pdfs[source][page_number-1]
    spans = [s for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans']]
    candidates = []
    for left, right in zip([30,190,346,503,659], [190,346,503,659,815]):
        column = [s for s in spans if left <= s['bbox'][0] < right]
        markers = sorted([s for s in column if re.match(r'^\s*\d+\s*[•·]',s['text'])], key=lambda s:s['bbox'][1])
        if not markers: continue
        portion_y = min([s['bbox'][1] for s in column if 'POUR ' in s['text']] or [200])
        title = clean(' '.join(s['text'] for s in sorted(column,key=lambda s:(round(s['bbox'][1]),s['bbox'][0])) if 70 <= s['bbox'][1] < portion_y and 'Olivita' in s['font'] and s['size'] >= 10 and not s['text'].strip().isdigit()))
        score = SequenceMatcher(None,normalize(recipe['nom']),normalize(title)).ratio()
        tip_y = min([s['bbox'][1] for s in column if len(s['text'].strip())>3 and 'ExtraBold' in s['font'] and s['size'] >= 7.9 and s['bbox'][1] > markers[-1]['bbox'][1]] or [560])
        instructions = []
        for index, marker in enumerate(markers):
            y0 = marker['bbox'][1]-1
            y1 = markers[index+1]['bbox'][1]-1 if index+1 < len(markers) else tip_y-1
            parts = [s for s in column if y0 <= s['bbox'][1] < y1 and 'Marianne' in s['font'] and 'ExtraBold' not in s['font']]
            lines=[]
            for s in sorted(parts,key=lambda s:(round(s['bbox'][1]),s['bbox'][0])):
                if lines and abs(s['bbox'][1]-lines[-1][0]) < 1: lines[-1][1].append(s)
                else: lines.append((s['bbox'][1],[s]))
            text=clean('\n'.join(' '.join(s['text'].strip() for s in sorted(line,key=lambda s:s['bbox'][0])) for _,line in lines))
            instructions.append(text)
        ingredient_text = page.get_text(clip=pymupdf.Rect(left, portion_y+13, right, markers[0]['bbox'][1]-1),sort=True)
        ingredients = [clean(item) for item in re.split(r'(?:^|\n)\s*[–−•]\s+',ingredient_text)[1:]]
        portions = clean(' '.join(s['text'] for s in column if portion_y <= s['bbox'][1] < portion_y+12))
        candidates.append((score,title,instructions,ingredients,portions))
    if not candidates:
        problems.append((recipe['id'],recipe['nom'],'no column')); continue
    score,title,instructions,ingredients,portions=max(candidates,key=lambda c:c[0])
    source_first = instructions[0]
    if (score < .65 and recipe['id']!='1e861f029668') or not all(instructions): problems.append((recipe['id'],recipe['nom'],score,title,instructions))
    correction={'title':recipe['nom'],'sourcePdf':source,'sourcePage':page_number,'legacyInstructions':recipe['instructions'],'instructions':instructions}
    if recipe['id'] in ['1e861f029668', 'c1409b27238d']:
        correction['correctedTitle'] = title
    # Small, explicit editorial changes make calendar leftovers usable alone.
    # The text recovered from the PDFs remains reproducible before these edits.
    if recipe['id'] == '0a47643ce4b2':
        instructions[0] = 'Éplucher et épépiner le butternut, puis couper la chair en dés. Cuire les dés dans une casserole d’eau frémissante jusqu’à ce qu’ils soient tendres, puis les égoutter. Les faire colorer dans une poêle chaude huilée et ajouter les herbes de Provence.'
    elif recipe['id'] == '70e98d59c105':
        instructions.insert(0, 'Si les lentilles sont sèches, les rincer puis les cuire dans une casserole d’eau selon le temps indiqué sur le paquet. Les égoutter et les laisser refroidir. Si elles sont en conserve, les rincer et les égoutter.')
        instructions[3] = instructions[3].replace('(cuites la veille)', 'cuites et refroidies')
    elif recipe['id'] == '6546f42653d8':
        instructions[0] = 'Laver et éplucher tous les légumes, y compris le demi-panais s’il est cru. Les couper en petits dés et les cuire dans une poêle huilée, en ajoutant un peu d’eau si nécessaire, jusqu’à ce qu’ils soient tendres. Si le demi-panais est déjà cuit, l’ajouter en fin de cuisson pour le réchauffer.'
    elif recipe['id'] == 'e530e7c0870f':
        instructions[1] = instructions[1].replace('(avec les restes du lundi)', 'coupé en petits morceaux, jusqu’à ce que les légumes soient tendres')
    elif recipe['id'] == 'fe3d8d576dcd':
        instructions[0] = instructions[0].replace('Mettre de côté ¼ des pommes de terre cuites pour la recette de vendredi. ', '')
    if recipe['id'] in ['0a47643ce4b2', '70e98d59c105', '6546f42653d8', 'e530e7c0870f', 'fe3d8d576dcd']:
        correction['editorialNote'] = 'Adaptation pour cuisiner ce plat indépendamment du calendrier et de ses restes.'
    for index, text in enumerate(instructions):
        subheading = re.search(r'\s+(Pour (?:l’escalope|le montage du burger)\s*:)\s*$', text)
        if subheading and index+1 < len(instructions):
            instructions[index] = text[:subheading.start()].strip()
            instructions[index+1] = subheading[1] + ' ' + instructions[index+1]
        if instructions[index] and not re.search(r'[.!?:»)]$', instructions[index]):
            instructions[index] += '.'
    legacy_first = normalize(recipe['instructions'][0])
    current_score=SequenceMatcher(None,legacy_first,normalize(source_first)).ratio()
    best_legacy=max(SequenceMatcher(None,legacy_first,normalize(c[2][0])).ratio() for c in candidates)
    if ((best_legacy>current_score+.2) or recipe['id']=='06988833c621') and recipe['ingredients']:
        correction['ingredients']=[{'name':item,'canonical':False} for item in ingredients]
        correction['legacyIngredients']=recipe['ingredients']
        correction['legacyPortions']=recipe.get('portions','')
        correction['portions']=portions
    corrections[recipe['id']]=correction
    report.append({'id':recipe['id'],'title':recipe['nom'],'pdfTitle':title,'score':round(score,2),'steps':instructions})
if problems:
    raise ValueError(json.dumps(problems, ensure_ascii=False))
result = {'sources': {name: hashlib.sha256((args.source_dir / name).read_bytes()).hexdigest() for name in sorted(pdfs)}, 'recipes': corrections}
output = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
if args.check:
    if args.output.read_text(encoding='utf8') != output:
        raise ValueError('PDF extraction differs from committed corrections')
else:
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(output, encoding='utf8')
print(f'PASS: {len(corrections)} recipes restored from {len(pdfs)} PDFs; no database modified.')
