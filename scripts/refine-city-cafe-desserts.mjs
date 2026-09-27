import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const file = path.join(process.cwd(), "supabase", "new-import", "city-cafe-recipes-batch-10.json")
const recipes = JSON.parse(readFileSync(file, "utf8"))
const ingredient = (name, quantity, unit) => ({ name, quantity, unit, canonical: true })
const specs = {
  "city-cafe-cookies-au-toblerone": {
    description: "Cookies moelleux au beurre, garnis de morceaux de Toblerone fondants et de nougat aux amandes.",
    ingredients: [ingredient("Farine","180","g"),ingredient("Beurre","100","g mou"),ingredient("Sucre","70","g"),ingredient("Œufs","1","pièce"),ingredient("Toblerone","120","g concassé"),ingredient("Levure","1","c. à café"),ingredient("Sel et poivre","1","pincée")],
    instructions: ["Préchauffer le four à 180 °C et couvrir une plaque de papier cuisson.","Fouetter le beurre mou et le sucre 2 minutes. Incorporer l’œuf.","Mélanger la farine, la levure et une pincée de sel; les incorporer sans trop travailler la pâte.","Ajouter le Toblerone concassé, former 8 boules et les espacer sur la plaque.","Cuire 10 à 12 minutes: les bords doivent être pris et le centre encore tendre. Laisser reposer 10 minutes sur la plaque."],
    astuce: "Réserver quelques morceaux de Toblerone pour les déposer sur les cookies juste avant la cuisson."
  },
  "city-cafe-mousse-au-nutella-et-noisettes-caramelisees": {
    description: "Mousse aérienne au Nutella servie avec des noisettes enrobées d’un caramel blond.",
    ingredients: [ingredient("Nutella","180","g"),ingredient("Crème","25","cl très froide"),ingredient("Noisettes","50","g"),ingredient("Sucre","35","g"),ingredient("Sel et poivre","1","pincée")],
    instructions: ["Placer un saladier et les fouets au froid 10 minutes. Faire chauffer le Nutella quelques secondes pour l’assouplir, puis le laisser tiédir.","Fouetter la crème froide en chantilly souple. Incorporer d’abord une cuillerée de crème au Nutella, puis le reste délicatement à la spatule.","Répartir dans quatre verrines et réserver au réfrigérateur au moins 2 heures.","Torréfier les noisettes 5 minutes à sec. Faire fondre le sucre dans une petite casserole jusqu’à obtenir un caramel blond, ajouter les noisettes et mélanger.","Étaler sur du papier cuisson, laisser refroidir puis concasser. Parsemer sur les mousses au moment de servir."],
    astuce: "La mousse se prépare la veille; ajouter les noisettes caramélisées au dernier moment pour qu’elles restent croquantes."
  },
  "city-cafe-cookies-au-chocolat-et-noix-de-grenoble": {
    description: "Cookies au chocolat noir et aux éclats de noix de Grenoble, croustillants sur les bords et moelleux au centre.",
    ingredients: [ingredient("Farine","180","g"),ingredient("Beurre","100","g mou"),ingredient("Sucre","90","g"),ingredient("Œufs","1","pièce"),ingredient("Chocolat","100","g noir concassé"),ingredient("Noix","60","g"),ingredient("Levure","1","c. à café")],
    instructions: ["Préchauffer le four à 180 °C et tapisser une plaque de papier cuisson.","Crémer le beurre avec le sucre, incorporer l’œuf puis la farine et la levure.","Ajouter le chocolat concassé et les noix grossièrement hachées.","Former 8 boules, les déposer en les espaçant et les aplatir légèrement.","Cuire 10 à 12 minutes. Laisser refroidir 10 minutes sur la plaque avant de déplacer."],
    astuce: "Sortir les cookies quand leur centre paraît encore tendre: ils finiront de prendre en refroidissant."
  },
  "city-cafe-chocolat-liegeois": {
    description: "Crème chocolatée onctueuse refroidie, surmontée de glace vanille et de crème fouettée.",
    ingredients: [ingredient("Lait","40","cl"),ingredient("Chocolat","80","g noir"),ingredient("Sucre","25","g"),ingredient("Maïzena","12","g"),ingredient("Crème glacée","2","boules vanille"),ingredient("Crème","10","cl entière froide")],
    instructions: ["Délayer la Maïzena et le sucre dans un peu de lait froid. Chauffer le reste du lait.","Ajouter le chocolat haché au lait chaud et remuer jusqu’à fonte. Verser le mélange de Maïzena en fouettant.","Cuire à feu moyen 2 à 3 minutes jusqu’à épaississement. Répartir dans deux verres et réfrigérer au moins 2 heures.","Fouetter la crème froide en chantilly. Déposer une boule de glace vanille sur chaque crème chocolatée puis ajouter la chantilly.","Servir immédiatement, éventuellement avec des copeaux de chocolat."],
    astuce: "Refroidir les crèmes avant d’ajouter la glace pour éviter qu’elle ne fonde au dressage."
  },
  "city-cafe-cookies-aux-abricots-et-flocons-d-avoine": {
    description: "Cookies rustiques aux flocons d’avoine et aux morceaux d’abricot moelleux.",
    ingredients: [ingredient("Flocons d’avoine","120","g"),ingredient("Farine","100","g"),ingredient("Beurre","90","g mou"),ingredient("Sucre","70","g"),ingredient("Œufs","1","pièce"),ingredient("Abricots","100","g secs en dés"),ingredient("Levure","1","c. à café")],
    instructions: ["Préchauffer le four à 180 °C et tapisser une plaque de papier cuisson.","Mélanger le beurre mou et le sucre, puis incorporer l’œuf.","Ajouter farine, flocons d’avoine et levure; mélanger juste assez pour obtenir une pâte épaisse.","Couper les abricots secs en dés et les incorporer. Former 8 cookies et les déposer sur la plaque.","Cuire 12 à 14 minutes jusqu’à légère coloration des bords. Laisser refroidir sur la plaque."],
    astuce: "Si les abricots secs sont fermes, les réhydrater 10 minutes dans de l’eau tiède puis bien les sécher."
  },
  "city-cafe-creme-caramel": {
    description: "Crème prise aux œufs nappée d’un caramel ambré, cuite doucement au bain-marie.",
    ingredients: [ingredient("Œufs","3","pièces"),ingredient("Lait","50","cl"),ingredient("Sucre","110","g"),ingredient("Vanille","1","gousse"),ingredient("Eau","2","c. à soupe")],
    instructions: ["Préchauffer le four à 160 °C. Faire fondre 60 g de sucre avec l’eau dans une casserole sans remuer jusqu’à obtenir un caramel ambré.","Répartir le caramel dans quatre ramequins et laisser durcir.","Chauffer le lait avec la vanille. Fouetter les œufs avec les 50 g de sucre restants sans faire mousser, puis verser le lait chaud en filet.","Filtrer l’appareil dans les ramequins. Les poser dans un plat et verser de l’eau chaude à mi-hauteur.","Cuire au bain-marie 35 à 40 minutes, jusqu’à ce que les crèmes soient prises mais encore légèrement tremblotantes. Refroidir puis réfrigérer 4 heures avant de démouler."],
    astuce: "Passer la lame d’un couteau autour des ramequins et les tremper quelques secondes dans l’eau chaude pour faciliter le démoulage."
  },
  "city-cafe-cookies-au-kinder-maxi": {
    description: "Cookies moelleux ponctués de morceaux fondants de Kinder Maxi au lait et au chocolat.",
    ingredients: [ingredient("Farine","180","g"),ingredient("Beurre","100","g mou"),ingredient("Sucre","70","g"),ingredient("Œufs","1","pièce"),ingredient("Kinder Maxi","120","g en morceaux"),ingredient("Levure","1","c. à café")],
    instructions: ["Préchauffer le four à 180 °C et couvrir une plaque de papier cuisson.","Fouetter le beurre mou avec le sucre, puis incorporer l’œuf.","Ajouter la farine et la levure. Mélanger brièvement puis incorporer les morceaux de Kinder Maxi.","Former 8 boules espacées sur la plaque et les aplatir légèrement.","Cuire 10 à 12 minutes jusqu’à ce que les bords soient dorés. Laisser reposer avant de servir."],
    astuce: "Réserver les morceaux de chocolat au frais jusqu’au montage pour qu’ils gardent leur forme à la cuisson."
  },
  "city-cafe-clafoutis-aux-abricots": {
    description: "Clafoutis tendre aux abricots frais, dans un appareil léger à base d’œufs et de lait.",
    ingredients: [ingredient("Abricots","450","g dénoyautés"),ingredient("Œufs","3","pièces"),ingredient("Farine","90","g"),ingredient("Sucre","70","g"),ingredient("Lait","25","cl"),ingredient("Beurre","20","g pour le moule"),ingredient("Vanille","1","c. à café")],
    instructions: ["Préchauffer le four à 180 °C et beurrer un plat de 24 cm.","Laver, sécher, dénoyauter les abricots et les couper en quartiers. Les répartir dans le plat.","Fouetter les œufs et le sucre. Ajouter la farine, puis le lait et la vanille en fouettant pour éviter les grumeaux.","Verser l’appareil sur les abricots et enfourner 35 à 40 minutes, jusqu’à ce que le centre soit pris et le dessus doré.","Laisser tiédir 15 minutes avant de servir."],
    astuce: "Choisir des abricots mûrs mais encore fermes afin qu’ils gardent leur tenue à la cuisson."
  },
  "city-cafe-cookies-au-cafe-et-chocolat": {
    description: "Cookies au café espresso et au chocolat noir, avec une pâte riche et légèrement amère.",
    ingredients: [ingredient("Farine","180","g"),ingredient("Beurre","100","g mou"),ingredient("Sucre","85","g"),ingredient("Œufs","1","pièce"),ingredient("Chocolat","100","g noir"),ingredient("Café","2","c. à café espresso refroidi"),ingredient("Levure","1","c. à café")],
    instructions: ["Préchauffer le four à 180 °C et tapisser une plaque de papier cuisson.","Crémer le beurre et le sucre. Incorporer l’œuf et le café refroidi.","Ajouter la farine et la levure, puis le chocolat concassé.","Former 8 boules, les espacer sur la plaque et les aplatir légèrement.","Cuire 10 à 12 minutes. Laisser refroidir sur la plaque pour que le centre se raffermisse."],
    astuce: "Un espresso serré refroidi apporte plus de goût sans détendre la pâte comme le ferait un grand café."
  },
  "city-cafe-galette-des-rois": {
    description: "Galette dorée garnie d’une frangipane aux amandes, assemblée avec une pâte feuilletée du commerce.",
    ingredients: [ingredient("Pâte feuilletée","2","rouleaux ronds"),ingredient("Amandes","125","g poudre"),ingredient("Beurre","100","g mou"),ingredient("Sucre","100","g"),ingredient("Œufs","2","pièces"),ingredient("Vanille","1","c. à café"),ingredient("Lait","1","c. à soupe pour la dorure")],
    instructions: ["Préchauffer le four à 190 °C. Fouetter le beurre et le sucre, puis incorporer la poudre d’amandes, un œuf et la vanille.","Dérouler un disque de pâte sur une plaque. Étaler la frangipane au centre en laissant une bordure de 2 cm; placer une fève si souhaité.","Humidifier la bordure, couvrir du second disque et souder soigneusement. Dessiner des motifs sans percer la pâte.","Dorer avec le second œuf battu avec le lait, puis réfrigérer 15 minutes pour raffermir la pâte.","Dorer une seconde fois et cuire 30 à 35 minutes jusqu’à ce que la galette soit bien gonflée et dorée. Laisser tiédir avant de couper."],
    astuce: "Une pâte feuilletée pur beurre du commerce donne un résultat régulier sans exiger le tourage à la maison."
  },
  "city-cafe-cookies-aux-cranberries-et-chocolat-blanc": {
    description: "Cookies doux au chocolat blanc, équilibrés par l’acidité des cranberries séchées.",
    ingredients: [ingredient("Farine","180","g"),ingredient("Beurre","100","g mou"),ingredient("Sucre","75","g"),ingredient("Œufs","1","pièce"),ingredient("Chocolat blanc","100","g"),ingredient("Cranberries séchées","70","g"),ingredient("Levure","1","c. à café")],
    instructions: ["Préchauffer le four à 180 °C et tapisser une plaque de papier cuisson.","Crémer le beurre et le sucre, puis incorporer l’œuf.","Mélanger la farine et la levure, les ajouter à la pâte, puis incorporer le chocolat blanc en morceaux et les cranberries.","Former 8 boules espacées sur la plaque et les aplatir légèrement.","Cuire 10 à 12 minutes jusqu’à légère coloration des bords. Laisser refroidir sur la plaque."],
    astuce: "Si les cranberries sont très sèches, les faire tremper 5 minutes puis les sécher soigneusement."
  },
  "city-cafe-riz-au-lait-et-gel-de-citron-vert": {
    description: "Riz au lait crémeux refroidi, accompagné d’un gel acidulé au citron vert.",
    ingredients: [ingredient("Riz","120","g rond"),ingredient("Lait","75","cl"),ingredient("Sucre","90","g"),ingredient("Vanille","1","gousse"),ingredient("Citron vert","2","zestes et jus"),ingredient("Gélatine","2","g")],
    instructions: ["Rincer rapidement le riz. Le verser dans une casserole avec le lait et la vanille; cuire à feu très doux 35 à 40 minutes en remuant souvent.","Ajouter 65 g de sucre dans les 10 dernières minutes. Répartir le riz au lait dans quatre verrines et laisser refroidir.","Faire tremper la gélatine dans l’eau froide. Chauffer le jus et le zeste de citron vert avec 25 g de sucre et 2 c. à soupe d’eau.","Hors du feu, incorporer la gélatine essorée, mélanger puis laisser refroidir jusqu’à ce que le gel commence à épaissir.","Répartir le gel sur le riz au lait froid et réfrigérer au moins 1 heure avant de servir."],
    astuce: "Ne laissez pas le riz au lait sans surveillance: remuez fréquemment et ajoutez un peu de lait s’il épaissit trop."
  }
}

for (const recipe of recipes) {
  const spec = specs[recipe.id]
  if (!spec) continue
  Object.assign(recipe, spec)
  recipe.main_ingredients = recipe.ingredients.slice(0, 4).map(item => item.name.toLowerCase())
  recipe.equipment = /cookie/i.test(recipe.nom) ? ["four","plaque de cuisson","saladier","fouet"] : ["casserole","saladier","fouet","ramequins","four"]
  recipe.canonical_ingredients_status = "verified"
}
writeFileSync(file, `${JSON.stringify(recipes, null, 2)}\n`, "utf8")
console.log(`Refined ${Object.keys(specs).length} dessert recipes with recipe-specific ingredients and steps.`)
