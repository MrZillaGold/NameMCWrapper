<p align="center">
  <img src="https://github.com/MrZillaGold/NameMCWrapper/raw/master/docs/logo.png" alt="...">
</p>

<p align="center"><b>NameMCWrapper</b></p>
<p align="center">ES6 Promise библиотека для NameMC.com</p>
<p align="center">

  [Документация](RU.md)
</p>

<p align="center">
 <a href="https://travis-ci.com/github/MrZillaGold/NameMCWrapper">
   <img src="https://api.travis-ci.com/MrZillaGold/NameMCWrapper.svg" alt="...">
 </a>
</p>

## Установка 📦
`npm i namemcwrapper`

## Использование 🔧
```js
import { NameMC } from "namemcwrapper"; // ESM
// Или
const { NameMC } = require("namemcwrapper"); // CommonJS

const nameMc = new NameMC();

nameMc.skinHistory("MrZillaGold")
    .then((skins) => console.log(skins))
    .catch((error) => console.log(error));
```

## Предупреждение ⚠
Так как NameMC не предоставляет открытое API, эта библиотека основана на парсе HTML страниц сайта. Если изменения будут затрагивать используемый дла парса HTML, библиотека может сломаться в любой момент и не давать ожидаемый результат. Я буду стараться обновлять ее как можно скорее. Используйте на свой страх и риск!
