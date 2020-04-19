<p align="center">
  <img src="https://github.com/MrZillaGold/NameMCWrapper/raw/master/docs/logo.png" alt="...">
</p>

<p align="center"><b>NameMCWrapper</b></p>
<p align="center">ES6 Promise based wrapper for NameMC.com</p>
<p align="center">
  <a href="https://github.com/MrZillaGold/NameMCWrapper/blob/master/docs/DOCS.md">Documentation</a>
</p>

<p align="center">
 <a href="https://travis-ci.com/github/MrZillaGold/NameMCWrapper">
   <img src="https://api.travis-ci.com/MrZillaGold/NameMCWrapper.svg" alt="...">
 </a>
</p>

<p align="center">This page is available in other languages:</p>
<p align="center">
  <a href="https://github.com/MrZillaGold/NameMCWrapper/blob/master/README_RU.md">🇷🇺</a>
</p>

## Install 📦
`npm i namemcwrapper`

## Use 🔧
```js
import { NameMC } from "namemcwrapper";

const nameMc = new NameMC();

nameMc.skinHistory("MrZillaGold")
    .then(skins => console.log(skins))
    .catch(error => console.log(error));
```

## Warning ⚠
Since NameMC does not provide an open API, this library is based on the parsing of HTML site pages. If the changes affect the HTML used for parsing, the library may break at any time and not give the expected result. I will try to update it as soon as possible. Use at your own risk!

