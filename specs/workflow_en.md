# Chip Reverse-Engineering Workflow

This document distills the common workflow for integrated circuit research,
compiled from the experience of the emu-russia repositories:

| Repository | Chips / focus |
|---|---|
| [breaks](https://github.com/emu-russia/breaks) | MOS 6502, Ricoh 2A03 (APU), Ricoh 2C02 (PPU), Famiclones |
| [SEGAChips](https://github.com/emu-russia/SEGAChips) | VDP, Arbiter, IOChip, YM2612/YM3438, CMOS Z80 |
| [dmgcpu](https://github.com/emu-russia/dmgcpu) | Nintendo DMG-CPU (Game Boy SoC) |
| [Deroute](https://github.com/emu-russia/Deroute) | wire untangling (netlist) utility |
| [mappers](https://github.com/emu-russia/mappers) | NES/Famicom/Famiclones mappers (MMC1, MBC1, VRC6...) |
| [SovietChips](https://github.com/emu-russia/SovietChips) | Soviet ICs (580VI53 etc.) |
| [ula](https://github.com/emu-russia/ula) | ZX Spectrum ULA 6C001 |
| [psxcpu](https://github.com/emu-russia/psxcpu) | Sony PlayStation CPU (CXD8530CQ) |
| [Patterns](https://github.com/emu-russia/Patterns) | standard cell (pattern) matching utility |

The idea: when you start researching a new chip, you can follow this methodology step by step.

Related material:
- [Research methods (ACID FREE)](/methods.md) — thermal decap, photography, stitching, polishing
- [Hydrofluoric acid (HF)](/hf.md) — acid methods
- [GDSII](/gds.md) — layout description format

---

## Process overview

```
[0] Preparation   -> goal, chip, references
[1] Acquisition   -> the chip, reference PCB, datasets
[2] Decapsulation -> die extraction
[3] Imaging       -> slide mosaic under the microscope
[4] Stitching    -> Master Dataset (single image)
[5] Layers       -> polishing / delayering + re-imaging every layer
[6] Library      -> standard cell catalog (cells / patterns)
[7] Netlist      -> tracing wires and pads (Deroute)
[8] Verilog      -> "die-perfect" HDL export
[9] EDA schematic-> visualize the netlist in an EDA
[10] Analysis    -> module decomposition, signal naming, tables
[11] Verification-> simulation, tests, cross-check with the community
[12] Docs        -> wiki, books, releases, iterations
```

![chip-perfect-approach](/imgstore/workflow/chip-perfect-approach.png)

*(The "Die-Perfect" approach: the HDL reproduces the original chip netlist as closely as possible — from [breaks](https://github.com/emu-russia/breaks))*

![dmgcpu](/imgstore/workflow/Nintendo_DMG_CPU_1.jpg)

*(The Nintendo DMG-CPU die — the starting point of the [dmgcpu](https://github.com/emu-russia/dmgcpu) research)*

The main goal of nearly every project is a **complete netlist in Verilog, as close to the real
chip as possible** ("die-perfect"). It can then either be "understood" or used "without
understanding" in emulators (see [dmgcpu](https://github.com/emu-russia/dmgcpu),
[Breaknes](https://github.com/emu-russia/breaknes)).

---

## Step 0. Preparation and goal setting

1. Pick the chip and fix the research depth:
   - full transistor netlist (6502 in [breaks](https://github.com/emu-russia/breaks));
   - standard-cell-level netlist (SEGA/Yamaha in [SEGAChips](https://github.com/emu-russia/SEGAChips) —
     "reversing such chips resembles disassembling programs");
   - gate-level logic ([ula](https://github.com/emu-russia/ula), [mappers](https://github.com/emu-russia/mappers));
   - survey of a big SoC ([psxcpu](https://github.com/emu-russia/psxcpu), [dmgcpu](https://github.com/emu-russia/dmgcpu)).
2. Collect **references**: block diagrams, service manuals, patents, other people's
   reverse-engineering, architecture docs. E.g. msinger dmg-schematics and Gekkio gb-schematics
   in [dmgcpu](https://github.com/emu-russia/dmgcpu), zxdesign.info and patent EP0107687B1 in
   [ula](https://github.com/emu-russia/ula), LSI Logic CoreWare docs in [psxcpu](https://github.com/emu-russia/psxcpu).
3. Fix the **terminology** before starting (see "Terminology" below) — it saves endless disputes later.

**Deliverable:** stated goal, reference list, terminology dictionary.

**⚠ Pitfalls:** missing references lead to self-invented signal names; terminology fights
(latch/DFF/FF, PRG/CHR) started after tracing begins eat weeks.

---

## Step 1. Chip and dataset acquisition

1. Find a donor board of the right revision. Fix chip revisions immediately:
   package marking, die revision code (tattoo)
   (CXD8530CQ/CXD8606 revisions and the `90048` tattoo in [psxcpu](https://github.com/emu-russia/psxcpu)).
2. Search for **existing datasets** so you don't redo someone's work:
   dataset links in [breaks](https://github.com/emu-russia/breaks) (visual6502, siliconpr0n, GDrive),
   SEGA datasets in [SEGAChips](https://github.com/emu-russia/SEGAChips),
   mapper datasets in [mappers](https://github.com/emu-russia/mappers).
3. Decide on the reference image — the **Master Dataset** from which the netlist will be reconstructed.

**Deliverable:** the chip (or someone's dataset), recorded revision, imaging plan.

**⚠ Pitfalls (psxcpu):** a wrong-revision die voids weeks: early SCPH-1000 had the old
architecture (3 metal layers) while the study targets `90048`; newer revisions are "rebuilt"
from verilog — tracing comparison across revisions is meaningless.

---

## Step 2. Decapsulation

Fully described in [methods.md](/methods.md). In short:

- **Thermal method (ACID FREE):** gas torch + pliers + a pick; fry the package until only
  grey ash remains; the die falls out.
- **Chemical method (HF):** see [hf.md](/hf.md) — hydrofluoric acid etches glass/silicon,
  mostly used to optically reveal doped regions.

:warning: Observe safety: do not inhale burning plastic fumes, work outdoors or in a fume
hood, protect eyes and hands (see the warnings in methods.md and hf.md).

**Deliverable:** a clean die on a glass slide.

**⚠ Pitfalls:** burnt plastic fumes cause pulmonary edema — outdoors/fume hood only;
acetone is a carcinogen; HF binds calcium — finger cots, mask, calcium at hand;
do not stare into eyepieces for long — light reflects off the die into the retina.

---

## Step 3. Dataset imaging

From [methods.md](/methods.md):

1. Metallurgical microscope (e.g. AmScope) + camera.
2. Slides are captured in an even **"snake" grid** with 5–20% overlap.
3. Ideally a motorized stage with automated focus/capture (saves nerves and re-runs).
4. Every polish (delayering) is imaged as a separate "lap": lap1, lap2, M1, M2...
   (see M1/M2 Fused commits in [psxcpu](https://github.com/emu-russia/psxcpu),
   lap1-4 in [dmgcpu](https://github.com/emu-russia/dmgcpu)).

**Deliverable:** slide sets `0001.jpg ... NNNN.jpg` per layer.

**⚠ Pitfalls (psxcpu):** skipping part of the die in a rush ("right three columns ground
to the bone" — lapping disaster) = holes in the netlist forever; dirty post-etch datasets
are still usable, gaps are not. Focus is a tradeoff: sharp M2 does not see through to M1,
defocus shows M1 but loses detail — shoot both. The 20x M1 lap turned out "practically
useless", only 50x was usable.

---

## Step 4. Stitching — Master Dataset

From [methods.md](/methods.md):

- **Fiji**: `Plugins -> Stitching -> Grid/Collection stitching`, filename pattern `{iiii}.jpg`,
  snake ordering, overlap chosen experimentally.
- **Hugin** — fallback, more manual labor.

**Deliverable:** one Master image per layer (often downscaled for topology work —
[ula](https://github.com/emu-russia/ula): original reduced 4x to ZX_ULA_sm.jpg master).

| Layer master | Example |
|---|---|
| ZX Spectrum ULA | ![ula6c001](/imgstore/workflow/ula6c001.png) |
| PSX CPU overview | ![psxcpu](/imgstore/workflow/psxcpu_overview.jpg) |
| Stitched M2 | ![m2](/imgstore/workflow/psx_m2_fused.jpg) |

**⚠ Pitfalls:** if Fiji does not converge, fix imaging overlap/scale consistency first —
redoing a lap is cheaper than manual fitting in Hugin.

---

## Step 5. Layer work (delayering)

1. Polishing with a Dremel and chromium oxide (GOI) paste, 50–100 nm per session ([methods.md](/methods.md)).
2. Inspect under the microscope and re-image after every session.
3. HF can optically reveal doped regions ([hf.md](/hf.md)).
4. Store every layer (M1, M2, poly, active) in the repository
   (VDP layer polygons in [SEGAChips](https://github.com/emu-russia/SEGAChips),
   M1/M2/Poly in [psxcpu](https://github.com/emu-russia/psxcpu)).

**Deliverable:** complete image set of all die layers.

**⚠ Pitfalls:** chromium oxides from GOI paste are mutagens; over-polishing eats the layer
("lapping disaster" right edge in psxcpu) — one extra short session beats one long one;
glue the die to the slide firmly or it wanders off during polishing.

---

## Step 6. Standard cell library

For standard-cell chips (nearly everything after the 70s) build the **cell catalog** first:

- [Patterns](https://github.com/emu-russia/Patterns) matches library cells against the master
  image and exports coordinates to XML/TXT for Deroute.

  ![patterns workspace](/imgstore/workflow/patterns_workspace.png)
  ![patterns layers](/imgstore/workflow/patterns_layers.png)

- Document cells in `cells.md` with a photo of every cell:
  Yamaha/YM6xxx libraries in [SEGAChips](https://github.com/emu-russia/SEGAChips)
  (`YM_Cells`, `YM6_Cells` — "two-story cells"), CoreWare cells in
  [psxcpu](https://github.com/emu-russia/psxcpu), `cells.md` in
  [dmgcpu](https://github.com/emu-russia/dmgcpu) and [mappers](https://github.com/emu-russia/mappers).
- For simple chips, vectorize the base elements instead of a library
  (`ulabase.v` in [ula](https://github.com/emu-russia/ula)).

**Deliverable:** `cells.md` + pattern database (patterns_db).

**⚠ Pitfalls:** dummies/fillers exist and must be recognized (psxcpu FILLER cell),
but do not "delete everything": in ula peripheral inverters are excluded from the main
netlist, yet one peripheral-cell inverter is genuinely used by the designers in /AE.

---

## Step 7. Netlist extraction (Deroute)

[Deroute](https://github.com/emu-russia/Deroute) untangles wires:

- Operates on "entities" (EntityBox): wires, vias, cells, memory blocks, connectors.
- Two coordinate systems: raster-independent **Lambda** for storage, screen coordinates for display.
- The scene is saved as XML.

![deroute sample](/imgstore/workflow/deroute_sample1.png)

Practical tracing order (from dmgcpu/psxcpu/mappers histories):
**top-level and pads first, then layer by layer (M1, M2...), then decompose into modules**
(`ports.md` -> `netlist m1.xmlz` -> BG/FSM/MUX modules in SEGAChips VDP).

**Deliverable:** netlist (XML) — modules connected by wires.

**⚠ Pitfalls:** set Lambda once (psxcpu: Lambda 6.0, Vias 2, Wire 3) — rescaling breaks
already-placed entities; draw only the outermost vias, mark intermediate ones `x` so
dog-legs do not break wire restoration; power/grounds raise false warnings (Deroute #106),
bidir ports are not floaters (#88).

---

## Step 8. Verilog export

Deroute exports the netlist directly to **Verilog** ("die-perfect", not synthesizable —
the goal is to replicate the original, not to synthesize). See the pipeline in
[ula](https://github.com/emu-russia/ula): netlist -> verilog -> EDA.

**Deliverable:** `chip.v` with original nets.

**⚠ Pitfalls:** HDL and netlist diverge in primitive semantics (2-input NOR in the model
vs the cell library — the ula report); unconnected ports only surface at compile time
(dmgcpu: "Cell not:g2 port x not connected fixed"); floater buses hang without a bus keeper
that exists physically in the original (STAT on the internal DL bus, dmgcpu).

---

## Step 9. EDA visualization

Load the Verilog into an EDA to auto-draw the schematic:
Xilinx PlanAhead draws the schematic from Verilog by itself
([ula](https://github.com/emu-russia/ula), "Design extracted from PlanAhead" in
[dmgcpu](https://github.com/emu-russia/dmgcpu)).

**Deliverable:** a readable schematic for analysis.

**⚠ Pitfalls:** the EDA schematic is flat and noisy — decompose first (step 10),
read carefully after.

---

## Step 10. Analysis and decomposition

1. **Split the flat netlist into functional blocks**, annotate the image:
   annotated ULA map ([ula](/imgstore/workflow/ula6c001_annotated.png)),
   VDP blocks ([SEGAChips](/imgstore/workflow/sega_vdp_modules.jpg)),
   CPU block diagram ([psxcpu](/imgstore/workflow/psxcpu_block.jpg)),
   DMG SoC ([dmgcpu](https://github.com/emu-russia/dmgcpu/blob/main/wiki/soc/Readme.md)).

   ![ula annotated](/imgstore/workflow/ula6c001_annotated.png)

2. **Name signals** with human-readable names, but *without fanaticism*:
   frequent renaming causes errors and confusion ("Renaming a signal does not make it work
   differently" — [dmgcpu](https://github.com/emu-russia/dmgcpu)). Rename in atomic batches
   updating wiki/HDL/tran together (see "PPU Signal rename Wave1" across wiki+HDL+tran in
   [breaks](https://github.com/emu-russia/breaks)).
3. **Signal tables**: name -> from -> where to -> description (clkgen.md as the template in
   dmgcpu, pads/tables in mappers).
4. **Waves**: timing diagrams of key nodes (waves in breaks wiki, waves.png in mappers,
   `ulasim.py` -> `ula_waves.vcd` in ula).

5. Soviet chips example: documentation via a Logisim model and Verilog
   (`vi53.circ`, `wr_edge.v`, PDF report in [SovietChips](https://github.com/emu-russia/SovietChips) for 580VI53).

   ![vi53](/imgstore/workflow/vi53_all.jpg)

**Deliverable:** module analyses, signal dictionaries, waveforms.

**⚠ Pitfalls:** signal renaming is an atomic pass over wiki+HDL+tran at once
(breaks: "PPU Signal rename Wave1" — three PRs in one day); "Renaming a signal does not
make it work differently" (dmgcpu); early eyeball naming breeds false From/Where To rows
that get rewritten later (dmgcpu #330/#363).

---

## Step 11. Verification

- **Testbenches and simulation**: Icarus Verilog + GTKWave (`ula.gtkw` in ula),
  logisim cell models in mappers, PPU standalone testbench in breaks.
- **Structural check** of HDL vs netlist ("HDL-vs-netlist verification" report in
  [ula](https://github.com/emu-russia/ula)).
- **Community cross-check**: compare with msinger/Gekkio (dmgcpu), zxdesign (ula),
  nesdev/forums (breaks, mappers); file issues for discrepancies.
- **Mark unverified facts as unverified** ("unverified technical-report claim" notes in breaks) —
  data honesty beats a pretty story.
- **Test real corner cases**: reading a register while it changes, bus keeper on the internal
  bus (buskeeper/STAT fix in dmgcpu).

**Deliverable:** confirmed netlist + open-questions list.

**⚠ Pitfalls:** naive co-simulation can hang (Icarus hangs in ula) — build a separate
comparison flow; honest "unverified" beats pretty claims (DMC+OAM in breaks);
corner case: reading a register while it changes (STAT AND-effect, dmgcpu).

---

## Step 12. Documentation and iterations

- Wiki sections per module with a **progress table**
  (Topology/Ports/Cells/Netlist/Verilog/Verification — the Progress table in
  [dmgcpu](https://github.com/emu-russia/dmgcpu)).
- Bilingual docs: Russian and English versions; if only Russian remains —
  "use DeepL" (SEGAChips, ula).
- Recompile the wiki into **PDF books** with versioned releases (books in
  [breaks](https://github.com/emu-russia/breaks): 6502/APU/PPU).
- Living tools: utilities evolve alongside the research
  (Deroute: minimap, bulk tools, collaboration; Patterns: exports, cell rows).
- Every project feeds reuse: the CMOS Z80 from SEGAChips "for other systems",
  MBC1 in mappers as a cross-reference for the dmgcpu PPU and vice versa.

**Deliverable:** a reproducible study that another human (or agent) can redo.

**⚠ Pitfalls:** edit LLM boilerplate down to a businesslike style (dmgcpu #363); sections
from different sources duplicate — mark duplicates immediately ("everything will fall into
place over time", psxcpu); a progress table (dmgcpu wiki) turns chaos into a plan.

---

## Terminology

Adopted conventions (from [dmgcpu](https://github.com/emu-russia/dmgcpu) and
[mappers](https://github.com/emu-russia/mappers)):

- **Latch** — static memory element sensitive to level; **DFF** — edge-triggered;
  **FF** — cross-coupled not/nor pair; **DLatch** — dynamic element on gate capacitance (needs refresh).
- **Netlist** — modules connected by wires; building the netlist is the essence of reversing.
- **Lambda** — raster-independent Deroute coordinates.
- **Master Dataset** — the image from which the netlist is reconstructed.
- Address spaces: CPU/PPU, RAM/VRAM/WRAM/PRG/CHR — per [mappers](https://github.com/emu-russia/mappers).

---

## New-chip checklist

```text
[ ] 0  Goal: transistors / cells / gates / survey? References collected?
[ ] 1  Chip/donor found, revision recorded (marking + tattoo)?
[ ] 1  Existing datasets checked (siliconpr0n / visual6502 / GDrive / forums)?
[ ] 2  Decapsulation: thermal or HF? Safety covered?
[ ] 3  Imaging: snake grid, 5-20% overlap, motorized stage?
[ ] 4  Fiji stitching -> Master Dataset, downscaled working image?
[ ] 5  All layers imaged and sorted (poly/M1/M2...)?
[ ] 6  Cell library built (cells.md + patterns_db)?
[ ] 7  Netlist in Deroute: pads -> layers -> modules? XML saved?
[ ] 8  Die-perfect Verilog exported and compiling?
[ ] 9  Schematic drawn in EDA (PlanAhead)?
[ ] 10 Modules named, signal tables filled, waves captured?
[ ] 11 Simulation/tests pass? Community cross-check done? Unverified flagged?
[ ] 12 Wiki sections with progress table, two languages, issues filed?
```

---

## Observations from project histories

- **breaks** (2012→): started as manual transistor-level and PLA analysis ("PLA double checked.
  Errors: 0"), piecewise simulation (ALU, PC, registers), later wiki, books, batch renames and
  HDL refactoring. Lesson: *you can start with paper and Photoshop; the tooling catches up*.
- **Deroute/Patterns**: grew out of PSX GPU/CPU reversing (psxdev) as standalone tools,
  then reused across NES/Game Boy/SEGA. Lesson: *separate tools from data — develop and reuse tools independently*.
- **dmgcpu** (2022→): the typical fast loop: Readme+ports -> netlist M1..M4 -> modules ->
  pads -> tables -> verification with external authors. Lesson: *go from periphery to core,
  layer by layer, tracking progress in a table*.
- **SEGAChips** (2022→): starts with cells.md — cell catalog first, VDP netlists after.
  Lesson: *for standard-cell ICs the netlist begins with the cell catalog*.
- **ula** (2022→): a compact chip without a library — downscaled master, vectorized ulabase.v,
  Deroute, Verilog, PlanAhead, module analysis, simulator. Lesson: *scale the methodology depth to chip complexity*.
- **mappers**: a fleet of small chips — shared terminology and one section style, cell-by-cell
  analysis (nand3, dff2, mux...). Lesson: *a series of similar chips demands strict description standardization*.
- **psxcpu**: assembled from heterogeneous sources (site, forum, wiki) + mandatory die revision
  records. Lesson: *a big SoC is studied iteratively-survey-style; revisions are sacred*.
- **SovietChips**: even for a single chip — the full cycle: datasheet, die photo, Logisim model,
  Verilog, PDF report. Lesson: *the methodology works for Soviet nomenclature too*.

Русская версия: [workflow.md](/specs/workflow.md)
