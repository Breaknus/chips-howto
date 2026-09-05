# Рабочий процесс (workflow) изучения микросхем

Документ описывает общий мотив ("common workflow") исследования интегральных микросхем,
сконструированный из опыта репозиториев организации emu-russia:

| Репозиторий | Чипы / фокус |
|---|---|
| [breaks](https://github.com/emu-russia/breaks) | MOS 6502, Ricoh 2A03 (APU), Ricoh 2C02 (PPU), Famiclones |
| [SEGAChips](https://github.com/emu-russia/SEGAChips) | VDP, Arbiter, IOChip, YM2612/YM3438, CMOS Z80 |
| [dmgcpu](https://github.com/emu-russia/dmgcpu) | Nintendo DMG-CPU (SoC Game Boy) |
| [Deroute](https://github.com/emu-russia/Deroute) | утилита расшивки проводов (netlist) |
| [mappers](https://github.com/emu-russia/mappers) | мапперы NES/Famicom/Famiclones (MMC1, MBC1, VRC6...) |
| [SovietChips](https://github.com/emu-russia/SovietChips) | отечественные микросхемы (580ВИ53 и др.) |
| [ula](https://github.com/emu-russia/ula) | ZX Spectrum ULA 6C001 |
| [psxcpu](https://github.com/emu-russia/psxcpu) | Sony PlayStation CPU (CXD8530CQ) |
| [Patterns](https://github.com/emu-russia/Patterns) | утилита поиска стандартных ячеек (паттернов) |

Идея: когда вы начинаете изучать новую микросхему, вы можете планомерно
подглядывать в эту методику и идти по шагам.

Дополнительные материалы:
- [Методы исследования (ACID FREE)](/methods.md) — термическое вскрытие, фото, сшивка, полировка
- [Плавиковая кислота (HF)](/hf.md) — кислотные методики
- [GDSII](/gds.md) — формат описания топологии

---

## Общая схема процесса

```
[0] Подготовка      -> цель, чип, референсы
[1] Добыча         -> микросхема, эталонная плата, датасеты
[2] Распаковка    -> извлечение кристалла (декапсуляция)
[3] Съёмка        -> мозаика слайдов под микроскопом
[4] Сшивка        -> Master Dataset (единое изображение)
[5] Слои          -> полировка/delayering + пересъёмка каждого слоя
[6] Библиотека   -> каталог стандартных ячеек (cells/patterns)
[7] Нетлист      -> трассировка проводов и выводов (Deroute)
[8] Verilog      -> экспорт "die-perfect" HDL
[9] EDA-схема    -> визуализация нетлиста в EDA
[10] Анализ       -> декомпозиция на модули, имена сигналов, таблицы
[11] Верификация -> симуляция, тесты, кросс-чек с сообществом
[12] Документация -> wiki, книги, релизы, итерации
```

![chip-perfect-approach](/imgstore/workflow/chip-perfect-approach.png)

*(Подход "Die-Perfect": HDL максимально точно повторяет оригинальный нетлист чипа — из [breaks](https://github.com/emu-russia/breaks))*

![dmgcpu](/imgstore/workflow/Nintendo_DMG_CPU_1.jpg)

*(Кристалл Nintendo DMG-CPU — отправная точка исследования в [dmgcpu](https://github.com/emu-russia/dmgcpu))*

Главная цель почти всех проектов — **полный нетлист в Verilog, максимально близкий к реальному чипу**
("die-perfect"). Далее его можно либо "понять", либо использовать "без понимания" в эмуляторах
(см. [dmgcpu](https://github.com/emu-russia/dmgcpu), [Breaknes](https://github.com/emu-russia/breaknes)).

---

## Шаг 0. Подготовка и постановка цели

**Что делаем:**
1. Выбираем чип и фиксируем цель исследования:
   - полный транзисторный нетлист (6502 в [breaks](https://github.com/emu-russia/breaks));
   - нетлист на уровне стандартных ячеек (SEGA/Yamaha в [SEGAChips](https://github.com/emu-russia/SEGAChips) —
     "реверс таких чипов похож на дизассемблирование программ");
   - логика на уровне вентилей ([ula](https://github.com/emu-russia/ula), [mappers](https://github.com/emu-russia/mappers));
   - обзор/обследование больших SoC ([psxcpu](https://github.com/emu-russia/psxcpu), [dmgcpu](https://github.com/emu-russia/dmgcpu)).
2. Собираем **референсы**: блок-схемы, service manual, патенты, чужие реверсы, доки по архитектуре.
   Примеры: msinger dmg-schematics и Gekkio gb-schematics в [dmgcpu](https://github.com/emu-russia/dmgcpu),
   zxdesign.info и патент EP0107687B1 в [ula](https://github.com/emu-russia/ula),
   патентная и LSI Logic документация CoreWare в [psxcpu](https://github.com/emu-russia/psxcpu).
3. Фиксируем **терминологию** до начала работы (см. ниже «Терминология») — это экономит массу споров потом.

**Результат:** поставленная цель, список референсов, словарь терминов.

**⚠ Грабли:** отсутствие референсов ведёт к "самоназванию" сигналов; споры о терминах
(latch/DFF/FF, PRG/CHR), начатые после трассировки, съедают недели.

---

## Шаг 1. Добыча чипа и датасетов

**Что делаем:**
1. Ищем донорскую плату/консоль нужной ревизии. Ревизии чипов важно фиксировать сразу:
   маркировка, код ревизии на кристалле (tattoo), упаковка
   (ревизии CXD8530CQ/CXD8606 и tattoo `90048` в [psxcpu](https://github.com/emu-russia/psxcpu)).
2. Ищем **готовые датасеты** в сообществе, чтобы не переделывать чужую работу:
   - ссылки на датасеты в [breaks](https://github.com/emu-russia/breaks) (visual6502, siliconpr0n, GDrive);
   - датасеты SEGA в [SEGAChips](https://github.com/emu-russia/SEGAChips);
   - датасеты мапперов в [mappers](https://github.com/emu-russia/mappers).
3. Определяемся с "эталонным изображением" — **Master Dataset**, из которого будет восстанавливаться нетлист.

**Результат:** чип (или чужой датасет), зафиксированная ревизия, план съёмки.

**⚠ Грабли (psxcpu):** чип не той ревизии обнуляет недели: SCPH-1000 содержали старую
архитектуру (3 слоя металла), а исследуют `90048`; новые ревизии "пересобраны" из верилога —
сверять трассировку между ревизиями бессмысленно.

---

## Шаг 2. Распаковка (декапсуляция)

Полностью описано в [methods.md](/methods.md). Кратко:

- **Термический способ (ACID FREE):** газовая горелка + плоскогубцы + ковырялка,
  прожарка корпуса до серого пепла, извлечение кристалла.
- **Химический способ (HF):** см. [hf.md](/hf.md) — плавиковая кислота для травления стекла/кремния,
  в основном применяется для оптической проявки областей легирования.

:warning: Соблюдайте технику безопасности: не вдыхать продукты горения пластика, работать
в вытяжке/на открытом воздухе, защищать глаза и руки (см. предупреждения в methods.md и hf.md).

**Результат:** чистый кристалл на предметном стекле.

**⚠ Грабли:** дым горелого пластика вызывает отёк лёгких — только улица/вытяжка;
ацетон — канцероген; HF связывает кальций — напальчники, маска, кальций под рукой;
не смотреть в окуляры подолгу — свет отражается от чипа в сетчатку.

---

## Шаг 3. Съёмка датасета

Из [methods.md](/methods.md):

1. Металлографический микроскоп (например AmScope) + камера.
2. Слайды снимаются **равномерной сеткой "змейкой"** с перекрытием 5–20%.
3. Идеально — моторизованный столик и автосъёмка (экономит нервы и пересъёмки).
4. Каждая полировка (delayering) снимается отдельным "лагом" (проходом): lap1, lap2, M1, M2...
   (см. историю коммитов M1/M2 Fused в [psxcpu](https://github.com/emu-russia/psxcpu),
   lap1-4 в [dmgcpu](https://github.com/emu-russia/dmgcpu)).

**Результат:** набор слайдов `0001.jpg ... NNNN.jpg` для каждого слоя.

**⚠ Грабли (psxcpu):** пропуск части чипа из-за спешки ("правые три ряда сточили до мяса",
lapping disaster) = дыры в нетлисте навсегда; датасеты с мусором после травления ещё пригодны,
а вот дыры — нет. Фокус — компромисс: резкий M2 не просвечивает M1, расфокус просвечивает,
но теряет детали — снимают оба варианта. 20x-прогон M1 оказался "практически бесполезен",
сгодился только 50x.

---

## Шаг 4. Сшивка — Master Dataset

Из [methods.md](/methods.md):

- **Fiji**: `Plugins -> Stitching -> Grid/Collection stitching`, шаблон имён `{iiii}.jpg`,
  порядок "змейкой", overlap подбирается экспериментально.
- **Hugin** — запасной вариант, требует больше ручного труда.

**Результат:** единое Master изображение слоя (для топологии часто уменьшают в разы —
[ula](https://github.com/emu-russia/ula): исходник уменьшен в 4 раза для master-изображения ZX_ULA_sm.jpg).

| Master слоя | Пример |
|---|---|
| ULA ZX Spectrum | ![ula6c001](/imgstore/workflow/ula6c001.png) |
| PSX CPU обзор | ![psxcpu](/imgstore/workflow/psxcpu_overview.jpg) |
| M2 после сшивки | ![m2](/imgstore/workflow/psx_m2_fused.jpg) |

**⚠ Грабли:** если Fiji не сходится — проверь постоянство перекрытия и масштаба съёмки,
а не тяни ручную подгонку в Hugin; переделка прогона дешевле.

---

## Шаг 5. Работа со слоями (delayering)

1. Полировка дремелем с пастой ГОИ слоями по 50–100 нм ([methods.md](/methods.md)).
2. После каждого сеанса — контроль под микроскопом и пересъёмка.
3. HF может применяться для оптической проявки областей легирования ([hf.md](/hf.md)).
4. Слои металла (M1, M2, poly, active) складируются в репозиторий слоями
   (полигоны слоёв VDP в [SEGAChips](https://github.com/emu-russia/SEGAChips),
   M1/M2/Poly в [psxcpu](https://github.com/emu-russia/psxcpu)).

**Результат:** полный набор изображений всех слоёв кристалла.

**⚠ Грабли:** оксиды хрома из пасты ГОИ — мутагены; слишком усердная полировка съедает слой
("lapping disaster" правого края в psxcpu) — лучше лишний короткий сеанс, чем один длинный;
чип приклеивать к стеклу надёжно, иначе улетает при полировке.

---

## Шаг 6. Библиотека стандартных ячеек

Для чипов на стандартных ячейках (почти всё после 70-х) сначала строится **каталог ячеек**:

- Утилита [Patterns](https://github.com/emu-russia/Patterns): сопоставляет ячейки из библиотеки
  с мастер-изображением и экспортирует координаты в XML/TXT для Deroute.

  ![patterns workspace](/imgstore/workflow/patterns_workspace.png)
  ![patterns layers](/imgstore/workflow/patterns_layers.png)

- Каталог ячеек документируется в `cells.md` с фото каждой ячейки:
  библиотеки Yamaha/YM6xxx в [SEGAChips](https://github.com/emu-russia/SEGAChips)
  (`YM_Cells`, `YM6_Cells` — "двухэтажные ячейки"), CoreWare-ячейки в [psxcpu](https://github.com/emu-russia/psxcpu),
  `cells.md` в [dmgcpu](https://github.com/emu-russia/dmgcpu) и [mappers](https://github.com/emu-russia/mappers).
- Для простых чипов вместо библиотеки — векторизация базовых элементов
  (`ulabase.v` в [ula](https://github.com/emu-russia/ula)).

**Результат:** `cells.md` + база паттернов (patterns_db).

**⚠ Грабли:** дummies/fillers существуют и их надо распознавать (psxcpu FILLER cell),
но не "удалять всё подряд": в ula периферийные инверторы не входят в основной нетлист,
но один инвертор из периферийной ячейки реально задействован разработчиками в /AE.

---

## Шаг 7. Получение нетлиста (Deroute)

[Deroute](https://github.com/emu-russia/Deroute) — утилита расшивки проводов:

- Работает с "сущностями" (EntityBox): провода, переходные контакты (vias), ячейки, блоки памяти, разёмы.
- Две системы координат: растр-независимые **Lambda** для хранения, экранные для отображения.
- Сцена сохраняется в XML.

![deroute sample](/imgstore/workflow/deroute_sample1.png)

Практический порядок трассировки (из историй dmgcpu/psxcpu/mappers):
**сначала top-level и pads, затем слой за слоем (M1, M2...), затем декомпозиция на модули**
(`ports.md` -> `netlist m1.xmlz` -> модули BG/FSM/MUX/... в VDP SEGAChips).

**Результат:** нетлист (XML) — соединение модулей проводами.

**⚠ Грабли:** Lambda задаётся один раз (psxcpu: Lambda 6.0, Vias 2, Wire 3) — переопределение
масштаба ломает уже разложенные сущности; рисуются только крайние vias, промежуточные помечаются
`x`, чтобы "собачьи ноги" не обрывали восстановление провода; power/grounds дают ложные warnings
(Deroute #106), bidir-порты не считать floaters (#88).

---

## Шаг 8. Экспорт в Verilog

Deroute выгружает нетлист сразу в **Verilog** ("die-perfect", не синтезируемый —
цель повторить оригинал, а не синтезировать). См. pipeline в
[ula](https://github.com/emu-russia/ula): нетлист -> verilog -> EDA.

**Результат:** `chip.v` с сетями оригинала.

**⚠ Грабли:** HDL и нетлист расходятся семантикой примитивов (2-input NOR в модели vs
библиотека ячеек — отчёт в ula); непрокинутые порты всплывают только при компиляции
(dmgcpu: "Cell not:g2 port x not connected fixed"); floater-шины виснут без bus keeper,
если он физически есть в оригинале (STAT на внутренней шине DL, dmgcpu).

---

## Шаг 9. Визуализация в EDA

Загрузка Verilog в EDA для автоматической отрисовки схемы:
Xilinx PlanAhead рисует схему из verilog сам
([ula](https://github.com/emu-russia/ula), [dmgcpu](https://github.com/emu-russia/dmgcpu) —
"Design extracted from PlanAhead").

**Результат:** читаемая схема для анализа.

**⚠ Грабли:** EDA-схема плоская и шумная — сначала декомпозиция (шаг 10), потом чтение.

---

## Шаг 10. Анализ и декомпозиция

1. **Дробление плоского нетлиста на функциональные блоки**, разметка на изображении:
   annotated map ULA ([ula](/imgstore/workflow/ula6c001_annotated.png)),
   блоки VDP ([SEGAChips](/imgstore/workflow/sega_vdp_modules.jpg)),
   блок-схема CPU ([psxcpu](/imgstore/workflow/psxcpu_block.jpg)),
   SoC DMG ([dmgcpu](https://github.com/emu-russia/dmgcpu/blob/main/wiki/soc/Readme.md)).

   ![ula annotated](/imgstore/workflow/ula6c001_annotated.png)

2. **Именование сигналов** — человеческими именами, но *без фанатизма*:
   частые переименования порождают ошибки и путаницу ("Renaming a signal does not make it
   work differently" — [dmgcpu](https://github.com/emu-russia/dmgcpu)). Переименования делаются
   пакетами с атомарным обновлением wiki/HDL/tran (см. "PPU Signal rename Wave1" wiki+HDL+tran в
   [breaks](https://github.com/emu-russia/breaks)).
3. **Таблицы сигналов**: имя -> откуда -> куда -> описание (clkgen.md как эталон в dmgcpu,
   tables в mappers/pads.md).
4. **Waves / временные диаграммы** ключевых узлов    waves в wiki breaks, waves.png в mappers,
   `ulasim.py` -> `ula_waves.vcd` в ula.

5. Примеры по советским чипам: документирование через Logisim-модель и Verilog
   (`vi53.circ`, `wr_edge.v`, PDF-отчёт в [SovietChips](https://github.com/emu-russia/SovietChips) для 580ВИ53).

   ![vi53](/imgstore/workflow/vi53_all.jpg)

**Результат:** разбор модулей, словари сигналов, волновые диаграммы.

**⚠ Грабли:** переименование сигналов — атомарный проход wiki+HDL+tran разом
(breaks: "PPU Signal rename Wave1" — три PR в один день); "Renaming a signal does not make
it work differently" (dmgcpu); раннее именование "на глаз" порождает ложные From/Where To,
которые потом переписываешь (dmgcpu #330/#363).

---

## Шаг 11. Верификация

- **Тестбенчи и симуляция**: Icarus Verilog + GTKWave (`ula.gtkw` в ula),
  logisim-модели ячеек в mappers, стенд PPU в breaks ("ppu standalone testbench").
- **Структурная проверка** HDL vs нетлист (отчёт "HDL-vs-netlist verification" в
  [ula](https://github.com/emu-russia/ula)).
- **Кросс-чек с сообществом**: сверка с msinger/Gekkio (dmgcpu), zxdesign (ula),
  nesdev/forums (breaks, mappers); на найденные расхождения заводить issues.
- **Невыверенные факты помечать как unverified** (заметки про "unverified technical-report claim"
  в breaks) — честность данных важнее красоты.
- **Тесты на реальной "нестандартной" динамике**: чтение регистра во время изменения,
  bus keeper на внутренней шине (buskeeper/STAT fix в dmgcpu).

**Результат:** подтверждённый нетлист + список открытых вопросов.

**⚠ Грабли:** со-симуляция "в лоб" может зависнуть (Icarus hangs в ula) — готовь отдельный
flow сравнения; честные "unverified" важнее красивых утверждений (DMC+OAM в breaks);
corner case: чтение регистра во время его изменения (STAT AND-эффект, dmgcpu).

---

## Шаг 12. Документация и итерации

- Wiki с разделами по модулям и **прогресс-таблицей** по каждому блоку
  (Topology/Ports/Cells/Netlist/Verilog/Verification — таблица Progress в
  [dmgcpu](https://github.com/emu-russia/dmgcpu)).
- Двуязычность: русская и английская версии разделов; если остаётся только русский —
  "можно спокойно использовать DeepL" (SEGAChips, ula).
- Конспект wiki в **книги PDF** с релизами по ревизиям (books в
  [breaks](https://github.com/emu-russia/breaks): 6502/APU/PPU).
- Утилиты living: инструменты допиливаются по мере надобности исследований
  (Deroute: minimap, bulk tools, collaboration; Patterns: экспорт, строки ячеек).
- Каждое исследование порождает переиспользование: CMOS Z80 из SEGAChips — "для других систем",
  MBC1 из mappers — референс для dmgcpu PPU и наоборот.

**Результат:** воспроизводимое исследование, по которому другой человек (или агент)
может повторить путь.

**⚠ Грабли:** LLM- boilerplate правят до деловитого стиля (dmgcpu #363); секции из разных
источников дублируются — помечать дубли сразу ("всё встанет на места со временем", psxcpu);
прогресс-таблица (dmgcpu wiki) превращает хаос в план.

---

## Терминология

Принятые соглашения (из [dmgcpu](https://github.com/emu-russia/dmgcpu) и
[mappers](https://github.com/emu-russia/mappers)):

- **Latch** — статический память-элемент по уровню; **DFF** — по фронту/спаду;
  **FF** — крестом замкнутые not/nor; **DLatch** — динамический на ёмкости затвора (requires refresh).
- **Нетлист** — соединение модулей проводами; конструирование нетлиста = суть реверса.
- **Lambda** — растр-независимые координаты Deroute.
- **Master Dataset** — изображение, из которого восстанавливается нетлист.
- Пространства адресов: CPU/PPU, RAM/VRAM/WRAM/PRG/CHR — по [mappers](https://github.com/emu-russia/mappers).

---

## Чеклист для нового чипа

```text
[ ] 0  Цель: транзисторы / ячейки / вентили / обзор? Референсы собраны?
[ ] 1  Чип/донор найден, ревизия зафиксирована (маркировка + tattoo)?
[ ] 1  Чужие датасеты проверены (siliconpr0n / visual6502 / GDrive / forums)?
[ ] 2  Декапсуляция: термическая или HF? Безопасность обеспечена?
[ ] 3  Съёмка: змейка, перекрытие 5-20%, моторизованный стол?
[ ] 4  Сшивка Fiji -> Master Dataset, уменьшенное рабочее изображение?
[ ] 5  Все слои сняты и рассортированы (poly/M1/M2...)?
[ ] 6  Библиотека ячеек собрана (cells.md + patterns_db)?
[ ] 7  Нетлист в Deroute: pads -> слои -> модули? XML сохранён?
[ ] 8  Verilog die-perfect экспортирован, компилируется?
[ ] 9  Схема отрисована в EDA (PlanAhead)?
[ ] 10 Модули названы, таблицы сигналов заполнены, waves сняты?
[ ] 11 Симуляция/тесты пройдены? Кросс-чек с сообществом? Unverified помечены?
[ ] 12 Wiki/док-раза с прогресс-таблицей, два языка, issues заведены?
```

---

## Наблюдения из истории проектов

- **breaks** (2012→): начинался с ручного анализа транзисторов и PLA ("PLA double checked.
  Errors: 0"), симуляции кусками (ALU, PC, registers), позже — wiki, книги, переименования
  пакетам и HDL-рефакторинг. Вывод: *начинать можно с бумаги иPhotoshop, инструменты догоняют*.
- **Deroute/Patterns**: выросли из реверса PSX GPU/CPU (psxdev) как отдельные инструменты,
  затем десятки лет используются на NES/Game Boy/SEGA. Вывод: *инструменты отделения от данных —
  переиспользуйте и развивайте их отдельно*.
- **dmgcpu** (2022→): типовой быстрый цикл: Readme+ports -> netlist M1..M4 -> модули ->
  pads -> tables -> verification с внешними авторами. Вывод: *идите от периферии к ядру,
  слой за слоем, фиксируя прогресс таблицей*.
- **SEGAChips** (2022→): старт с cells.md — сначала библиотека ячеек, потом нетлисты VDP.
  Вывод: *для БИС на стандартных ячейках нетлист начинается с каталога ячеек*.
- **ula** (2022→): компактный чип без библиотеки — master в уменьшении, векторизация
  ulabase.v, Deroute, верilog, PlanAhead, разбор модулей, симулятор. Вывод: *масштабируйте
  глубину методики под сложность чипа*.
- **mappers**: пачка мелких чипов — общие термины и единый стиль разделов, разбор по cell-by-cell
  (nand3, dff2, mux...). Вывод: *серия однотипных чипов требует жёсткой стандартизации описаний*.
- **psxcpu**: сбор из разнородных источников (сайт, форум, wiki) + обязательная фиксация
  ревизий кристалла. Вывод: *крупный SoC исследуется итеративно-обзорно, ревизии — святое*.
- **SovietChips**: даже для одного чипа — полный цикл: даташит, фото кристалла, Logisim-модель,
  Verilog, PDF-отчёт. Вывод: *методика работает и на советской номенклатуре*.

English version: [workflow_en.md](/specs/workflow_en.md)
