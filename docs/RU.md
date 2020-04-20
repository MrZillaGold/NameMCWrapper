## Документация

<dl>
<dt><a href="#setOptions">setOptions(options);</a></dt>
<dd><p>Установить опции</p>
</dd>
<dt><a href="#skinHistory">skinHistory(nickname)</a> ⇒ <code>Promise</code>;</dt>
<dd><p>Получить историю скинов по никнейму</p>
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

<a name="setOptions"></a>

## setOptions(options);
Установить опции

**Вид**: глобальная функция

| Параметры        | Тип      | По умолчанию   | Описание                           |
| ---------------- | -------- | -------------- | ---------------------------------- |
| options          | `Object` |                | Объект с параметрами для класса    |
| options.proxy    | `string` |                | Прокси для запросов                |
| options.endpoint | `string` | `"namemc.com"` | Конечная точка NameMC для запросов |

<a name="skinHistory"></a>

## skinHistory(nickname) ⇒ <code>Promise</code>;
Получить историю скинов по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами скинов

| Параметры | Тип      | Описание       |
| --------- | -------- | -------------- |
| nickname  | `string` | Никнейм игрока |

<a name="getCapes"></a>

## getCapes(nickname) ⇒ <code>Promise</code>;
Получить плащи игрока по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами плащей

| Параметры | Тип      | Описание       |
| --------- | -------- | -------------- |
| nickname  | `string` | Никнейм игрока |

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
| options.width                                 | `number` `string`    | `600`                | Ширина 3d рендера                                            |
| options.height                                | `number` `string`    | `300`                | Высота 3d рендера                                            |
| options.theta                                 | `number` `string`    | `-30`                | Угол для поворота 3d модели по кругу (-360 - 360)            |
| options.scale                                 | `number` `string`    | `4`                 | Маштаб для 2d рендера лица, 32 макс. (8px * маштаб)           |
| options.overlay                               | `boolean`            | `true`               | Использовать второй слой скина при генерации 2d рендера лица |

<a name="transformSkin"></a>

## transformSkin(options) ⇒ <code>Promise</code>;
Трансформировать скин

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание строки со ссылкой трансформированного скина

| Параметры                                | Тип                                                                                    | Описание                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| options                                  | `Object`                                                                               | Объект с параметрами для трансформации скина |
| options.skin                             | `string`                                                                               | Хеш скина                                    |
| options.transformation                   | `"grayscale"` `"invert"` `"rotate-hue-180"` `"rotate-head-left"` `"rotate-head-right"` | Тип трансформации                            |

<a name="getCapeType"></a>

## getCapeType(hash) ⇒ <code>Object</code>;
Получить тип плаща по его хешу

**Вид**: глобальная функция

**Возвращает**: `Object` - Объект с информацией о плаще

| Параметры | Тип      | Описание  |
| --------- | -------- | --------- |
| hash      | `string` | Хеш плаща |

<a name="getFriends"></a>

## getFriends(nickname) ⇒ <code>Promise</code>;
Получить друзей игрока по никнейму

**Вид**: глобальная функция

**Возвращает**: `Promise` - Обещание массива с объектами друзей

| Параметры | Тип      | Описание        |
| --------- | -------- | --------------- |
| nickname  | `string` | Никнейм игрока  |
