# Источники и история методики

[Методика](workflow.ru.md) · [English](sources.en.md)

<a id="scope"></a>

## Область и способ исследования

Изучены все девять репозиториев из issue #8: их деревья, достижимая история Git, README и выбранные методические документы, схемы и исходники. Для каждого репозитория зафиксирован последний коммит основной ветки до **2026-09-05 06:42:43 UTC**, времени постановки задачи. Ссылки на файлы закреплены полным SHA; ветки могут впоследствии измениться.

Работа выполнена независимо от решений chips-howto #8, без подагентов. Основа ветки chips-howto — `a96d0b2f78975db32f33fc00f62c384ec6102f31` от 2023 года. Готовые тексты и сайт решения #8 не использовались.

История изучалась по журналам коммитов; выбранные вехи дополнительно сверены со списками изменённых файлов. Ниже описано, что видно в артефактах, а не предполагаемые мотивы авторов. Коммиты импорта не датируют начало исследования. Аппаратные модели и лабораторные процедуры в рамках подготовки руководства не выполнялись; большие внешние датасеты не скачивались. Существующие результаты моделирования явно приписаны источникам.

Общий маршрут и критерии перехода в методике — авторский синтез. Сходство проектов не превращает его в обязательный порядок для любой технологии. Практические допущения, неполнота источника и успешная проверка — разные статусы.

<a id="snapshots"></a>

## Зафиксированные версии

| Репозиторий | SHA исходного дерева | Основной вклад |
| --- | --- | --- |
| [breaks](#source-breaks) | [`a378efe01259735813a6edd3dd6090e27ee0ee32`](https://github.com/emu-russia/breaks/tree/a378efe01259735813a6edd3dd6090e27ee0ee32) | Транзисторы → логика → проверяемое описание |
| [SEGAChips](#source-segachips) | [`1b378b45c8f0a88501ba593cc480dc5159149a8d`](https://github.com/emu-russia/SEGAChips/tree/1b378b45c8f0a88501ba593cc480dc5159149a8d) | Выбор метода по устройству блока |
| [dmgcpu](#source-dmgcpu) | [`f0fbc8f293b1687d22cd157968a49cf6e3b13280`](https://github.com/emu-russia/dmgcpu/tree/f0fbc8f293b1687d22cd157968a49cf6e3b13280) | От кадров к нетлисту и поиску первой ошибки |
| [Deroute](#source-deroute) | [`86950a9466f6df8a60ac6c306f60cda4abdb07f0`](https://github.com/emu-russia/Deroute/tree/86950a9466f6df8a60ac6c306f60cda4abdb07f0) | Редактируемая связность и экспорт |
| [mappers](#source-mappers) | [`d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4`](https://github.com/emu-russia/mappers/tree/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4) | Компактный пример полного цикла |
| [SovietChips](#source-sovietchips) | [`2b64738d83768f9edce4935c2581f0002a4c49fa`](https://github.com/emu-russia/SovietChips/tree/2b64738d83768f9edce4935c2581f0002a4c49fa) | ВИ53: сравнение экземпляров и узкий эксперимент |
| [ula](#source-ula) | [`475d40245c478bda1a3a760b0e50be66f2f3f7ff`](https://github.com/emu-russia/ula/tree/475d40245c478bda1a3a760b0e50be66f2f3f7ff) | От плоской схемы к функциональным модулям |
| [psxcpu](#source-psxcpu) | [`df47207c9deed1e9e488c49b8b0c362813102863`](https://github.com/emu-russia/psxcpu/tree/df47207c9deed1e9e488c49b8b0c362813102863) | Большой чип: покрытия, библиотеки, полуавтоматическая трассировка |
| [Patterns](#source-patterns) | [`6dd2badffa8d5422da66b78d20b7330df30ec5c4`](https://github.com/emu-russia/Patterns/tree/6dd2badffa8d5422da66b78d20b7330df30ec5c4) | Распознавание типов до восстановления проводов |

<a id="source-breaks"></a>

## breaks — Транзисторы → логика → проверяемое описание

Исследование 6502, APU и PPU связывает фотографии, транзисторные схемы, логические схемы, HDL и документацию. [README][B1] заявляет завершение основных исследовательских целей, но отдельно предупреждает о различии версий Wiki и книг. [HDL][B3] сохраняет асинхронную структуру и не ставит целью синтез. Это образец цепочки представлений, а не доказательство готовности любого файла HDL.

**Что переносим в методику.** Повторяйте проверку после перехода между уровнями описания; ведите [таблицу соответствия сигналов][B5]. [Тест Klaus][B4] документирует модифицированный вектор сброса и адрес успешного завершения: даже известный тест требует точной конфигурации.

**Проверенные вехи истории:**

- 2012-08-03 · [`f60d4804`](https://github.com/emu-russia/breaks/commit/f60d48043643df510e9076f2a4b5aa6b0b4a8487) — Старт истории проекта.
- 2014-11-16 · [`ee95aec7`](https://github.com/emu-russia/breaks/commit/ee95aec722562ff5e47c26583acafb998cffc8d1) — Добавлено раннее представление 6502 на Verilog.
- 2023-05-21 · [`e04c404b`](https://github.com/emu-russia/breaks/commit/e04c404b3804cefec7943ed40f739e50ebe92e39) — Исправлено перепутывание LOOPMode и n_IRQEN в APU HDL; имена и полярности требуют проверки.
- 2023-09-19 · [`27e9010c`](https://github.com/emu-russia/breaks/commit/27e9010c933707bfd819e561dce99f192d508594) — Добавлены функциональные тесты Klaus в форматах для разных моделей.

<a id="source-segachips"></a>

## SEGAChips — Выбор метода по устройству блока

[Обзор][S1] охватывает несколько семейств и явно вводит master dataset, нетлист и Lambda. [Арбитр][S2] показывает восстановление типов ячеек по нижним слоям и портам верхнего металла. [Z80][S3] сочетает ручное описание межблочных шин с Deroute для доменов ячеек. Это не один завершённый реверс всех чипов: степень готовности различается по разделам.

**Что переносим в методику.** Разделяйте ревизии и библиотеки; применяйте гибридную трассировку там, где она сохраняет проверяемые связи. [ArbPatterns][S4] предупреждает, что переименование ячеек ломает старые workspace: база и разметка должны версионироваться вместе.

**Проверенные вехи истории:**

- 2022-06-25 · [`8e3f7686`](https://github.com/emu-russia/SEGAChips/commit/8e3f768697b8a940c079c118bd3d1bce31912075) — Создан первоначальный обзор.
- 2022-09-26 · [`bb1396da`](https://github.com/emu-russia/SEGAChips/commit/bb1396da7a5f1630c3e544d7990164b45dc24cbd) — Появился HDL верхней части Z80.
- 2026-07-24 · [`5342cf38`](https://github.com/emu-russia/SEGAChips/commit/5342cf389d4bfa4e3f8d7b16de8ec2609f37b13a) — В Logisim-проект внесено изменение с пометкой NMOS WIP; это не свидетельство завершения всего Z80.

<a id="source-dmgcpu"></a>

## dmgcpu — От кадров к нетлисту и поиску первой ошибки

[Методы][D1] описывают съёмку, сшивку и разметку, [датасеты][D2] различают ревизии SoC и сеансы получения изображений SM83, [netlist][D3] пошагово показывает восстановление одного блока. [Icarus workflow][D5] содержит команды, тестовые ROM, FST и сравнение с эталонным трейсом. Тесты ядра с имитированным окружением не равны проверке всего Game Boy.

**Что переносим в методику.** Используйте небольшой блок как единицу полного цикла. Читайте [investigation][D4] с учётом зачёркнутых гипотез: случай RET закончился восстановлением пропущенной защёлки, а не подбором задержки. Описания физической обработки не используются здесь как инструкция по безопасности.

**Проверенные вехи истории:**

- 2022-09-14 · [`6594c193`](https://github.com/emu-russia/dmgcpu/commit/6594c19386330c721af5e2d460a4a8af0876f732) — Первые рабочие файлы нетлиста.
- 2022-09-16 · [`a67626f1`](https://github.com/emu-russia/dmgcpu/commit/a67626f1705c2efbdb10e241fc78e814d8db2b2f) — Добавлено описание методов и иллюстрации подготовки снимков.
- 2025-01-02 · [`fd00d0b4`](https://github.com/emu-russia/dmgcpu/commit/fd00d0b4bafbb451b58aebfdc27289d4a55f3d96) — Документирован воспроизводимый порядок тестирования SM83.
- 2025-03-26 · [`214fe7c8`](https://github.com/emu-russia/dmgcpu/commit/214fe7c8726cab5a4fb40168fe4a563b5b4e3126) — Обновлено пошаговое руководство восстановления нетлиста с пятью стадиями.

<a id="source-deroute"></a>

## Deroute — Редактируемая связность и экспорт

[Демо MMC1][R1] связывает фоновый снимок, XMLZ-сцену и Verilog-экспорт. [Руководство][R3] описывает координаты, сущности, библиотеку и Traverse. Для возможностей проверки дополнительно прочитан [GetVerilog.cs][R2]: диагностические сообщения не являются полной электрической проверкой и зависят от типов портов.

**Что переносим в методику.** Сохраняйте сцену и версию библиотеки, затем экспорт; проверяйте связность до интерпретации функции. Названия меню и возможности меняются, поэтому привязывайте инструкции к версии, а не к одному старому скриншоту.

**Проверенные вехи истории:**

- 2022-06-25 · [`561a6f91`](https://github.com/emu-russia/Deroute/commit/561a6f915698687615f91ff2316183e97123b781) — Код перенесён из psxdev; это начало истории в данном репозитории, не дата изобретения инструмента.
- 2023-01-17 · [`927f86f9`](https://github.com/emu-russia/Deroute/commit/927f86f95a2f083cf855a9b1c5de76abdf06f752) — Скрипт GetVerilog встроен в приложение.
- 2024-05-14 · [`53d0aacb`](https://github.com/emu-russia/Deroute/commit/53d0aacb72f75cb6abed44c291cd35e68bc9b3cd) — Добавлены sanity-check сообщения в экспорт Verilog.

<a id="source-mappers"></a>

## mappers — Компактный пример полного цикла

[MMC1][M1] собирает корпус, кристалл, карту, нетлист, схему из HDL и Logisim; [testbench][M2] добавляет векторы и случай игнорирования соседней записи. [VRC6][M3] отдельно фиксирует ревизию и геометрию рядов. [Дампер ROM][M4] показывает, что получение электрического дампа может быть отдельным источником данных; конкретную распиновку нужно проверять по своему чипу.

**Что переносим в методику.** Начинайте с небольшого обозримого объекта; проверяйте не только обычную операцию, но и протокольное исключение. Не переносите результат MMC1 на все ревизии mapper-чипов.

**Проверенные вехи истории:**

- 2023-06-07 · [`b4874cbf`](https://github.com/emu-russia/mappers/commit/b4874cbfd1b6115c0c31d4de92db9311cc191d20) — Добавлена рабочая сцена MMC1 и источник нетлиста.
- 2023-06-10 · [`9fcb4b3b`](https://github.com/emu-russia/mappers/commit/9fcb4b3b39e922466577d56152488886fa1c034e) — Доработаны ячейки и тестбенч; коммит отмечен автором как test ok.
- 2023-06-11 · [`055d5cbd`](https://github.com/emu-russia/mappers/commit/055d5cbda40ca3de1d4056ba719e9555222f31ac) — Добавлен тест записи с пропуском.
- 2023-06-24 · [`711d65a8`](https://github.com/emu-russia/mappers/commit/711d65a85fcaf1c10626cc40cee5df74f9f9ef91) — Исследованный MMC1A переименован в MMC1 без буквы.

<a id="source-sovietchips"></a>

## SovietChips — ВИ53: сравнение экземпляров и узкий эксперимент

В зафиксированном дереве восемь файлов, только два коммита и нет README. Основной источник — 42-страничный [PDF «Изучаем 580ВИ53», ревизия C3, org, 2025][V1]. Прочитаны методические разделы, особенно с. 5–10, и пример с. 15; просмотрены изображения с. 10 и 15, схема CW и исходник [wr_edge.v][V2]. В каталоге также есть Logisim-проект. По двум коммитам нельзя восстановить последовательность всей лабораторной работы.

**Что переносим в методику.** На с. 5–7 сравниваются три канала, советский чип, Intel 8253 и дополнительный экземпляр для уточнения диффузии. Сходство помогло избежать снятия металла именно в этом случае; различия сохранены. На с. 15 модель с условными задержками проверяет полярность wr_edge. Это хороший образец ограниченного вывода, а не измерения тайминга.

**Проверенные вехи истории:**

- 2025-06-14 · [`08e30966`](https://github.com/emu-russia/SovietChips/commit/08e309661636b20575be26021a4afc2eaa599e2c) — Создан репозиторий.
- 2025-06-14 · [`2b64738d`](https://github.com/emu-russia/SovietChips/commit/2b64738d83768f9edce4935c2581f0002a4c49fa) — Одним коммитом импортирован комплект ВИ53: PDF, схемы и локальная Verilog-проверка.

<a id="source-ula"></a>

## ula — От плоской схемы к функциональным модулям

[README][U1] прямо описывает цикл: изображение → элементы → Deroute → Verilog → схема в EDA → анализ и повторный экспорт. [Топология][U2] указывает биполярную технологию; [HDL][U3] объясняет замену части петель хранения примитивами и выделение модулей. [VCounter][U4] показывает, почему физически разбросанные вентили сложно сгруппировать в одинаковые биты.

**Что переносим в методику.** Сохраняйте исходные номера сетей при декомпозиции. Проверяйте используемые повторно вентили, особенные разряды, такты и сбросы. Наличие высокоуровневой модели не устанавливает её поведенческую эквивалентность; в рамках этой работы она не запускалась.

**Проверенные вехи истории:**

- 2024-10-24 · [`c75ea3e4`](https://github.com/emu-russia/ula/commit/c75ea3e4f66131de8ca2c9214fd0d900688a8670) — Добавлен нетлист.
- 2024-10-25 · [`06e1962f`](https://github.com/emu-russia/ula/commit/06e1962fd4e968062ce9b1bd10e456cb8aa47979) — На следующий день добавлен тестбенч Icarus.
- 2024-11-04 · [`5169bd3b`](https://github.com/emu-russia/ula/commit/5169bd3b773521d10ed3722323d25bf65e8a4545) — Добавлен верхний уровень обработанной HDL-модели.
- 2026-04-25 · [`764d4301`](https://github.com/emu-russia/ula/commit/764d4301f4502fed353f7e98f10558d2a02337b3) — Добавлен разбор битов VCounter спустя полтора года после исходного нетлиста.

<a id="source-psxcpu"></a>

## psxcpu — Большой чип: покрытия, библиотеки, полуавтоматическая трассировка

[Датасеты][P1] разделены на raw и cooked, содержат несколько фокусов и сеансов M1, заплатки и карту потерь. [Библиотека][P2] описывает варианты ячеек, ориентации и похожие типы. [Нетлист][P3] использует master dataset, крайние виасы и отдельные сегменты изгибов. Раздел progress прямо говорит о небольшом объёме готовой трассировки.

**Что переносим в методику.** Сначала создайте устойчивую систему координат и библиотеку; затем обрабатывайте ограниченные области. Неполное изображение и неполный нетлист — разные ограничения, их нужно учитывать раздельно. Импорт старой Wiki не означает независимой проверки каждого перенесённого утверждения ([предупреждение README][P4]).

**Проверенные вехи истории:**

- 2022-08-10 · [`f1018922`](https://github.com/emu-russia/psxcpu/commit/f101892203124a91c137f3a62ce1bf575a6464b3) — Материалы перенесены из psxdev.
- 2022-08-26 · [`464ced73`](https://github.com/emu-russia/psxcpu/commit/464ced737f81b4a800c051a3e19eae88e4a4bb94) — Добавлена база PatternsPSXCPU.
- 2022-09-06 · [`1f6347c0`](https://github.com/emu-russia/psxcpu/commit/1f6347c0e7b7e22331162d89509b01c2cc5fed39) — Добавлена сцена M2 для нетлиста.
- 2025-05-13 · [`85bd9f7c`](https://github.com/emu-russia/psxcpu/commit/85bd9f7c8c4dcae2c9927f8a7b714959ae2e7276) — Добавлены изображение poly для CA и материалы оставшихся ячеек; это не завершение нетлиста CPU.

<a id="source-patterns"></a>

## Patterns — Распознавание типов до восстановления проводов

[Руководство][T1] описывает JPEG-подложку, библиотеку, Lambda/Delta, flip/mirror, ряды и сохранение workspace. История уточняет появление горизонтальных рядов и возврат текстового экспорта. Назначение утилиты — ускорить выбор и размещение паттернов; полный функциональный нетлист не появляется из совпадения картинок.

**Что переносим в методику.** Храните версию базы рядом с `.wrk`, проверяйте масштаб и ориентацию, затем передавайте размещение в работу над связностью. Не путайте количество размещённых паттернов с количеством проверенных соединений.

**Проверенные вехи истории:**

- 2022-08-06 · [`021b70de`](https://github.com/emu-russia/Patterns/commit/021b70dece72fd50010372be1e1d408ba6b92ac8) — Утилита перенесена из psxdev.
- 2022-08-06 · [`3496077c`](https://github.com/emu-russia/Patterns/commit/3496077c24bb161a747a4f444c458c48da0f1c06) — Добавлена поддержка горизонтальных рядов.
- 2023-10-02 · [`a839c468`](https://github.com/emu-russia/Patterns/commit/a839c468bd039c72d208d2aa52e2ce0de59f8e65) — Возвращён текстовый экспорт.

<a id="images"></a>

## Иллюстрации и права

Семь иллюстраций скопированы без изменения байтов в `imgstore/workflow/`. Их опубликованные копии находятся в `docs/imgstore/workflow/`, чтобы GitHub Pages работал при публикации только `/docs`. [Манифест](../imgstore/workflow/provenance.json) содержит исходный путь, полный SHA, размер и SHA-256 каждого файла. Корневые лицензии всех девяти зафиксированных репозиториев — CC0-1.0; происхождение изображений сохранено ниже.

| Файл | Источник | Атрибуция / назначение |
| --- | --- | --- |
| [psxcpu-metal.jpg](../imgstore/workflow/psxcpu-metal.jpg) | [psxcpu: imgstore/m2_Fused_sm.jpg](https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/imgstore/m2_Fused_sm.jpg) | psxcpu; раздел datasets указывает анонимного исполнителя второго набора M2/M1. Обзор кристалла. |
| [microscope-tiles.jpg](../imgstore/workflow/microscope-tiles.jpg) | [dmgcpu: imgstore/shop/dataset.jpg](https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/imgstore/shop/dataset.jpg) | dmgcpu, иллюстрация метода съёмки. |
| [patterns-workspace.png](../imgstore/workflow/patterns-workspace.png) | [Patterns: imgstore/workspace.png](https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/imgstore/workspace.png) | Авторы Patterns; рабочая среда распознавания ячеек. |
| [deroute-interconnects.png](../imgstore/workflow/deroute-interconnects.png) | [dmgcpu: imgstore/shop/netlist4.png](https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/imgstore/shop/netlist4.png) | dmgcpu, учебный пример восстановления блока в Deroute. |
| [chip-perfect.png](../imgstore/workflow/chip-perfect.png) | [breaks: HDL/Design/chip-perfect-approach.png](https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/HDL/Design/chip-perfect-approach.png) | breaks, иллюстрация авторского подхода die-perfect. |
| [mmc1-write-waves.png](../imgstore/workflow/mmc1-write-waves.png) | [mappers: MMC1/icarus/waves_ignored.png](https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MMC1/icarus/waves_ignored.png) | mappers, результат исходного тестбенча MMC1. |
| [vi53-control-word.png](../imgstore/workflow/vi53-control-word.png) | [SovietChips: 580ВИ53/cw.png](https://github.com/emu-russia/SovietChips/blob/2b64738d83768f9edce4935c2581f0002a4c49fa/580%D0%92%D0%9853/cw.png) | SovietChips, комплект исследования ВИ53; PDF подписан org, 2025. |

Лицензии исходников: [Deroute](https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/LICENSE), [Patterns](https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/LICENSE), [SEGAChips](https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/LICENSE), [SovietChips](https://github.com/emu-russia/SovietChips/blob/2b64738d83768f9edce4935c2581f0002a4c49fa/LICENSE), [breaks](https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/LICENSE), [dmgcpu](https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/LICENSE), [mappers](https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/LICENSE), [psxcpu](https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/LICENSE), [ula](https://github.com/emu-russia/ula/blob/475d40245c478bda1a3a760b0e50be66f2f3f7ff/LICENSE).

[B1]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/README.md
[B3]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/HDL/Readme.md
[B4]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/HDL/Framework/Icarus/mos6502/Klaus/Readme.md
[B5]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/BreakingNESWiki/PPU/visual2c02.md
[D1]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/wiki/methods.md
[D2]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/wiki/datasets.md
[D3]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/netlist/Readme.md
[D4]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/wiki/sm83/investigation.md
[D5]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/HDL/sm83/Icarus/Readme.md
[M1]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MMC1/Readme.md
[M2]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MMC1/icarus/Readme.md
[M3]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/Famicom/VRC6/Readme.md
[M4]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/JEDEC_Like_ROM_Dumper/ReadmeRus.md
[P1]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/datasets.md
[P2]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/cells.md
[P3]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/netlist/Readme.md
[P4]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/Readme.md
[R1]: https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/Demo/ReadmeRus.md
[R2]: https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/Deroute/GetVerilog.cs
[R3]: https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/UserManual/DerouteUserManualRus.md
[S1]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/Readme.md
[S2]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/Arbiter/topo.md
[S3]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/Z80/netlist/Readme.md
[S4]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/Arbiter/ArbPatterns/Readme.md
[T1]: https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/UserManual/patterns_russian.md
[U1]: https://github.com/emu-russia/ula/blob/475d40245c478bda1a3a760b0e50be66f2f3f7ff/Readme.md
[U2]: https://github.com/emu-russia/ula/blob/475d40245c478bda1a3a760b0e50be66f2f3f7ff/topo.md
[U3]: https://github.com/emu-russia/ula/blob/475d40245c478bda1a3a760b0e50be66f2f3f7ff/hdl/Readme.md
[U4]: https://github.com/emu-russia/ula/blob/475d40245c478bda1a3a760b0e50be66f2f3f7ff/vcounter.md
[V1]: https://github.com/emu-russia/SovietChips/blob/2b64738d83768f9edce4935c2581f0002a4c49fa/580%D0%92%D0%9853/580%D0%92%D0%9853_research_C3.pdf
[V2]: https://github.com/emu-russia/SovietChips/blob/2b64738d83768f9edce4935c2581f0002a4c49fa/580%D0%92%D0%9853/wr_edge.v
