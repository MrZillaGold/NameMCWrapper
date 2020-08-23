<p align="center">
  <img src="https://github.com/MrZillaGold/NameMCWrapper/raw/master/docs/logo.png" alt="...">
</p>

<p align="center"><b>NameMCWrapper</b></p>
<p align="center">ES6 основананная на Promise библиотека для NameMC.com</p>
<p align="center">
  <a href="https://github.com/MrZillaGold/NameMCWrapper/blob/master/docs/RU.md">Документация</a>
</p>

<p align="center">
 <a href="https://travis-ci.com/github/MrZillaGold/NameMCWrapper">
   <img src="https://api.travis-ci.com/MrZillaGold/NameMCWrapper.svg" alt="...">
 </a>
</p>

## Установка 📦
| Версия NodeJS  | Команда                     |
| -------------- | --------------------------- | 
| `>= 14.0.0`    | `npm i namemcwrapper`       |
| `<= 13.14.0`   | `npm i namemcwrapper@1.1.3` |

## Использование 🔧
```js
import { NameMC } from "namemcwrapper";

const nameMc = new NameMC();

nameMc.skinHistory("MrZillaGold")
    .then(skins => console.log(skins))
    .catch(error => console.log(error));
```

## Предупреждение ⚠
Так как NameMC не предоставляет открытое API, эта библиотека основана на парсе HTML страниц сайта. Если изменения будут затрагивать используемый дла парса HTML, библиотека может сломаться в любой момент и не давать ожидаемый результат. Я буду стараться обновлять ее как можно скорее. Используйте на свой страх и риск!
