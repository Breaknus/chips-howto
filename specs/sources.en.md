# Sources and history of the workflow

[Workflow](workflow.en.md) · [Русский](sources.ru.md)

<a id="scope"></a>

## Scope and research method

All nine repositories named in issue #8 were investigated: their trees, reachable Git histories, READMEs, and selected methodology documents, schematics, and source files. Each repository is pinned to the latest default-branch commit before **2026-09-05 06:42:43 UTC**, when the task was created. File links use full SHAs; branches may change later.

The work was performed independently of chips-howto #8 solutions, without subagents. The chips-howto branch starts at `a96d0b2f78975db32f33fc00f62c384ec6102f31` from 2023. Existing solution text and website material for #8 were not used.

History was studied through commit logs; selected milestones were also checked against changed-file lists. The descriptions below report visible artifacts rather than inferred author motives. Import commits do not date the beginning of an investigation. Hardware models and laboratory procedures were not run while preparing this guide; large external datasets were not downloaded. Existing simulation results are explicitly attributed to their sources.

The shared route and progression criteria are this guide's synthesis. Similarity between projects does not make them a mandatory sequence for every process technology. Practical assumptions, source incompleteness, and a successful check are distinct states.

<a id="snapshots"></a>

## Pinned versions

| Repository | Source-tree SHA | Main contribution |
| --- | --- | --- |
| [breaks](#source-breaks) | [`a378efe01259735813a6edd3dd6090e27ee0ee32`](https://github.com/emu-russia/breaks/tree/a378efe01259735813a6edd3dd6090e27ee0ee32) | Transistors → logic → checkable description |
| [SEGAChips](#source-segachips) | [`1b378b45c8f0a88501ba593cc480dc5159149a8d`](https://github.com/emu-russia/SEGAChips/tree/1b378b45c8f0a88501ba593cc480dc5159149a8d) | Choose a method for each block |
| [dmgcpu](#source-dmgcpu) | [`f0fbc8f293b1687d22cd157968a49cf6e3b13280`](https://github.com/emu-russia/dmgcpu/tree/f0fbc8f293b1687d22cd157968a49cf6e3b13280) | From image frames to a netlist and the first divergence |
| [Deroute](#source-deroute) | [`86950a9466f6df8a60ac6c306f60cda4abdb07f0`](https://github.com/emu-russia/Deroute/tree/86950a9466f6df8a60ac6c306f60cda4abdb07f0) | Editable connectivity and export |
| [mappers](#source-mappers) | [`d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4`](https://github.com/emu-russia/mappers/tree/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4) | A compact example of the complete loop |
| [SovietChips](#source-sovietchips) | [`2b64738d83768f9edce4935c2581f0002a4c49fa`](https://github.com/emu-russia/SovietChips/tree/2b64738d83768f9edce4935c2581f0002a4c49fa) | VI53: compare specimens and test a narrow question |
| [ula](#source-ula) | [`475d40245c478bda1a3a760b0e50be66f2f3f7ff`](https://github.com/emu-russia/ula/tree/475d40245c478bda1a3a760b0e50be66f2f3f7ff) | From a flat circuit to functional modules |
| [psxcpu](#source-psxcpu) | [`df47207c9deed1e9e488c49b8b0c362813102863`](https://github.com/emu-russia/psxcpu/tree/df47207c9deed1e9e488c49b8b0c362813102863) | A large chip: coverage, libraries, semi-automatic tracing |
| [Patterns](#source-patterns) | [`6dd2badffa8d5422da66b78d20b7330df30ec5c4`](https://github.com/emu-russia/Patterns/tree/6dd2badffa8d5422da66b78d20b7330df30ec5c4) | Recognize types before recovering wires |

<a id="source-breaks"></a>

## breaks — Transistors → logic → checkable description

The 6502, APU, and PPU investigation links photographs, transistor circuits, logic schematics, HDL, and documentation. The [README][B1] declares the main research goals complete but separately warns that Wiki and book versions may differ. The [HDL][B3] preserves asynchronous structure and does not target synthesis. This is an example of a chain of representations, not proof that every HDL file is complete.

**What carries over.** Repeat checks when moving between representation levels and keep a [signal mapping table][B5]. The [Klaus test][B4] documents its modified reset vector and success address: even a known test needs an exact configuration.

**Checked history milestones:**

- 2012-08-03 · [`f60d4804`](https://github.com/emu-russia/breaks/commit/f60d48043643df510e9076f2a4b5aa6b0b4a8487) — The repository history starts.
- 2014-11-16 · [`ee95aec7`](https://github.com/emu-russia/breaks/commit/ee95aec722562ff5e47c26583acafb998cffc8d1) — An early Verilog representation of the 6502 is added.
- 2023-05-21 · [`e04c404b`](https://github.com/emu-russia/breaks/commit/e04c404b3804cefec7943ed40f739e50ebe92e39) — A mix-up between LOOPMode and n_IRQEN in APU HDL is corrected; names and polarities need checking.
- 2023-09-19 · [`27e9010c`](https://github.com/emu-russia/breaks/commit/27e9010c933707bfd819e561dce99f192d508594) — Klaus functional tests are added in formats for different models.

<a id="source-segachips"></a>

## SEGAChips — Choose a method for each block

The [overview][S1] spans several families and explicitly defines master dataset, netlist, and Lambda. The [arbiter][S2] illustrates identifying cells from lower layers and upper-metal ports. [Z80][S3] combines manually described inter-block buses with Deroute for cell domains. This is not one completed reverse engineering effort covering all devices: maturity varies by section.

**What carries over.** Separate revisions and libraries; use hybrid tracing where it retains checkable connections. [ArbPatterns][S4] warns that renaming cells breaks old workspaces: version the database and annotations together.

**Checked history milestones:**

- 2022-06-25 · [`8e3f7686`](https://github.com/emu-russia/SEGAChips/commit/8e3f768697b8a940c079c118bd3d1bce31912075) — The initial overview is created.
- 2022-09-26 · [`bb1396da`](https://github.com/emu-russia/SEGAChips/commit/bb1396da7a5f1630c3e544d7990164b45dc24cbd) — HDL for the upper Z80 region appears.
- 2026-07-24 · [`5342cf38`](https://github.com/emu-russia/SEGAChips/commit/5342cf389d4bfa4e3f8d7b16de8ec2609f37b13a) — The Logisim project receives a change labelled NMOS WIP; this is not evidence that the whole Z80 is complete.

<a id="source-dmgcpu"></a>

## dmgcpu — From image frames to a netlist and the first divergence

The [methods][D1] describe imaging, stitching, and annotation; [datasets][D2] distinguish SoC revisions and SM83 imaging sessions; [netlist][D3] walks through one block. The [Icarus workflow][D5] includes commands, test ROMs, FST, and reference-trace comparison. Core tests with a simulated environment are not verification of the entire Game Boy.

**What carries over.** Use a small block as the unit of a complete loop. Read [investigation][D4] with its crossed-out hypotheses in mind: the RET case ended with recovery of an omitted latch, not a tuned delay. Physical preparation descriptions are not treated here as safety instructions.

**Checked history milestones:**

- 2022-09-14 · [`6594c193`](https://github.com/emu-russia/dmgcpu/commit/6594c19386330c721af5e2d460a4a8af0876f732) — The first work-in-progress netlist files.
- 2022-09-16 · [`a67626f1`](https://github.com/emu-russia/dmgcpu/commit/a67626f1705c2efbdb10e241fc78e814d8db2b2f) — Method descriptions and imaging preparation figures are added.
- 2025-01-02 · [`fd00d0b4`](https://github.com/emu-russia/dmgcpu/commit/fd00d0b4bafbb451b58aebfdc27289d4a55f3d96) — A reproducible SM83 testing workflow is documented.
- 2025-03-26 · [`214fe7c8`](https://github.com/emu-russia/dmgcpu/commit/214fe7c8726cab5a4fb40168fe4a563b5b4e3126) — The netlist tutorial is updated with five illustrated stages.

<a id="source-deroute"></a>

## Deroute — Editable connectivity and export

The [MMC1 demo][R1] links a background image, XMLZ scene, and Verilog export. The [manual][R3] covers coordinates, entities, libraries, and Traverse. [GetVerilog.cs][R2] was also read to check validation capabilities: diagnostic messages are not a complete electrical check and depend on port types.

**What carries over.** Keep the scene and library version, then export; check connectivity before interpreting function. Menus and capabilities change, so tie instructions to a version rather than one old screenshot.

**Checked history milestones:**

- 2022-06-25 · [`561a6f91`](https://github.com/emu-russia/Deroute/commit/561a6f915698687615f91ff2316183e97123b781) — Code is moved from psxdev; this starts its history in this repository, not the invention of the tool.
- 2023-01-17 · [`927f86f9`](https://github.com/emu-russia/Deroute/commit/927f86f95a2f083cf855a9b1c5de76abdf06f752) — The GetVerilog script is integrated into the application.
- 2024-05-14 · [`53d0aacb`](https://github.com/emu-russia/Deroute/commit/53d0aacb72f75cb6abed44c291cd35e68bc9b3cd) — Sanity-check messages are added to Verilog export.

<a id="source-mappers"></a>

## mappers — A compact example of the complete loop

[MMC1][M1] brings together the package, die, map, netlist, HDL-derived schematic, and Logisim; the [testbench][M2] adds vectors and an ignored-adjacent-write case. [VRC6][M3] separately records its revision and row geometry. The [ROM dumper][M4] shows that an electrical dump can be a separate data source; verify the actual pinout for your device.

**What carries over.** Start with a small, manageable device; check protocol exceptions as well as ordinary operations. Do not generalize the MMC1 result to every mapper-chip revision.

**Checked history milestones:**

- 2023-06-07 · [`b4874cbf`](https://github.com/emu-russia/mappers/commit/b4874cbfd1b6115c0c31d4de92db9311cc191d20) — A work-in-progress MMC1 scene and netlist source are added.
- 2023-06-10 · [`9fcb4b3b`](https://github.com/emu-russia/mappers/commit/9fcb4b3b39e922466577d56152488886fa1c034e) — Cells and the testbench are updated; the author labels the commit test ok.
- 2023-06-11 · [`055d5cbd`](https://github.com/emu-russia/mappers/commit/055d5cbda40ca3de1d4056ba719e9555222f31ac) — A write-with-skip test is added.
- 2023-06-24 · [`711d65a8`](https://github.com/emu-russia/mappers/commit/711d65a85fcaf1c10626cc40cee5df74f9f9ef91) — The investigated MMC1A is renamed to letterless MMC1.

<a id="source-sovietchips"></a>

## SovietChips — VI53: compare specimens and test a narrow question

The pinned tree contains eight files, only two commits, and no README. The main source is the 42-page [“Studying 580VI53” PDF, revision C3, org, 2025][V1]. The methodology sections, especially pp. 5–10, and the example on p. 15 were read; figures on pp. 10 and 15, the CW schematic, and [wr_edge.v][V2] were inspected. A Logisim project is also present. Two commits cannot reconstruct the sequence of the entire laboratory investigation.

**What carries over.** Pages 5–7 compare three channels, the Soviet chip, Intel 8253, and an additional specimen used to clarify diffusion. Similarity helped avoid metal removal in this specific case; differences were retained. On p. 15, a model with illustrative delays checks wr_edge polarity. This is a useful example of a bounded conclusion, not a timing measurement.

**Checked history milestones:**

- 2025-06-14 · [`08e30966`](https://github.com/emu-russia/SovietChips/commit/08e309661636b20575be26021a4afc2eaa599e2c) — The repository is created.
- 2025-06-14 · [`2b64738d`](https://github.com/emu-russia/SovietChips/commit/2b64738d83768f9edce4935c2581f0002a4c49fa) — The VI53 package is imported in one commit: PDF, schematics, and a local Verilog check.

<a id="source-ula"></a>

## ula — From a flat circuit to functional modules

The [README][U1] explicitly describes the loop: image → elements → Deroute → Verilog → EDA schematic → analysis and another export. [Topology][U2] identifies the bipolar process; [HDL][U3] explains replacing some storage loops with primitives and extracting modules. [VCounter][U4] shows why physically scattered gates are difficult to group into identical bits.

**What carries over.** Keep original net identifiers during decomposition. Check reused gates, exceptional bits, clocks, and resets. The existence of a higher-level model does not establish its behavioural equivalence; it was not run as part of this work.

**Checked history milestones:**

- 2024-10-24 · [`c75ea3e4`](https://github.com/emu-russia/ula/commit/c75ea3e4f66131de8ca2c9214fd0d900688a8670) — The netlist is added.
- 2024-10-25 · [`06e1962f`](https://github.com/emu-russia/ula/commit/06e1962fd4e968062ce9b1bd10e456cb8aa47979) — An Icarus testbench is added the next day.
- 2024-11-04 · [`5169bd3b`](https://github.com/emu-russia/ula/commit/5169bd3b773521d10ed3722323d25bf65e8a4545) — The top level of the reorganized HDL model is added.
- 2026-04-25 · [`764d4301`](https://github.com/emu-russia/ula/commit/764d4301f4502fed353f7e98f10558d2a02337b3) — A VCounter bit analysis is added roughly a year and a half after the original netlist.

<a id="source-psxcpu"></a>

## psxcpu — A large chip: coverage, libraries, semi-automatic tracing

[Datasets][P1] separate raw and cooked material, multiple focus settings and M1 sessions, patches, and missing coverage. The [library][P2] describes cell variants, orientations, and lookalikes. The [netlist][P3] uses a master dataset, outermost vias, and separate bend segments. Its progress section explicitly describes limited tracing progress.

**What carries over.** Establish a stable coordinate system and library before processing bounded areas. Incomplete imagery and an incomplete netlist are different limitations and need separate tracking. Importing an old Wiki does not independently validate every imported claim ([README warning][P4]).

**Checked history milestones:**

- 2022-08-10 · [`f1018922`](https://github.com/emu-russia/psxcpu/commit/f101892203124a91c137f3a62ce1bf575a6464b3) — Material is moved from psxdev.
- 2022-08-26 · [`464ced73`](https://github.com/emu-russia/psxcpu/commit/464ced737f81b4a800c051a3e19eae88e4a4bb94) — The PatternsPSXCPU database is added.
- 2022-09-06 · [`1f6347c0`](https://github.com/emu-russia/psxcpu/commit/1f6347c0e7b7e22331162d89509b01c2cc5fed39) — An M2 netlist scene is added.
- 2025-05-13 · [`85bd9f7c`](https://github.com/emu-russia/psxcpu/commit/85bd9f7c8c4dcae2c9927f8a7b714959ae2e7276) — A CA poly image and remaining-cell material are added; this is not completion of the CPU netlist.

<a id="source-patterns"></a>

## Patterns — Recognize types before recovering wires

The [manual][T1] describes a JPEG background, library, Lambda/Delta, flip/mirror, rows, and workspace saving. History records horizontal-row support and the return of text export. The tool speeds up choosing and placing patterns; matching images does not produce a complete functional netlist.

**What carries over.** Keep the database version alongside the `.wrk`, check scale and orientation, then use the placement for connectivity work. Do not confuse placed-pattern counts with verified connections.

**Checked history milestones:**

- 2022-08-06 · [`021b70de`](https://github.com/emu-russia/Patterns/commit/021b70dece72fd50010372be1e1d408ba6b92ac8) — The utility is moved from psxdev.
- 2022-08-06 · [`3496077c`](https://github.com/emu-russia/Patterns/commit/3496077c24bb161a747a4f444c458c48da0f1c06) — Horizontal-row support is added.
- 2023-10-02 · [`a839c468`](https://github.com/emu-russia/Patterns/commit/a839c468bd039c72d208d2aa52e2ce0de59f8e65) — Text export is restored.

<a id="images"></a>

## Illustrations and rights

Seven illustrations were copied byte-for-byte into `imgstore/workflow/`. Publication copies are in `docs/imgstore/workflow/` so GitHub Pages works when only `/docs` is published. The [manifest](../imgstore/workflow/provenance.json) records the source path, full SHA, size, and SHA-256 of each file. Root licenses of all nine pinned repositories are CC0-1.0; image provenance is retained below.

| File | Source | Attribution / purpose |
| --- | --- | --- |
| [psxcpu-metal.jpg](../imgstore/workflow/psxcpu-metal.jpg) | [psxcpu: imgstore/m2_Fused_sm.jpg](https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/imgstore/m2_Fused_sm.jpg) | psxcpu; its datasets page credits an anonymous decapper for the second M2/M1 set. Die overview. |
| [microscope-tiles.jpg](../imgstore/workflow/microscope-tiles.jpg) | [dmgcpu: imgstore/shop/dataset.jpg](https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/imgstore/shop/dataset.jpg) | dmgcpu, imaging-method illustration. |
| [patterns-workspace.png](../imgstore/workflow/patterns-workspace.png) | [Patterns: imgstore/workspace.png](https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/imgstore/workspace.png) | Patterns authors; cell-recognition workspace. |
| [deroute-interconnects.png](../imgstore/workflow/deroute-interconnects.png) | [dmgcpu: imgstore/shop/netlist4.png](https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/imgstore/shop/netlist4.png) | dmgcpu, block recovery tutorial in Deroute. |
| [chip-perfect.png](../imgstore/workflow/chip-perfect.png) | [breaks: HDL/Design/chip-perfect-approach.png](https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/HDL/Design/chip-perfect-approach.png) | breaks, illustration of the authors’ die-perfect approach. |
| [mmc1-write-waves.png](../imgstore/workflow/mmc1-write-waves.png) | [mappers: MMC1/icarus/waves_ignored.png](https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MMC1/icarus/waves_ignored.png) | mappers, output of the source MMC1 testbench. |
| [vi53-control-word.png](../imgstore/workflow/vi53-control-word.png) | [SovietChips: 580ВИ53/cw.png](https://github.com/emu-russia/SovietChips/blob/2b64738d83768f9edce4935c2581f0002a4c49fa/580%D0%92%D0%9853/cw.png) | SovietChips, VI53 research package; PDF credited to org, 2025. |

Source licenses: [Deroute](https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/LICENSE), [Patterns](https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/LICENSE), [SEGAChips](https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/LICENSE), [SovietChips](https://github.com/emu-russia/SovietChips/blob/2b64738d83768f9edce4935c2581f0002a4c49fa/LICENSE), [breaks](https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/LICENSE), [dmgcpu](https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/LICENSE), [mappers](https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/LICENSE), [psxcpu](https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/LICENSE), [ula](https://github.com/emu-russia/ula/blob/475d40245c478bda1a3a760b0e50be66f2f3f7ff/LICENSE).

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
