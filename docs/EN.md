## Documentation

<dl>
<dt><a href="#setOptions">setOptions(options);</a></dt>
<dd><p>Sets options</p>
</dd>
<dt><a href="#skinHistory">skinHistory(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Get skin history by nickname</p>
</dd>
<dt><a href="#getSkins">getSkins(tab, page, section)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Get skins from a specific tab of the site</p>
</dd>
<dt><a href="#getCapes">getCapes(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Get capes by nickname</p>
</dd>
<dt><a href="#getRenders">getRenders(options)</a> ⇒ <code>Object</code>;</dt>
<dd><p>Get skin renders</p>
</dd>
<dt><a href="#transformSkin">transformSkin(options)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Transform skin method</p>
</dd>
<dt><a href="#getCapeType">getCapeType(hash)</a> ⇒ <code>Object</code>;</dt>
<dd><p>Get cape type by cape hash</p>
</dd>
<dt><a href="#getFriends">getFriends(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Get player friends by nickname</p>
</dd>
</dl>

<a name="setOptions"></a>

## setOptions(options);
Sets options

**Kind**: global function

| Param              | Type     | Default        | Description                           |
| ------------------ | -------- | -------------- | ------------------------------------- |
| options            | `Object` |                | Object with parameters for the class  |
| options.proxy      | `string` |                | Proxy for requests                    |
| options.endpoint   | `string` | `"namemc.com"` | NameMC Endpoint                       |

**Example**:

```js
nameMc.setOptions({
    proxy: "https://cors-anywhere.herokuapp.com",
    endpoint: "ru.namemc.com"
});
```

<a name="skinHistory"></a>

## skinHistory(nickname) ⇒ `Promise`;
Get skin history by nickname

**Kind**: global function

**Returns**: `Promise` - Promise array with skins objects

| Param    | Type     | Description     |
| -------- | -------- | --------------- |
| nickname | `string` | Player nickname |

**Example**:

```js
nameMc.skinHistory("MrZillaGold")
    .then(skins => console.log(skins))
    .catch(error => console.log(error));
```

<a name="getSkins"></a>

## getSkins(tab, page, section)⇒ <code>Promise</code>;
Get skins from a specific tab of the site

**Kind**: global function

**Returns**: `Promise` - Promise array with skins objects

| Param   | Type                            | Description                                 |
| ------- | ------------------------------- | ------------------------------------------- |
| tab     | `"trending"` `"new"` `"random"` | Tab with which to get skins                 |
| page    | `number` `string`               | Tab page (1 - 100)                          |
| section | `string`                        | Section, used when getting `trending` skins |

**Example**:

```js
nameMc.getSkins("new", 2)
    .then(skins => console.log(skins))
    .catch(error => console.log(error));
```

<a name="getCapes"></a>

## getCapes(nickname) ⇒ `Promise`;
Get capes by nickname

**Kind**: global function

**Returns**: `Promise` - Promise array with capes objects

| Param    | Type     | Description     |
| -------- | -------- | --------------- |
| nickname | `string` | Player nickname |

**Example**:

```js
nameMc.skinHistory("Twennnn")
    .then(capes => console.log(capes))
    .catch(error => console.log(error));
```

<a name="getRenders"></a>

## getRenders(options) ⇒ `Object`;
Get skin renders

**Kind**: global function

**Returns**: `Object` - Object with renders skin

| Param                                         | Type                 | Default              | Description                                           |
| --------------------------------------------- | -----------------    | -------------------- | ----------------------------------------------------- |
| options                                       | `Object`             |                      | Object with parameters for generating renders         |
| options.skin<span style="color:red;">*</span> | `string`             | `"12b92a9206470fe2"` | Skin hash                                             |
| options.model                                 | `"classic"` `"slim"` | `"classic"`          | Skin type for model                                   |
| options.width                                 | `number` `string`    | `600`                | Width for 3d render image                             |
| options.height                                | `number` `string`    | `300`                | Height for 3d render image                            |
| options.theta                                 | `number` `string`    | `-30`                | Angle to rotate the 3d model in a circle (-360 - 360) |
| options.scale                                 | `number` `string`    | `4`                  | Scale for 2d face render, 32 max (8px * scale)        |
| options.overlay                               | `boolean`            | `true`               | Use skin overlay on 2d face render                    |

**Example**:

```js
nameMc.getRenders({
    skin: "c178117c21bd0a1c",
    model: "slim"
})
    .then(renders => console.log(renders))
    .catch(error => console.log(error));
```

<a name="transformSkin"></a>

## transformSkin(options) ⇒ `Promise`;
Transform skin method

**Kind**: global function

**Returns**: `Promise` - Promise url string on transformed skin

| Param                  | Type                                                                                                                                                                                                                                     | Description                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| options                | `Object`                                                                                                                                                                                                                                 | Object with parameters for skin transformation |
| options.skin           | `string`                                                                                                                                                                                                                                 | Skin hash                                      |
| options.transformation | `"grayscale"` `"invert"` `"rotate-hue-180"` `"rotate-head-left"` `"rotate-head-right"` `"hat-pumpkin-mask-1"` `"hat-pumpkin-mask-2"` `"hat-pumpkin-mask-3"` `"hat-pumpkin-mask-4"` `"hat-pumpkin"` `"hat-pumpkin-creeper"` `"hat-santa"` | Transformation type                            |

**Example**:

```js
nameMc.transformSkin({
    skin: "c178117c21bd0a1c",
    transformation: "grayscale"
})
    .then(url => console.log(url))
    .catch(error => console.log(error));
```

<a name="getCapeType"></a>

## getCapeType(hash) ⇒ `Object`;
Get cape type by cape hash

**Kind**: global function

**Returns**: `Object` - Object with cape information

| Param | Type     | Description |
| ----- | -------- | ----------- |
| hash  | `string` | Cape hash   |

**Example**:

```js
nameMc.getCapeType("1981aad373fa9754")
    .then(cape => console.log(cape))
    .catch(error => console.log(error));
```

<a name="getFriends"></a>

## getFriends(nickname) ⇒ `Promise`;
Get player friends by nickname

**Kind**: global function

**Returns**: `Promise` - Promise array with friends objects

| Param    | Type     | Description     |
| -------- | -------- | --------------- |
| nickname | `string` | Player nickname |

**Example**:

```js
nameMc.getFriends("spoodov")
    .then(cape => console.log(cape))
    .catch(error => console.log(error));
```
