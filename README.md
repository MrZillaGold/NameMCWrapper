<p align="center">
  <img src="https://github.com/MrZillaGold/NameMCWrapper/raw/master/.github/logo.png" alt="...">
</p>

<p align="center"><b>NameMCWrapper</b></p>
<p align="center">ES6 Promise based wrapper for NameMC.com</p>

| 📖 [Documentation](https://mrzillagold.github.io/NameMCWrapper/index.html) |
| ------------------------------------------------------------------------- |

<p align="center">
 <a href="https://npmjs.com/package/namemcwrapper">
   <img src="https://img.shields.io/npm/v/namemcwrapper?label=version&logo=npm&color=ligthgreen" alt="Version">
 </a>
 <a href="https://npmjs.com/package/namemcwrapper">
   <img src="https://img.shields.io/npm/dt/namemcwrapper?&logo=npm" alt="Version">
 </a>
 <a href="https://github.com/MrZillaGold/NameMCWrapper/actions/workflows/ci.yml">
   <img src="https://github.com/MrZillaGold/NameMCWRapper/actions/workflows/ci.yml/badge.svg" alt="Build Status">
 </a>
 <a href="https://wakatime.com/badge/github/MrZillaGold/NameMCWrapper">
   <img src="https://wakatime.com/badge/github/MrZillaGold/NameMCWrapper.svg" alt="WakaTime Stats">
 </a>
 <a href="https://discord.gg/99sV5b4RV3">
   <img src="https://img.shields.io/discord/714407016604369008.svg?label=&logo=discord&logoColor=ffffff&color=5865F2&labelColor=5865F2" alt="Discord Server">
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
    target: "2e9d9da1-97e9-4564-890b-6f056c4e372f"
});
```

## CloudFlare bypass ⚔
`Error: Request failed with status code 403`

NameMC often uses CloudFlare to protect against DDoS attacks.
If you want the library to work at such times, you need to deploy your own [`CloudProxy`](https://github.com/NoahCardoza/CloudProxy) instance.

NameMCWrapper fully supports [`CloudProxy`](https://github.com/NoahCardoza/CloudProxy).

```js
new NameMC({
    proxy: "http://192.168.1.51:25565/v1", // CloudProxy URL
    cloudProxy: {}
    // CloudProxy options.
    // Optional.
    // To enable CloudProxy support, you cannot delete an object!
});
```

## Warning ⚠
Since NameMC does not provide an open API, this library is based on the parsing of HTML site pages.
If the changes affect the HTML used for parsing, the library may break at any time and not give the expected result.
I will try to update it as soon as possible.
Use at your own risk!
