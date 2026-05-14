import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def column_index(cell_ref: str) -> int:
    letters = re.sub(r"[^A-Z]", "", cell_ref.upper())
    index = 0
    for letter in letters:
        index = index * 26 + ord(letter) - ord("A") + 1
    return index - 1


def shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    return ["".join(node.text or "" for node in item.iter(f"{NS}t")) for item in root.findall(f"{NS}si")]


def cell_value(cell: ET.Element, strings: list[str]):
    value = cell.find(f"{NS}v")
    if value is None:
      inline = cell.find(f"{NS}is")
      if inline is None:
        return None
      return "".join(node.text or "" for node in inline.iter(f"{NS}t"))
    text = value.text or ""
    if cell.get("t") == "s":
        return strings[int(text)]
    return text


def sheet_rows(archive: zipfile.ZipFile, sheet_path: str):
    strings = shared_strings(archive)
    root = ET.fromstring(archive.read(sheet_path))
    for row in root.iter(f"{NS}row"):
        values = []
        for cell in row.findall(f"{NS}c"):
            idx = column_index(cell.get("r", "A1"))
            while len(values) <= idx:
                values.append(None)
            values[idx] = cell_value(cell, strings)
        yield values


path = sys.argv[1]
with zipfile.ZipFile(path) as archive:
    for sheet_path in [name for name in archive.namelist() if name.startswith("xl/worksheets/sheet") and name.endswith(".xml")]:
        rows = []
        for row in sheet_rows(archive, sheet_path):
            rows.append(row)
            if len(rows) >= 5:
                break
        print(sheet_path)
        print(json.dumps(rows, ensure_ascii=False, indent=2)[:5000])
