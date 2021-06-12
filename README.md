<p align="center">
  <img src="https://github.com/MrZillaGold/NameMCWrapper/raw/master/docs/logo.png" alt="...">
</p>

<p align="center"><b>NameMCWrapper</b></p>
<p align="center">ES6 Promise based wrapper for NameMC.com</p>

| 📖 [Documentation](https://mrzillagold.github.io/NameMCWrapper/index.html) |
| ------------------------------------------------------------------------- |

<p align="center">
 <a href="https://travis-ci.com/github/MrZillaGold/NameMCWrapper">
   <img src="https://api.travis-ci.com/MrZillaGold/NameMCWrapper.svg" alt="">
 </a>
 <a href="https://wakatime.com/badge/github/MrZillaGold/NameMCWrapper">
   <img src="https://wakatime.com/badge/github/MrZillaGold/NameMCWrapper.svg" alt="">
 </a>
 <a href="https://discord.gg/99sV5b4RV3">
   <img src="https://img.shields.io/discord/714407016604369008.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2" alt="">
 </a>
</p>

## Install 📦
`npm i namemcwrapper`

## Usage 🔧
Check all available methods in [📖 Documentation](https://mrzillagold.github.io/NameMCWrapper/index.html).
```js
import { NameMC, API } from "namemcwrapper"; // ESM
// OR
const { NameMC, API } = require("namemcwrapper"); // CommonJS

const nameMc = new NameMC();

// Get player skin history
nameMc.skinHistory({ nickname: "MrZillaGold" })
    .then((skins) => console.log(skins))
    .catch((error) => console.log(error));

const api = new API();

// Get player friends from API
api.profile.friends({ 
    target: '2e9d9da1-97e9-4564-890b-6f056c4e372f'
});
```

## Warning ⚠
Since NameMC does not provide an open API, this library is based on the parsing of HTML site pages. If the changes affect the HTML used for parsing, the library may break at any time and not give the expected result. I will try to update it as soon as possible. Use at your own risk!
