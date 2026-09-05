# Chip Research Workflow

*This is the English version of the document. The Russian original is [workflow.ru.md](/specs/workflow.ru.md).*

> The general workflow for studying integrated circuits, distilled from the
> [emu-russia](https://github.com/emu-russia) projects: [breaks](https://github.com/emu-russia/breaks),
> [SEGAChips](https://github.com/emu-russia/SEGAChips), [dmgcpu](https://github.com/emu-russia/dmgcpu),
> [Deroute](https://github.com/emu-russia/Deroute), [mappers](https://github.com/emu-russia/mappers),
> [SovietChips](https://github.com/emu-russia/SovietChips), [ula](https://github.com/emu-russia/ula),
> [psxcpu](https://github.com/emu-russia/psxcpu), [Patterns](https://github.com/emu-russia/Patterns) —
> and the "homegrown" guides of this very repository (`methods.md`, `hf.md`, `gds.md`).

![Board with chips](/imgstore/chips_howto_1.jpg)

*A neural network's idea of "studying chips". In reality it is a bit more methodical :)*

If tomorrow someone brings us a **new chip** — this document should become our starting
point: a step-by-step plan, tools, typical pitfalls, and examples from chips that have
already been dissected.

---

## Why this matters

"Studying a chip" in the language of these projects means:

1. **see** its internals (photographs of the die layers);
2. **understand** its structure (block map, standard cells, buses);
3. **recover the netlist** — the interconnection of elements (transistors, gates, cells) with conductors;
4. **verify** the result (simulation, comparison with documentation and real hardware);
5. **share** — schematics, Verilog/HDL models, wiki, books.

> "Netlist: the connection of modules (standard cells) by interconnects (wires). Studying a chip
> consists in obtaining its complete netlist" — [SEGAChips/Readme.md](https://github.com/emu-russia/SEGAChips#some-terminology)

It is important to understand: **one and the same process** runs like a red thread through all
the repositories, but the chips differ, and so do the *emphases*. The common "motif" looks like this:

```
  0. Контекст и цель        (зачем, что за чип, что уже известно)
  1. Вскрытие корпуса       (термическое / химическое)
  2. Съёмка слоёв           («сырой» набор снимков: raw dataset)
  3. Сшивка и Master-образ  («варёный» датасет: fused image)
  4. Трассировка            (провода → порты → ячейки → нетлист)
  5. Библиотека ячеек       (распознавание повторов, standard cells)
  6. Верификация            (симуляция, сверка двух представлений)
  7. Анализ и документация  (модули, имена сигналов, wiki)
  8. Переиспользование      (HDL, Logisim, эмуляторы, книги)
```

Each stage is examined below: what to do, with what tools, what to look at, and where you can
stumble. At the end — a [compact checklist](#checklist-for-a-new-chip).

---

## Repository landscape (what each one teaches)

| Repository | What it studies | What it offers the workflow |
|---|---|---|
| [chips-howto](https://github.com/emu-russia/chips-howto) | "homegrown" methods: thermal decapsulation, imaging, Fiji stitching, polishing, HF, GDS | the physical side (stages 1–3) and file formats |
| [breaks](https://github.com/emu-russia/breaks) | NES: MOS 6502, Ricoh 2A03 (APU), Ricoh 2C02 (PPU) | the full lifecycle: wiki → transistors → gates → "die-perfect" HDL → books |
| [dmgcpu](https://github.com/emu-russia/dmgcpu) | Game Boy CPU: SM83 core + SoC (PPU/APU/…) | die-perfect Verilog, terminology, verification with test ROMs |
| [SEGAChips](https://github.com/emu-russia/SEGAChips) | SEGA MD chips: Arbiter YM6045/46, FM YM2612/3438, IO 315-5309, VDP, Z80/T84C | the "standard workflow", terminology, Yamaha cell libraries |
| [psxcpu](https://github.com/emu-russia/psxcpu) | PlayStation CPU: CXD8530CQ (~850K transistors) | how to beat the scale: cells → Patterns → megacells |
| [mappers](https://github.com/emu-russia/mappers) | NES/GB mappers: MMC1, MBC1, VRC6/7, µPD775x, … | small chips: the fab's cell library, Deroute, Logisim |
| [ula](https://github.com/emu-russia/ula) | ZX Spectrum ULA 6C001 (a "sea of logic") | an explicit 6-step process, netlist-vs-HDL cross-check |
| [SovietChips](https://github.com/emu-russia/SovietChips) | the Soviet 580ВИ53 (presumably an i8253 clone) | an "artifact showcase": Verilog + Logisim + a PDF report |
| [Deroute](https://github.com/emu-russia/Deroute) | the tracing tool | stage 4: "untangling wires" on top of photos |
| [Patterns](https://github.com/emu-russia/Patterns) | the cell-search tool | stage 5: semi-automatic annotation of standard cells |

---

## Unified terminology

Before diving into the stages, let's agree on the words (following [dmgcpu](https://github.com/emu-russia/dmgcpu) and [SEGAChips](https://github.com/emu-russia/SEGAChips)):

- **Die** — the silicon piece inside the package, the object of study.
- **Layer** — one "floor" of the die: metal (usually M1, M2), polysilicon (poly),
  diffusion/active region. Logic looks different on different layers.
- **Slides** — individual microscope frames; from them the whole picture is **stitched** together.
- **Master Dataset / master image** — "the image from which the netlist is recovered" (SEGAChips), usually a stitched and prepared picture of a layer.
- **Topology** — the geometry of the layers (how the die is drawn).
- **Transistor schematic** — what you get by "reading" the topology at the transistor level.
- **Gate / standard cell** — a ready-made logic function (NOT, NAND, DFF…), repeated across the die.
- **Netlist** — the list of elements and their connections; the outcome of tracing.
- **"Die-perfect" HDL** — Verilog/HDL that mirrors the chip's netlist as closely as possible (breaks, dmgcpu).
- **Lambda (λ)** — a raster-independent unit of coordinates, the minimal topological unit of the process (usually the gate width).
- **Latch / DFF / FF / DLatch** — an important distinction (dmgcpu): a latch responds to a level,
  a DFF to an edge, "FF" is two cyclically cross-coupled gates, and a DLatch is a dynamic element
  storing charge on the gate of a FET (if not refreshed, it "decays").
- **Gate array / ULA** — a chip of pre-placed gates, a "sea of logic".

---

## Stage 0. Context and goal: understand the chip before decapping

The most underrated stage. Before you burn the package, answer these questions for yourself:

### What do we want to get?

- **A full netlist** at the transistor/gate level (6502 in breaks, SM83 in dmgcpu)?
- **A netlist at the standard-cell level** (SEGA chips, PSX CPU)?
- **A functional understanding** of the blocks and signals (ULA — "thoughtful analysis")?
- **A working model** (Verilog/Logisim) for an emulator?
- **An overview/article** ("review on all the chips we could get our hands on" — SEGAChips)?

The answer determines the depth of imaging, polishing and tracing. For a small mapper
(MMC1 — 142 cells) it is realistic to go all the way to transistors and a Logisim model; for the
PSX CPU (37,600 cells) — only to the cell level with a library.

### What is already known? (recon)

1. **Datasheet** — "a datasheet is not the truth but a hypothesis" (mappers): you should cross-check
   against it, but the die can contradict the description (e.g., on the µPD775x the pads turned
   out to be InOut rather than Input).
2. **Patents and papers.** For the ULA the signals were taken from the reverse engineering of Chris Smith
   (zxdesign.info) and the patent EP0107687B1 (Altwasser); for the PSX CPU — from Ken Kutaragi's
   HotChips talk and from the knowledge that the chip was built on LSI Logic CoreWare via the MDE/C-MDE EDA flow.
3. **Research by others** — if someone has already studied the chip: dmgcpu built on the work of
   @msinger (schematics) and @Gekkio (gb-research); VRC7 — on siliconpr0n and the related Yamaha OPL2.
   "DMG-CPU is a well-studied chip… so let's make our result an *addition* to what is known."
4. **Community datasets** — maybe **no photographing will be needed at all**: large image sets
   live on Google Drive, siliconpr0n, and with individual authors
   ([PSX CPU datasets](https://github.com/emu-russia/psxcpu/blob/main/datasets.md), [6502/APU/PPU](https://github.com/emu-russia/breaks), [SEGA datasets](https://github.com/emu-russia/SEGAChips)).
   Be sure to credit the author of the shots (credits!).
5. **Chip revision.** Chips of one series but different revisions can differ drastically
   (PSX CPU: "the revisions were re-synthesized from Verilog — tracing must be redone"). The revision
   is determined from the package markings (`L9A0048` → revision 90048) and from the "tattoo" in the
   corner of the die. In mappers there is a whole "zoo" of MMC1 revisions with donor games.
6. **The board and the environment.** Study the PCB the chip sits on: board revisions, routing,
   surrounding components — this helps to understand the purpose of the pins and external signals.
   Sometimes the board itself is reconstructed: from Gekkio's schematic, dmgcpu rebuilt the netlist
   of the DMG-CPU-06 motherboard (chip + RAM + cartridge slot + front board) and uses the Verilog
   model of the board for design verification (`wiki/pcb.md`).

### Architectural overview from photos

Even before tracing it is useful to sketch a map of the die **by eye**: where the memory is, where
the logic, where the cells, where the analog blocks. Example — the PSX CPU: "most of the chip is a
'jumble' of synthesized HDL logic (cells), with memory and registers along the edges".

![PSX CPU die (CXD8530CQ)](/imgstore/workflow/psxcpu_overview.jpg)

*An overview shot of the PSX CPU: regular cell fields and "custom" blocks along the edges are
visible. Such a picture immediately hints at the strategy (psxcpu).*

The outcome of stage 0 is a short memo: chip/revision, goal, links to documentation and datasets,
the expected architecture (cells/custom/memory), and an imaging plan.

---

## Stage 1. Opening the package (decapsulation)

The goal is to reach the die without damaging it. Detailed "homebrew" instructions are in
[methods.md](/methods.md) and [hf.md](/hf.md); here — the digest and its place in the overall process.

### Thermal method ("ACID FREE", no acids)

Tools: a gas burner, pliers, a mask.

![Tools for decapping](/imgstore/shop/unpackage_tools.jpg)

The package is clamped in pliers and roasted with the burner outdoors, in a deserted spot,
until the plastic turns into gray ash:

![Roasted package](/imgstore/shop/package_fried.jpg)

Then the charred package is carefully crushed — and the die falls out:

![Die extraction](/imgstore/shop/dig.jpg)

> :warning: **Do not inhale the smoke** of burning plastic — it is harmful (up to pulmonary edema).

Remaining plastic and dirt are cleaned off with **acetone** and a wooden toothpick (wood does not
scratch the metal but strips the plastic perfectly).

### Chemical decapsulation / developing

For ceramic packages and for **developing the diffusion** acids are used. Across the repositories
you find: nitric acid (the PSX CPU shots on polysilicon were made with acid etching —
"there is lots of debris in the photos, but everything needed can still be extracted", psxcpu) and
**hydrofluoric acid (HF)** — see [hf.md](/hf.md). HF etches glass and silicon and is used, for
example, for non-uniform etching that optically reveals the N/P-doped regions:

![Effect of HF on silicon](/imgstore/si_hf.jpg)

> :warning: HF is **lethal**: it is absorbed into the body unnoticed and binds calcium.
> Work only in gloves/finger cots and goggles, outdoors or under a fume hood, with a neutralizer at hand.

### Safety rules (general)

- Goggles, gloves, mask/fume hood — always.
- Acetone is a carcinogen; GOI paste (chromium oxides) is a mutagen; acids — you get the idea.
- Finger cots are handy when working with HF (see [hf.md](/hf.md)):

![Finger cots](/imgstore/finger_condoms.jpg)

### Pitfalls

- Decapping is a risky operation: the SEGA VDP chip **was damaged during decapping**, but the
  broken-off piece happened to contain the entire PSG — "it is fate" (SEGAChips). Document even the
  failures: sometimes a damaged specimen is still good for studying part of the chip.

---

## Stage 2. Layer imaging (raw dataset)

### Equipment

A metallographic microscope (in the homebrew guides — an inexpensive AmScope) plus a camera:

![Microscope](/imgstore/shop/micro.jpg)

Practical requirements (dmgcpu/chips-howto):

- **Motorized stage** and autofocus: shooting thousands of frames by hand is unrealistic, and a
  random knock of the table after the 300th slide means reshooting the entire run.
- **Frame overlap** (5–25%) — otherwise you cannot stitch.
- Watch the image **through the camera, not the eyepieces**: the focused light of a metallographic
  microscope can damage your retina.

### Layers and shooting order

The die is multi-layered. A typical order for CMOS with two metal layers (PSX CPU, dmgcpu):

1. photograph the top metal (M2);
2. **remove the layer** — polish (or etch) it away and photograph the next one (M1);
3. then — polysilicon (poly) and the active region (diffusion) — transistors are visible on this layer;
4. to develop the diffusion, an **acid** etch is sometimes needed (HF/nitric).

Layer removal is **polishing** (lapping). Equipment: a Dremel, GOI paste, "Moment" glue,
a microscope slide:

![Dremel](/imgstore/shop/dremel.jpg)
![GOI paste](/imgstore/shop/paste_goi.jpg)
![Chip glued to a slide](/imgstore/shop/glued_chip.jpg)

A tip from the homebrew guides: the chip is glued onto "bumps" of adhesive so that it is held from
the sides; polishing sessions of 5–10 seconds with checks under the microscope; with experience you
can remove layers 50–100 nm at a time — enough for old chips.

> :warning: protect your eyes — paste particles and shards fly around.

![Result of a failed polishing](/imgstore/workflow/psxcpu_lapping_disaster.jpg)

*"Lapping disaster" (psxcpu): the right-hand rows of cells were ground straight down "to the meat",
and parts of M1 had to be imaged separately afterwards. Polish carefully and keep the process under control.*

### Dataset organization

The "raw" shots are a folder of slides (in PSX CPU — "over-100500 slides"). Set up a `datasets.md`
document right away, in the spirit of [psxcpu/datasets.md](https://github.com/emu-russia/psxcpu/blob/main/datasets.md)
and [SEGAChips](https://github.com/emu-russia/SEGAChips): a table of "which set it is, which layer/magnification,
who shot it, where it is stored, what defects it has" ("lots of hairs", "dirt", "out of focus, but M1 is visible").
Large images are **not** put into git — only links to Google Drive/external storage.

---

## Stage 3. Stitching and preparing the Master image

### Stitching the slides

The standard tool is **Fiji (ImageJ)**: `Plugins → Stitching → Grid/Collection stitching`.
Slides are usually shot in a "snake" order; the settings are the grid size, overlap, filename
pattern (`{iiii}.jpg`):

|"Snake" order|Settings|Result|
|---|---|---|
|![snake](/imgstore/shop/order1.jpg)|![options](/imgstore/shop/options.jpg)|![fused](/imgstore/shop/fused.jpg)|

If auto-stitching fails (poor/uneven overlap) — the fallback is [Hugin](https://hugin.sourceforge.io/),
but it is labor-intensive (the homebrew guides of chips-howto/dmgcpu).

### Preparing the "master image"

Next, the picture is refined to a state suitable for tracing:

- **Downscaling/scale**: for the ULA the original shot was reduced 4× — "the topology does not
  require high resolution" — and the masks were partially **restored**, producing the master `ZX_ULA_sm.jpg`.
- **Zone-wise stitching**: in psxcpu, the "long sausages" — the cell rows with M1 — were stitched
  separately to make it easier to examine the interconnects inside the rows; the polysilicon with
  the cells — separately ("Poly Stitched"); for cell recognition the image was cut into zones (`active_sequenced`).
- **A single coordinate system**: the master image serves as the common "backdrop" for all tools (Deroute, Patterns).

Examples of master images:

![PSX CPU M2 master dataset](/imgstore/workflow/psxcpu_m2_fused.jpg)

*The stitched M2 metal layer of the PSX CPU — the common coordinate system for tracing (psxcpu).*

![FJ3002 fused image](/imgstore/workflow/segachips_fj3002_fused.jpg)

*A small chip in full after stitching — FJ3002 (SEGAChips).*

The outcome of the stage is a **Master Dataset**: "the image from which the netlist is recovered"
(SEGAChips terminology). It is uploaded to the cloud, and the link goes into `datasets.md`.

---

## Stage 4. Tracing and netlist recovery

The most labor-intensive stage — "untangling the wires". Canonical descriptions of the process:

**"The standard chip-study workflow"** (SEGAChips, [VDP/PSG/Readme.md](https://github.com/emu-russia/SEGAChips/blob/main/VDP/PSG/Readme.md)):

1. outline (trace) the wires;
2. remove the upper metal layers;
3. study the standard cells found in this area;
4. add the cells and connect all the ports;
5. assemble the schematic in Logisim/HDL;
6. study the pads — "a bonus".

**Five steps of netlist recovery** (dmgcpu, [netlist/Readme.md](https://github.com/emu-russia/dmgcpu/blob/main/netlist/Readme.md)):

1. **Obtain the master dataset**; the large image of the chip is cut into modules and the netlist
   of each module is recovered separately ("a natural process of modular reverse engineering").
2. **Mark the module's ports** (vias `ViasInput`/`ViasOutput`/`ViasInout`):

   ![Module ports in Deroute](/imgstore/workflow/dmgcpu_deroute_ports.png)

3. **Place the module's cells** (copy-paste, `Ctrl+C`/`Ctrl+V`, is convenient).
4. **Connect with wires** — "the most interesting part":

   ![Interconnects in Deroute](/imgstore/workflow/dmgcpu_deroute_wires.png)

5. **Export to Verilog** — then the module's schematic can be obtained in any EDA
   (the projects used Xilinx PlanAhead: "we load the Verilog, and it draws the schematic itself").

A useful practice from mappers: the netlist is exported **at two levels** — the whole chip and a
hierarchical per-cell one (`mmc1.v` + `mmc1_cells.v`): this makes tracing errors easier to spot and
the schematic easier to map back onto the photo.

For large chips, SEGAChips uses a **hybrid approach**: inter-block connections ("broad strokes")
are marked up in Photoshop over the interconnect maps (`rails`), the buses get names right away,
which later go into the HDL by hand; the connections inside cell domains, on the other hand, are
traced in Deroute — every domain has its own XMLZ project with a ready Verilog export
(`Z80/netlist/Readme.md`).

### Tool: Deroute

[Deroute](https://github.com/emu-russia/Deroute) — "a tool for untangling wires"
by chip researchers for chip researchers. It is a vector editor on top of the photo:

- a background image is loaded (`File → Load Image`);
- **entities** are drawn: vias (contacts; 7 types, including `ViasPower`/`ViasGround` — they carry
  the semantics of logical 1/0 and are not traced), wires (`WireInterconnect`/`WirePower`/`WireGround`),
  **standard cells** (NOT, NAND, MUX, DFF…), **blocks** (register files, memory),
  annotation regions, layer groups;
- coordinates are stored in **lambda units** — the annotation does not depend on the photo's resolution;
- **Traverse** (F10–F12) extends the selection along connected wires and through cells —
  the "untangling"; the depth is limited by `TierMax`, unwanted types go to a blacklist;
- auto-assistance: an A* wire router between two vias (routes around cells), merging of collinear
  wires, removal of small/non-orthogonal ones, intersection search;
- the result is saved as **XML/.xmlz** (compressed XML — convenient to version in git) and
  **exported to Verilog RTL**.

![Deroute main window](/imgstore/workflow/deroute_main_window.png)

*Deroute: a canvas over the photo, entity modes, the hierarchy tree.*

Semi-automation: a wire between two vias can be laid out by the **A\* router** — it goes around
cells and regions as if they were walls:

![Wire routing (A*)](/imgstore/workflow/deroute_wire_routing.png)

*Deroute: the Wire Router (A\*) draws a connection between the selected vias, avoiding obstacles.*

A trick for large chips (psxcpu): a human places the endpoint vias, and the **wire is finished by a
script/automation** — semi-automatic tracing:

![Semi-automatic tracing](/imgstore/workflow/psxcpu_deroute_method.png)

*The method from psxcpu: vias at the ends of a track, the conductor between them is completed (semi-)automatically.*

Tips from the manual and from practice:

- **name cells and wires right away** — the Verilog export depends on the names (`Label`);
- do not draw power/ground as ordinary wires — use the semantic types;
- hit `Ctrl+S` periodically: the scene is a text file, it can be committed;
- for thousands of entities use layers/groups, the hierarchy tree, the minimap, the locator;
- Deroute (the Collab module + the CollabMCP server) lets **several people and AI agents trace
  simultaneously** on a shared canvas.

> Historical note: in the first projects (breaks, early dmgcpu) the "outlining" was done directly in
> Photoshop, and the netlist was drawn by hand; the arrival of Deroute (and of Patterns for cells)
> greatly accelerated the process. Today Deroute is the common tool of the emu-russia family.

---

## Stage 5. Standard cells and libraries (Patterns)

From the tracing point of view, chips come in two "kinds":

- **Custom ("hand-made") topology** — UPD775x, memory, analog blocks: every transistor is unique,
  work happens at the transistor level (breaks, dmgcpu, mappers).
- **Standard cells** — the chip was synthesized from a library: the same "brick"
  (NOT, 3-NAND, 22-AOI, DFF…) repeats hundreds and thousands of times in rows
  (power/ground run along the rows on M1, M2 — perpendicular to them; neighboring rows are mirrored).
  PSX CPU: **~37,600 instances, but only ~150 types** (psxcpu); SEGA/Yamaha have their own libraries
  ("two-story" YM6xxx cells); the SHARP MMC1/MBC1 mappers share the fab's library.

If the chip is cell-based — **do not trace every cell**. Decode the type once (from
diffusion/polysilicon, the number of p/n transistors), then identify and label the instances.

### Tool: Patterns

[Patterns](https://github.com/emu-russia/Patterns) — "a utility for finding standard cells on the
source image", semi-automatic annotation:

- on the left — the photo with overlaid pattern frames, on the right — the **pattern library**:

![Patterns workspace](/imgstore/workflow/patterns_workspace.png)

- the source image is assigned a **Lambda** parameter (the size of the minimal topological
  unit), and the sizes are measured in lambdas rather than pixels; **Delta** is the error tolerance,
  and the DB candidates matching the frame size are filtered by it:

![Lambda/Delta](/imgstore/workflow/patterns_lambda_delta.png)

- when a frame is drawn, the program shows only the size-matching cells from the DB —
  a human confirms the type "by eye" and adds a frame with a name (accounting for `Flip`/`Mirror`;
  a double click changes the orientation);
- the library is a text file `patterns_db.txt` plus jpg images of the cells:

```
# Pattern Syntax:
# pattern name, source_lambda, pcount, ncount, image_path
pattern NOT1, 8.0, 1, 1, "patterns_db/NOT1.jpg"
pattern nDFF, 4.0, 12, 12, "patterns_db/nDFF.jpg"
```

  `pcount`/`ncount` — the number of p/n transistors (an electrical check of the type);
- the coordinates + names of the placed cells are **exported to XML in the Deroute format** — the
  next tool in the pipeline immediately knows where and which cell is placed;
- the workspace state is saved in `.wrk` (together with the DB); there is row numbering
  (horizontal/vertical) for "part/row/place" addressing.

Example cells from the bundled DB (this is the PSX CPU database, the same one stored in
`psxcpu/cells/PatternsPSXCPU/`):

![Cells from the library](/imgstore/workflow/patterns_db_NOT1.jpg)
![3-NAND](/imgstore/workflow/patterns_db_3NAND.jpg)
![22-AOI](/imgstore/workflow/patterns_db_22AOI.jpg)
![DFF](/imgstore/workflow/patterns_db_DFF.jpg)

*Left to right: NOT1 (inverter), 3-NAND (3-input), 22-AOI = ~((A&B)|(C&D)) — the notation is
"number of inputs per group + operation within/between groups", DFF. The 2X…6X suffixes denote the
"strength" (drive) of the cell.*

The outcome of the annotation is a **cell map**: a photograph with named instances and row numbers
(addressing by "part/row/place"), which later guides the tracing in Deroute:

![PSX CPU cell map](/imgstore/workflow/psxcpu_cells_map.jpg)

*Cell map of a PSX CPU part: every rectangle is a cell instance with its type name
(psxcpu, the Patterns tool).*

Cell libraries are **reused**: the SHARP fab library serves both MMC1 and MBC1;
SEGA has its own for each sound chip (`Arbiter/ArbPatterns`, `VDP/PSG/PatternsForPSG`),
and SEGAChips even singled out common Yamaha libraries (`YM_Cells`, `YM6_Cells`).

### Reading a cell from its topology

For cells of one fab, regularities hold (SEGAChips, psxcpu, mappers):

- N/P wells and **symmetry**: cells are often mirrored vertically/horizontally
  (symmetry groups), and are "flipped" by 180° between rows (power/ground run in a zigzag);
- "twins": topologically similar but functionally different cells (NOT2 looks like NAND2X; in Yamaha,
  nand and nor look identical, differing only by a top-to-bottom reflection).
  **A trap rule**: in a single row there are never both NORM and FLIP cells — if you encounter both,
  one of them was identified incorrectly;
- for every cell a **triplet of pictures** is kept: topology + transistor schematic + logic
  model (the standard of mappers and SEGAChips):

![22-AOI cell: topology](/imgstore/workflow/mappers_22aoi_topo.jpg)
![22-AOI cell: transistors](/imgstore/workflow/mappers_22aoi_tran.jpg)

*The "triplet" format (mappers, VRC6): on the left — the cell's topology from the photo, on the right —
its transistor schematic. The third picture (the Logisim model) usually follows.*

### When is Patterns needed?

A guideline: from **hundreds of cell instances** and dozens of types onward, tracing each cell
manually becomes pointless. Preparing the library is labor-intensive ("a very fascinating process,
especially when you have 100+ cells" — SEGAChips PSG), so it pays off through scale. For custom
areas (memory, analog blocks, N/P "jumbles") Patterns is redundant — there it is Deroute and
manual transistor-level analysis.

---

## Stage 6. Verification

A recovered netlist is a *hypothesis* that needs to be checked. Techniques from the projects:

### A schematic from HDL "for free"

The Verilog exported from Deroute is fed to an EDA (Xilinx PlanAhead), and it draws the
schematic by itself. This is both a "readable result" and a connectivity check:

![MBC1 schematic synthesized by PlanAhead](/imgstore/workflow/mappers_mbc1_planahead.png)

*MBC1: recovered Verilog → PlanAhead → a ready schematic (mappers).*

![ULA top-module schematic](/imgstore/workflow/ula_top_schematic.png)

*A fragment of the ULA schematic (ula): this is how the modules look after the EDA auto-drawing.*

### Simulation

- **Icarus Verilog + GTKWave** — the family standard: netlist + testbench + `.mem` vectors,
  watch the waveforms, compare with the expected behavior (mappers: simulated the known MMC1
  "ignored-second-write" feature).
- **Test ROMs and reference emulators**: dmgcpu ran blargg's `cpu_instrs` tests and compared traces
  with the gameroy reference emulator and with Gekkio's work; the result — Verilog of the SM83 core
  that passes the known tests.
- **Netlist-vs-HDL cross-check** — the signature technique of [ula](https://github.com/emu-russia/ula):
  the repository hosts TWO representations of one chip (a flat netlist and a modular HDL),
  and they are compared:
  1. *statically* — structural equivalence: for every gate, the type and the list of connected
     nets match (after accounting for renames/aliases). For the ULA: 519 shared gates are identical,
     and the 142 "extra" gates in the netlist are exactly the RS latches folded into a primitive in the HDL;
  2. *dynamically* — two separate simulations with the same stimulus and an **offline diff** of the
     logs at every edge (because of iverilog bugs, joint elaboration used to hang);
  3. importantly: for RS loops an explicit semantics of the unknown state must be set (X→0/1),
     otherwise the simulation "sticks" in X; dynamic nodes and BusKeepers also need careful modeling.
- **Logisim/Logisim-Evolution** — executable models for checking and demonstrating the logic
  (mappers: `MMC1A Logisim 2.7.1.circ`, a combined project covering all the mappers).
- **Real hardware as a reference**: psxcpu cross-checked the behavior of the schematics against a
  "black box" — hundreds of test vectors were run on a real console (nocash); this is how
  undocumented roundings and bit truncations were found.
- **Multi-level verification** (breaks): per-module HDL unit tests + full functional tests
  (e.g., Klaus) with a clear success criterion ("a hang at address X"); rigs on **real game dumps** —
  video/audio "players"; cross-checks against independent netlists (visual6502) and measurements
  of real hardware (oscilloscope); slow signals (LFO) are artificially sped up in the tests.
- **"Die-perfect" HDL**: breaks/dmgcpu bring the Verilog to the closest possible match with the
  chip's netlist — then simulating the HDL is equivalent to simulating the chip:

![The "die-perfect" approach](/imgstore/workflow/breaks_chip_perfect_approach.png)

*An illustration of the breaks approach: the HDL mirrors the netlist of the original chip as closely as possible.*

### Honesty is part of verification

All the repositories openly flag the unclear: `TBD`, "looks like…", "It looks very much like
some kind of core… but not yet exact", stub files, question marks in names
(`ROM2QuestionQuestionMark.md`). The unclear is not hushed up — it is recorded so that one can
return to it later.

---

## Stage 7. Analysis, naming and documentation

A netlist on its own is "spaghetti" of thousands of gates. To turn it into knowledge:

### Decomposition into modules

- The flat netlist is **split into functional submodules** (ULA: a flat netlist of 661 gates →
  19 modules: clkgen, hcounter, vcounter, latches…; dmgcpu: the SoC into parts — CPU, PPU, APU,
  arbiter, MMIO…; psxcpu: by blocks — GTE, MDEC, DMAC, …).
- End-to-end numbering "photo ↔ netlist ↔ HDL ↔ documentation" (gates `gNNN`, nets `wNNN`)
  lets you return from a schematic to a concrete spot on the die at any moment.
- Block locator maps on the photo — "where to look":

![6502 block locator map](/imgstore/workflow/breaks_6502_locator.jpg)
![Labeled 2A03 die layer](/imgstore/workflow/breaks_2a03g_labels.png)

*On the left: the MOS 6502 block locator (breaks). On the right: a 2A03 die layer with labels — this
is how the block map looks in the documentation.*

### Signal names

- Where possible, names are taken from documentation/patents/other people's reverse engineering
  (ULA — Chris Smith's signals).
- `snake_case` is the convention; **do not get carried away with renaming**: "frequent renaming
  contributes to various errors… renaming a signal does not make it work differently" (dmgcpu).
- **A living signal dictionary** (breaks): naming conventions, fixed polarities, "was → became"
  renaming tables. In reverse engineering, names appear before understanding (breaks once hosted
  signals LOL/WTF/BAKA, and "OMFG" turned out to be "OAM Mode Four") — the renaming history saves
  hours of future disputes. When a signal is renamed, the update propagates **through the whole
  chain**: masks → schematics (Logisim) → wiki pages → translations (breaks describes this
  procedure explicitly).
- Keep a glossary of terms (see the [Terminology section](#unified-terminology)) — dmgcpu explicitly
  defines Latch/DFF/FF/DLatch, mappers define memory address spaces, SEGAChips — netlist/lambda.

### "Uncomfortable" topics and analog effects

Everything that breaks the naive synchronous digital model is moved onto separate, explicit pages
with warnings for HDL developers (breaks): loops and feedback ("ouroboroses"), half-cycle analysis,
dead-time, floating buses. Analog/physical effects are documented separately: the PPU bus
capacitance → recommendation of a Transparent Latch/BusKeeper; the DAC stays outside the digital
HDL — instead, stubs and a separate calculation model with an accuracy disclaimer; clock-scheme
delays — a separate page. Dynamic elements (DLatch) and bus "precharge" also need careful modeling
in simulation (see stage 6).

### Structure of the "chip folder"

A time-tested layout (mappers, SEGAChips, dmgcpu):

```
CHIP/
  Readme.md        — сводка: ревизия, техпроцесс, что сделано, ссылки на датасеты
  datasets.md      — откуда фото, кто снимал, дефекты
  topo.md / map.md — топология, карта рядов/блоков
  pads.md          — выводы, bonding pads, I/O-буферы
  cells.md         — библиотека ячеек (тройки: топо/транзисторы/логика)
  deroute/         — проекты трассировки (.xmlz), экспорт Verilog
  logisim/         — исполняемые модели (.circ)
  icarus/ (hdl/)   — симуляция: тестбенчи, векторы, волны
  imgstore/        — картинки для wiki (в git — только небольшие)
```

The results are also presented as block-wise wikis (breaks — an entire wiki on the 6502/APU/PPU
with a DeepL translation into English; dmgcpu — `wiki/`; SEGAChips — `PSG_WikiRus/`/`PSG_WikiEng/`),
as "books" (breaks compiles the wiki into PDF books and publishes releases), and as **annotated photos**
("Back from HDL" — the recovered netlist is overlaid on the die shot):

![Die with the recovered netlist](/imgstore/workflow/dmgcpu_die_netlist.png)

*DMG-CPU: the recovered schematic overlaid on the die shot. Such "reverse mapping" helps to spot
tracing errors (dmgcpu).*

---

## Stage 8. Reuse and ecosystem

The results of the reverse engineering live on:

- **Verilog/HDL models** — "die-perfect" netlists (breaks, dmgcpu, SEGAChips, ula) and educational
  models (SovietChips: `wr_edge.v` with a testbench and a `.bat` launch of Icarus).
- **Logisim schematics** — the Soviet 580ВИ53 lives in the repo as `vi53.circ`; the mappers have
  combined Logisim projects for all the studied chips.
- **Emulators** — the full breaks cycle ended in the [Breaknes](https://github.com/emu-russia/breaknes)
  emulator at the logic-gate level; the dmgcpu netlist is simulated and checked with test ROMs.
- **Cell libraries** travel between projects: the PSX CPU database is in Patterns (as a demo), the
  Sharp database is shared by MMC1/MBC1; psxcpu keeps ready-made Patterns workspaces next to the DB.
- **Books and releases**: breaks publishes the "6502 Core Book", "APU Book", "PPU Book" (releases).
  The books are snapshots of the wiki and live a "life of their own" ("contents may differ from the
  Wiki, so be careful"): when the schematics are updated, new revisions of the books are released
  with release tags.
- **Machine translation** — in a separate folder (breaks: `BreakingNESWiki_DeepL`), with an
  invitation to the community to "humanize" the translation (the same trick in SEGAChips and ula:
  RU/EN versions of the wiki).
- **Scripts against routine**: slicing of large images (TopoShredder), conversion of dumps
  (bin2mem), table generation — everything that can be automated is automated; PSD sources of masks
  are kept in the cloud for reproducibility (breaks, dmgcpu: the `Scripts/` folder).
- **Attribution**: everywhere the photo authors (zeptobars, 4e71, anonymous…) are credited, as are
  the works of others (msinger, Gekkio, Chris Smith, visual6502, siliconpr0n) and the licenses (usually CC0).

### How the ecosystem grew (a short history)

- The emu-russia projects grew out of forum discussions (forum.emu-russia.net, psxdev.ru, and others);
  most of the documentation was written straight into the wiki repositories.
- The study order usually runs from the "heart" to the periphery, or from the simple to the complex:
  in breaks — 6502 → APU → PPU (the 6502 core enters the 2A03 in a "trimmed" form); in dmgcpu — from
  the SM83 core to the whole SoC; in mappers — from the "most vanilla" MBC1 to the zoo of revisions.
- The shared tools (Deroute, Patterns) were over time **split off into separate repositories**, and
  the emulators too (breaknes); cell libraries and datasets are reused across projects.
- The methods of the "physical" part (decapsulation, imaging, stitching, polishing) are shared: the
  English translation of the chips-howto methods lives in the dmgcpu wiki, and the SEGAChips
  "standard workflow" repeats the same steps.
- The results of mature projects are formalized as "research complete" plus an archive for refining
  schematics and porting them to HDL (breaks).

Advice: create the repository of results **right away** and keep adding to it as you go — the same
way it was done in the projects listed above. In a couple of months, "raw" data without context will
turn into useless garbage, while the wiki structure with datasets will retain its value.

---

## Checklist for a new chip

- [ ] **0. Context**: purpose, markings/revision, datasheet, patents, other people's reverse engineering.
      Are there ready-made datasets? What architecture is expected (cells/custom/memory)?
- [ ] **Goal**: a full netlist? a cell-level netlist? a model? an overview? — written down.
- [ ] **1. Decapsulation**: thermal or chemical; safety (goggles, gloves, fume hood).
- [ ] **2. Imaging**: layers M2/M1/poly/diff, motorization, frame overlap, polishing control.
- [ ] **3. Master image**: stitching (Fiji), preparation (scale, masks, zones), storage +
      `datasets.md` with credits.
- [ ] **4. Tracing**: ports → cells → wires (Deroute), Verilog export,
      saving `.xmlz`.
- [ ] **5. Cells**: if the chip is cell-based — a library (`patterns_db.txt` + images),
      Patterns annotation, XML export into Deroute.
- [ ] **6. Verification**: simulation (Icarus), schematic from HDL (EDA), cross-check against the
      datasheet/reference; honest `TBD` marks.
- [ ] **7. Documentation**: chip folder per the template, decomposition into modules, signal names,
      wiki/book, annotated photo.
- [ ] **8. Reuse**: HDL/Logisim/emulator, references and credits, license.

---

## "Stage → tool → example" map

| Stage | Tools | Example repository | Artifact |
|---|---|---|---|
| 0. Context | datasheets, patents, forums, siliconpr0n | psxcpu, ula, mappers | chip/revision memo |
| 1. Decapsulation | burner, HF/nitric, acetone | chips-howto (`methods.md`, `hf.md`), SEGAChips | die |
| 2. Imaging | metallographic microscope, motorization, polishing | chips-howto, dmgcpu, psxcpu | raw dataset (slides) |
| 3. Stitching | Fiji/ImageJ, Hugin | chips-howto, psxcpu, SEGAChips | Master Dataset (fused) |
| 4. Tracing | **Deroute** (+Photoshop early on) | dmgcpu, SEGAChips, mappers, ula, psxcpu | `.xmlz`, Verilog |
| 5. Cells | **Patterns** | psxcpu, SEGAChips (ArbPatterns/PSG), mappers (Sharp) | `patterns_db`, `.wrk`, XML |
| 6. Verification | Icarus/GTKWave, PlanAhead, Logisim, test ROMs | ula, dmgcpu, mappers, breaks | waveforms, schematics, diffs |
| 7. Analysis/docs | wiki, locator maps, books | breaks, dmgcpu, SEGAChips, ula | wiki/books, annotations |
| 8. Reuse | Verilog, Logisim, emulators | SovietChips, breaks (Breaknes), mappers | HDL/models/emulators |

---

*Compiled from the materials of the emu-russia repositories and their documentation. The Russian
version: [workflow.ru.md](/specs/workflow.ru.md). Task discussion — [issue #8](https://github.com/emu-russia/chips-howto/issues/8).*
