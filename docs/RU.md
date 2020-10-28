## Документация

<dl>
<dt><a href="#NameMC">NameMC(options);</a></dt>
<dd><p>Основной класс</p>
</dd>
<dt><a href="#getPlayerInfo">getPlayerInfo(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Получить информацию об игроке по никнейму</p>
</dd>
<dt><a href="#skinHistory">skinHistory(nickname, page)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Получить историю скинов по никнейму</p>
</dd>
<dt><a href="#getNicknameHistory">getNicknameHistory(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>История никнейма</p>
</dd>
<dt><a href="#getSkins">getSkins(tab, page, section)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Получить скины с определенной вкладки сайта</p>
</dd>
<dt><a href="#getCapes">getCapes(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Получить плащи игрока по никнейму</p>
</dd>
<dt><a href="#getRenders">getRenders(options)</a> ⇒ <code>Object</code>;</dt>
<dd><p>Получить рендеры скина</p>
</dd>
<dt><a href="#transformSkin">transformSkin(options)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Трансформировать скин</p>
</dd>
<dt><a href="#getCapeType">getCapeType(hash)</a> ⇒ <code>Object</code>;</dt>
<dd><p>Получить тип плаща по его хешу</p>
</dd>
<dt><a href="#getFriends">getFriends(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Получить друзей игрока по никнейму</p>
</dd>
</dl>

<a name="NameMC"></a>

## NameMC(options);
Основной класс

**Вид**: класс

| Параметры        | Тип      | По умолчанию   | Описание                           |
| ---------------- | -------- | -------------- | ---------------------------------- |
| options          | `Object` |                | Объект с параметрами для класса    |
| options.proxy    | `string` |                | Прокси для запросов                |
| options.endpoint | `string` | `"namemc.com"` | Конечная точка NameMC для запросов |

**Пример**:

```js
const nameMc = new NameMC({
    proxy: "https://cors-anywhere.herokuapp.com",
    endpoint: "ru.namemc.com"
});
```

<a name="getPlayerInfo"></a>

## getPlayerInfo(nickname) ⇒ <code>Promise</code>;
Получить информацию об игроке по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание объекта с информацией об игроке

| Параметры | Тип               | По умолчанию | Описание       |
| --------- | ----------------- | ------------ | -------------- |
| nickname  | `string`          |              | Никнейм игрока |

**Пример**:

```js
nameMc.getPlayerInfo("Qwennnn")
    .then((info) => console.log(info))
    .catch((error) => console.log(error));
```

<a name="skinHistory"></a>

## skinHistory(nickname) ⇒ <code>Promise</code>;
Получить историю скинов по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами скинов

| Параметры | Тип               | По умолчанию | Описание       |
| --------- | ----------------- | ------------ | -------------- |
| nickname  | `string`          |              | Никнейм игрока |
| page      | `number` `string` | 1            | Номер страницы |

**Пример**:

```js
nameMc.skinHistory("MrZillaGold", 2)
    .then((skins) => console.log(skins))
    .catch((error) => console.log(error));
```

<a name="getNicknameHistory"></a>

## getNicknameHistory(nickname) ⇒ <code>Promise</code>;
История никнейма

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с историей никнейма

| Параметры | Тип               | По умолчанию | Описание       |
| --------- | ----------------- | ------------ | -------------- |
| nickname  | `string`          |              | Никнейм игрока |

**Пример**:

```js
nameMc.getNicknameHistory("Dane4ka_")
    .then((history) => console.log(history))
    .catch((error) => console.log(error));
```

<a name="getSkins"></a>

## getSkins(tab, page, section)⇒ <code>Promise</code>;
Получить скины с определенной вкладки сайта

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами скинов

| Параметры | Тип                             | Описание                                                        |
| --------- | ------------------------------- | --------------------------------------------------------------- |
| tab       | `"trending"` `"new"` `"random"` | Вкладка с которой получить скины                                |
| page      | `number` `string`               | Страница вкладки (1 - 100)                                      |
| section   | `string`                        | Секция, используется при получении скинов из вкладки `trending` |

**Пример**:

```js
nameMc.getSkins("new", 2)
    .then((skins) => console.log(skins))
    .catch((error) => console.log(error));
```

<a name="getCapes"></a>

## getCapes(nickname) ⇒ <code>Promise</code>;
Получить плащи игрока по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами плащей

| Параметры | Тип      | Описание       |
| --------- | -------- | -------------- |
| nickname  | `string` | Никнейм игрока |

**Пример**:

```js
nameMc.skinHistory("Twennnn")
    .then((capes) => console.log(capes))
    .catch((error) => console.log(error));
```

<a name="getRenders"></a>

## getRenders(options) ⇒ <code>Object</code>;
Получить рендеры скина

**Вид**: глобальная функция

**Возвращает**: `Object` - Объект с рендерами скинов

| Параметры                                     | Тип                  | По умолчанию         | Описание                                                     |
| --------------------------------------------- | -------------------- | -------------------- | ------------------------------------------------------------ |
| options                                       | `Object`             |                      | Объект с параметрами для генерации рендеров                  |
| options.skin<span style="color:red;">*</span> | `string`             | `"12b92a9206470fe2"` | Хеш скина                                                    |
| options.model                                 | `"classic"` `"slim"` | `"classic"`          | Тип для модели со скином                                     |
| options.width                                 | `number` `string`    | `600`                | Ширина 3D рендера                                            |
| options.height                                | `number` `string`    | `300`                | Высота 3D рендера                                            |
| options.theta                                 | `number` `string`    | `-30`                | Угол для поворота 3D модели по горизонтали (-360 - 360)      |
| options.phi                                   | `number` `string`    | `20`                 | Угол для поворота 3D модели по вертикали (-360 - 360)        |
| options.time                                  | `number` `string`    | `90`                 | Время анимации 3D модели (0 - 360)                           |
| options.scale                                 | `number` `string`    | `4`                  | Маштаб для 2d рендера лица, 32 макс. (8px * маштаб)          |
| options.overlay                               | `boolean`            | `true`               | Использовать второй слой скина при генерации 2D рендера лица |

**Пример**:

```js
nameMc.getRenders({
    skin: "c178117c21bd0a1c",
    model: "slim"
})
    .then((renders) => console.log(renders))
    .catch((error) => console.log(error));
```

<a name="transformSkin"></a>

## transformSkin(options) ⇒ <code>Promise</code>;
Трансформировать скин

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание строки со ссылкой трансформированного скина

| Параметры                                | Тип                                                                                                                                                                                                                                      | Описание                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| options                                  | `Object`                                                                                                                                                                                                                                 | Объект с параметрами для трансформации скина |
| options.skin                             | `string`                                                                                                                                                                                                                                 | Хеш скина                                    |
| options.transformation                   | `"grayscale"` `"invert"` `"rotate-hue-180"` `"rotate-head-left"` `"rotate-head-right"` `"hat-pumpkin-mask-1"` `"hat-pumpkin-mask-2"` `"hat-pumpkin-mask-3"` `"hat-pumpkin-mask-4"` `"hat-pumpkin"` `"hat-pumpkin-creeper"` `"hat-santa"` | Тип трансформации                            |
| options.model                            | `"classic"` `"slim"`                                                                                                                                                                                                                     | Тип модели скина для рендеров                |

**Пример**:

```js
nameMc.transformSkin({
    skin: "c178117c21bd0a1c",
    transformation: "grayscale",
    model: "classic"
})
    .then((url) => console.log(url))
    .catch((error) => console.log(error));
```

<a name="getCapeType"></a>

## getCapeType(hash) ⇒ <code>Object</code>;
Получить тип плаща по его хешу

**Вид**: глобальная функция

**Возвращает**: `Object` - Объект с информацией о плаще

| Параметры | Тип      | Описание  |
| --------- | -------- | --------- |
| hash      | `string` | Хеш плаща |

**Пример**:

```js
nameMc.getCapeType("1981aad373fa9754")
    .then((cape) => console.log(cape))
    .catch((error) => console.log(error));
```

<a name="getFriends"></a>

## getFriends(nickname) ⇒ <code>Promise</code>;
Получить друзей игрока по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами друзей

| Параметры | Тип      | Описание        |
| --------- | -------- | --------------- |
| nickname  | `string` | Никнейм игрока  |

**Пример**:

```js
nameMc.getFriends("spoodov")
    .then((friends) => console.log(friends))
    .catch((error) => console.log(error));
```
