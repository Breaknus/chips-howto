# From silicon to a verifiable model

A practical chip research guide drawn from nine emu-russia projects.

[Русский](workflow.ru.md) · [Route](#route) · [Stages](#dossier) · [Checklist](#checklist) · [Sources and history](#evidence)

The purpose of research is to produce something another person can check: locate an element in an image, trace its connections, run a model, and understand the limits of its accuracy. Reconstructing an entire chip is not always necessary. For the first pass, choose a small block with clear inputs and an observable output.

This is an independent synthesis of documentation, artifacts, and selected commits from **breaks, SEGAChips, dmgcpu, Deroute, mappers, SovietChips, ula, psxcpu, and Patterns**, inspected on 5 September 2026. The readiness criteria are this guide's recommendations; project examples have source links. We did not run their HDL or perform hardware experiments. A commit date or title establishes publication history, not a successful test run today.

<a id="route"></a>
## The route: seven deliverables instead of one large promise

| Deliverable | What remains after the work |
| --- | --- |
| 01. Dossier | Exact specimen and revision, research question, block boundary, reference |
| 02. Dataset | Original frames, checked master, layer alignment, defect map |
| 03. Library | Confirmed elements with ports, functions, and orientation rules |
| 04. Netlist | Annotations and structural connections linked to image coordinates |
| 05. Model | Primitive library, executable circuit, testbench, and run conditions |
| 06. Validation | Expected and observed behavior, discrepancies, and coverage limits |
| 07. Publication | A reproducible package with sources, licenses, and open questions |

The main path is **dossier → dataset → library ↔ netlist → model ↔ validation → publication**. Document decisions from day one. On cell-based chips, instance annotation and tracing are iterative; on custom layouts, transistor reconstruction may precede recognition of logic. Test the first module before completing the entire die.

Choose your starting point:

- **Suitable images exist:** check revision and quality and start with the dataset. Decapsulation is not a mandatory stage.
- **A netlist or HDL exists:** check its provenance and start with a small test; return to images when results disagree.
- **Only the chip is available:** prepare a dossier and an imaging plan, including acceptable specimen losses.
- **Repeated cell rows:** investigate types and orientations first. **Irregular logic, memory, or analog circuits:** separate the regions and choose the required detail for each.

Always distinguish four states: **visible in a photo**, **reconstructed from a photo**, **inferred from function**, and **confirmed by a specific test**. A note saying “looks like NAND” must not silently become a confirmed library cell.

<a id="dossier"></a>
## 01. Dossier: define the object and question

**Input:** a chip specimen or published material about it.

1. Photograph the package markings and record the donor, board revision, and pin orientation. When using someone else's images, preserve the original specimen description.
2. Collect the datasheet, pinout, patents, related-chip research, and dataset links. Separate direct knowledge about this revision from assumptions transferred by analogy.
3. Define a testable question: for example, reconstruct a mapper register write or explain a clock divider. Name the output signals and how you will obtain a reference.
4. Mark suspected memory, regular logic, analog regions, pads, and the first module boundary on an overview image. Label provisional names as hypotheses.

![Map of functional blocks on the 6502](../imgstore/guide/breaks-locator.jpg)

*The 6502 map from [breaks][image-breaks] links a functional description to a location on silicon. The selected source does not identify an individual creator for this illustration.*

Scale determines strategy. [MBC1][mappers-mbc1] describes a SHARP gate array with 43 cells, making the entire chip manageable. In [psxcpu][psx-cells], cataloging types and mapping a large number of instances is a separate task. Treat a related foundry's library as a candidate set: a shared manufacturer alone does not confirm pinout or function.

**Output:** a `README.md` containing the dossier and first-module map.

**Ready to proceed when:** revision, scope, expected result, and available reference are clear. If the revision is unknown, say so and keep different specimens' data separate.

<a id="dataset"></a>
## 02. Dataset: preserve what cannot be photographed again

**Input:** existing images or a specimen preparation and imaging plan.

Start by assessing published data. [psxcpu/datasets.md][psx-datasets] distinguishes original frames from stitched images, layers, focus conditions, and defects. Such a register is more useful than a single link to a huge image.

For each set, record the specimen, layer, creator/source, usage conditions, original filenames, dimensions, scale, frame order, processing date, and checksums. Master coordinates, rotation, and mirroring must be unambiguous. Keep originals separate from retouching, reconstructed masks, and annotations. Large files may live in external storage, with a verified copy and a manifest in Git.

### Acquiring and aligning images

The original [chips-howto methods][local-methods] and [dmgcpu methods][dmg-methods] describe metallographic imaging, overlapping frames, Fiji stitching, and successive layer exposure. For a new dataset:

1. Image a small trial region. Check whether the required contacts and conductor boundaries can be resolved.
2. Tune step size, overlap, focus, and lighting on that trial and record the settings. An overlap value from someone else's example does not validate your optics or surface.
3. In Fiji, use `Plugins → Stitching → Grid/Collection stitching` with the actual grid and filename order. First check a small region containing both horizontal and vertical seams.
4. Inspect seams for continuous conductors and duplicated contacts. Save stitching settings and transformations between layers.
5. Before removing the next layer, confirm that the current layer has been fully photographed and the backup opens. Trace uncertain areas while they can still be imaged again.

![Stitched M2 layer of the PlayStation CPU](../imgstore/guide/psx-metal.jpg)

*A reduced M2 master from [psxcpu][image-psx]. The dataset register credits Mikhail (@zeptobars) and an anonymous decapper for different sets; a single creator of this particular derived image has not been established.*

### Specimen preparation and losses

Decapsulation and layer removal are irreversible. Choosing thermal, mechanical, or chemical preparation requires suitable facilities and operator training; acid-free does not mean hazard-free. For this guide, the preparation deliverable is an imageable layer, rather than a particular homebrew recipe.

HF can cause severe systemic poisoning and injuries with delayed pain. Handling it requires an equipped laboratory, an approved procedure, compatible protective equipment, and an emergency response plan; a dust mask or finger cots are not adequate protection. Suspected exposure requires immediate professional medical attention. See [CDC/ATSDR][hf-safety]. For solvents and abrasives, consult the specific product's safety data sheet; for example, [NIOSH][acetone-safety] identifies acetone's flammability, irritation, and central nervous system effects. Old research notes do not replace a current safety procedure.

![Damaged VDP die retaining the PSG region](../imgstore/guide/sega-damage.png)

*In [SEGAChips/VDP/PSG][sega-psg], a damaged die retained an accessible PSG region. The [source illustration][image-sega] shows why usable data coverage should be described separately from the condition of the entire specimen.*

The PSX register records loss of part of M1 during polishing and a separate imaging session. For such events, record coordinates, layer, missing information, and the replacement dataset. If a region is reconstructed from another revision or symmetry, label the hypothesis and its origin.

**Output:** `datasets.md`, original frames, a master for each required layer, and alignment and defect maps.

**Ready when:** another contributor can open the same data, align the layers, and locate every excluded region. An unreadable area remains an open question.

<a id="cells"></a>
## 03. Library: understand an element before annotating it everywhere

**Input:** aligned layers and a map of regular and custom regions.

For cells, record a stable type ID, topology, transistor schematic, logical function, ports and supplies, permitted reflections, and the basis for confidence. For storage elements, add clocking, control polarity, and storage state. For analog regions, define the model boundary instead of replacing the circuit with a logic gate.

[SharpGateArray][mappers-cells] presents cells at different description levels; `buf2` is explicitly marked unconfirmed. This is useful practice: an unknown cell should remain unknown even after being copied to a hundred instances. In [YM6_Cells][sega-cells], two-story cell geometry imposes its own orientation rules; do not generalize them to every CMOS chip.

### What Patterns does

[Patterns][patterns-manual] helps match a selected rectangle to a library. Lambda and Delta account for scale and dimensional tolerance. The user selects the type and orientation; matching dimensions do not prove electrical function.

![Scale and tolerance settings in Patterns](../imgstore/guide/patterns-scale.png)

*Lambda/Delta from the [Patterns manual][image-patterns]. Check scale against several known cells and save it with the workspace.*

Working sequence:

1. Analyze one clearly visible example of a type, checking all available layers and supply connections.
2. Verify its function and ports from a transistor schematic or an independent description. A similar silhouette is only a candidate.
3. Add the type to `patterns_db.txt` and the library images; mark anything unconfirmed.
4. Annotate instances, checking reflections, rows, boundaries, and unusual variants.
5. Save the `.wrk` with the source image and library; check that it opens from another directory. Export coordinates and names as XML for Deroute.

For custom layouts, reconstruct transistors and connections in small regions instead of building a catalog of repeats. Interpret polysilicon crossing an active region in the context of the process and available layers, rather than treating a picture as a universal stencil.

**Output:** a library and instance map, or a transistor-level description of the selected region.

**Ready when:** every used type has a defined function, ports, orientation, and confidence status; exceptions are listed rather than disguised as standard cells.

<a id="netlist"></a>
## 04. Netlist: recover connections with a path back to the image

**Input:** a master image, element library, and module boundary.

Use the concrete sequence in [dmgcpu/netlist][dmg-netlist]: prepare the region's master, annotate ports, place elements, trace interconnects, and export Verilog. Agree on module ports before its internals, so independently reconstructed fragments can be joined.

![DMG-CPU module ports annotated in Deroute](../imgstore/guide/dmg-ports.png)

*Input, output, and bidirectional ports in the [dmgcpu example][image-dmg]. Direction comes from the circuit, not the contact's position in an image.*

In [Deroute][deroute-manual], annotations overlay an image. Module ports use `ViasInput`, `ViasOutput`, and `ViasInout`; elements and conductors are connected in an editable scene. Keep XML/XMLZ next to the export. Do not retain only Verilog: it does not replace geometric annotation.

Check connections at every layer transition. Lines crossing visually without a contact are not connected; even an apparently obvious bus must be traced to its consumers. Record coordinates and a crop for each uncertain location. Power, ground, and bidirectional nets require appropriate semantics rather than arbitrarily assigning a single driver.

Use stable instance and net IDs. Add human-readable names as mappings to them. [dmgcpu][dmg-readme] identifies frequent renaming as a source of errors; when a name changes, update ports, model, documentation, and the mapping together.

**Export is not verification.** [Deroute/GetVerilog.cs][deroute-export] checks some anomalies, including unconnected ports and certain invalid nets. These checks cannot prove that annotations match the photograph. Preserve export diagnostics and explain every warning left unresolved.

**Output:** module annotations, structural Verilog, a port/ID table, and a record of uncertain connections.

**Ready when:** the selected module can be exported again, its elements located in the image, and all boundary ports checked. An unresolved connection prevents claiming a complete netlist for that region, but does not prevent publishing an honestly labeled intermediate result.

<a id="model"></a>
## 05. Model: make the hypothesis executable

**Input:** a structural netlist, cell definitions, and a chosen scenario.

Preserve a structural version before introducing functional modules and descriptive names. The die-perfect goal in [breaks][breaks-hdl] aims to keep HDL close to recovered structure; it is a direction of work, not a certificate of electrical equivalence.

1. Define primitives: combinational logic, latches, flip-flops, bidirectional connections, and memory. Identify stubs.
2. Record assumptions: initial state, reset, time units, clocking, X/Z, delays, and charge storage. Do not replace every unknown with zero merely to obtain an attractive waveform.
3. Create a first-module testbench with an expected result written beforehand. Make clear what observation would disprove the model.
4. Record tool versions, the complete source list, and the command relative to the project root. Preserve the exit status, log, and VCD when useful.
5. Generate a schematic from HDL for reading and comparison. Record its source commit when regenerating it: a derived image can lag behind code.

![MBC1 schematic generated from HDL](../imgstore/guide/mbc1-schematic.png)

*The schematic from [mappers/MBC1][image-mappers] is a useful view of the connections. Its presence alone does not mean tests passed.*

Files in `.circ` format help with interactive exploration; Verilog and testbenches support repeatable checks. Choose the representation for the research question. Producing every kind of model is not required.

**Output:** a runnable model package with explicit assumptions and one meaningful test.

**Ready when:** a clean run reproduces the claimed result or a documented discrepancy. Successful compilation establishes only that the selected source set builds.

<a id="validation"></a>
## 06. Validation: look for where the model fails

**Input:** a model, testbench, and independent basis for expected behavior.

| Check | What it establishes | What it does not establish |
| --- | --- | --- |
| Photo ↔ annotation | Correct reading of selected elements and contacts | Behavior in every mode |
| Structural comparison | Element types, ports, and connections after alias mapping | Equivalence of different storage/state models |
| Stimulus-based simulation | Behavior in that scenario under stated assumptions | Analog accuracy or untested scenarios |
| Reference trace or hardware | Agreement of observed signals in a particular experiment | Correctness of all internal circuitry |

Start with a control scenario, then examine transitions: reset, reads/writes, counter boundaries, consecutive accesses, and bus direction changes. [MMC1/icarus][mappers-test] provides a concrete second-consecutive-write suppression example. Such a test is more useful than a demonstration in which an output merely toggles.

### The ULA lesson: identical wiring does not establish identical dynamics

The [ula report][ula-report] found 519 common gates matching statically; another 142 netlist gates correspond to latches folded into HDL primitives. However, the HDL remained in X in the reported run, and an experiment with changed unknown-state semantics did not complete the dynamic equivalence proof. The authors described Icarus hangs and proposed separate simulations with identical stimuli followed by a log diff. This is a **proposed strategy**, not a completed check.

![Top-level ULA model schematic](../imgstore/guide/ula-schematic.png)

*The [ula/hdl schematic][image-ula]. A clear hierarchical view aids analysis, but validation status comes from a report, not an image.*

When comparing two models, provide identical inputs, startup states, and observed signals. Define allowed phase alignment, X/Z handling, and comparison exclusions separately. Arbitrarily discarding initial cycles can conceal a reset bug. If the simulator hangs, the result is “validation incomplete”; retain the command, version, and a minimal reproducer.

For each discrepancy, decide where to return: images/alignment, cell library, a conductor, a modeling assumption, or the reference. After a correction, repeat the test that exposed it and related scenarios. The report should distinguish a fixed error from an effect still under investigation.

**Output:** a scenario table with expected and observed results, commands, logs, covered regions, and unresolved discrepancies.

**Ready when:** every claim of successful validation is tied to a particular experiment. “All tests passed” must identify the tests and their scope.

<a id="publication"></a>
## 07. Publication: leave a package others can continue

**Input:** research artifacts and a report of what was checked.

This minimal layout is a proposal for a new project, not a mandatory standard shared by all sources:

```text
chip/
  README.md       # specimen, objective, block map, status
  datasets.md     # provenance, layers, scale, defects, checksums
  cells/          # library, ports, functions, uncertainties
  netlist/        # annotations, structural export, ID mappings
  model/          # primitives and functional model
  tests/          # stimuli, expected results, run command
  reports/        # validation results and unresolved discrepancies
  imgstore/       # small illustrations and their provenance
```

Create directories when material exists for them. Large images may live elsewhere, but links, permissions, and checksums must identify the exact version used. Check redistribution permission separately for third-party inputs.

In [SovietChips][soviet-tree], 580ВИ53 research is published as photographs, a PDF, Logisim, and small Verilog examples. It illustrates a package of different artifacts; it does not establish a separate universal decapsulation method or complete test coverage. In breaks, [reconstructed masks][breaks-topo] are explicitly distinguished from fabrication-ready masks: label the intended use of your result just as precisely.

**Output:** a version another contributor can open and continue without a personal explanation from its author.

**Ready when:** a reader can follow **source → image → element/net → model → test → conclusion**. Include licenses, attribution, commands, limitations, and the next testable hypothesis. A new release must not make old logs appear to validate a changed model.

<a id="checklist"></a>
## Checklist for the first working fragment

- [ ] Specimen, revision, target module, and observable result are recorded.
- [ ] Existing datasets were assessed before planning new decapsulation.
- [ ] Original frames are preserved; master, scale, orientation, and defects are described.
- [ ] Elements have defined ports, functions, reflections, and confidence status.
- [ ] Annotations and export refer to the same module and share IDs.
- [ ] Export diagnostics were reviewed; unknown connections are listed.
- [ ] The model builds with recorded versions and initial state.
- [ ] At least one scenario has an expected result defined in advance.
- [ ] Completed, failed, and not-yet-performed checks are listed separately.
- [ ] Another person can locate sources, open the project, and repeat the experiment.

<a id="evidence"></a>
## Sources and history: why the route takes this form

These are selected milestones, not complete project histories. Dates refer to commits. Moving existing material into a repository does not establish when the research itself began. Method and illustration links are pinned to the versions inspected for this guide.

| Project | Verifiable development milestones | What to carry into new work |
| --- | --- | --- |
| **breaks** | [2023-04-01: core HDL refactoring](https://github.com/emu-russia/breaks/commit/27b023e79aff4eaa72353ed8128e4f657c63666f); [2025-11-10: standalone PPU testbench](https://github.com/emu-russia/breaks/commit/362df9b0e25a7b4dc0c60a905498f96807f727a1) | Maintain models and independent testbenches after structural reconstruction. Read [HDL][breaks-hdl] and [topology limitations][breaks-topo]. |
| **SEGAChips** | [2022-09-09: two-story cells](https://github.com/emu-russia/SEGAChips/commit/6ae6ef92b7bf); [2024-06-26: cell 49 added](https://github.com/emu-russia/SEGAChips/commit/c93c2ad35ceb) | Libraries grow during research; geometry and orientation are part of their contract. Read [YM6_Cells][sega-cells] and [PSG reconstruction][sega-psg]. |
| **dmgcpu** | [2022-10-09: seq_netlist ready](https://github.com/emu-russia/dmgcpu/commit/958c7c1dea5baff69b31786c84351efcc3a4985b); [2024-07-09: expansion to SoC research](https://github.com/emu-russia/dmgcpu/commit/c20290419fc0f4190fc5b4dc3f4664af777ec4ce) | Work in verifiable modules and expand scope gradually. Read the [five recovery steps][dmg-netlist] and [physical methods][dmg-methods]. |
| **Deroute** | [2023-01-17: Verilog exporter integration](https://github.com/emu-russia/Deroute/commit/927f86f95a2f); [2024-04-15: sanity check](https://github.com/emu-russia/Deroute/commit/1ec5e7fc975c) | Preserve annotations, exports, and diagnostics as separate artifacts. Read the [manual][deroute-manual] and [exporter][deroute-export]. |
| **mappers** | [2023-06-07: Netlist WIP](https://github.com/emu-russia/mappers/commit/b4874cbfd1b6115c0c31d4de92db9311cc191d20); [2023-06-10: mmc1 test ok](https://github.com/emu-russia/mappers/commit/9fcb4b3b39e922466577d56152488886fa1c034e) | Connect small-chip reconstruction to a meaningful test; a commit title does not replace a new run. Read [cells][mappers-cells] and the [MMC1 testbench][mappers-test]. |
| **SovietChips** | [2025-06-14: repository created](https://github.com/emu-russia/SovietChips/commit/08e309661636); [2025-06-14: initial 580ВИ53 research](https://github.com/emu-russia/SovietChips/commit/2b64738d83768f9edce4935c2581f0002a4c49fa) | Publish a connected set of artifacts without attributing absent methods. Browse the [research contents][soviet-tree]. |
| **ula** | [2024-10-24: first netlist](https://github.com/emu-russia/ula/commit/c75ea3e4f661); [2026-09-04: HDL vs netlist report](https://github.com/emu-russia/ula/commit/a2791c34ded9) | Retain IDs for static comparison and establish dynamic behavior separately. Read the [report with incomplete checks][ula-report]. |
| **psxcpu** | [2022-08-31: M2 fused](https://github.com/emu-russia/psxcpu/commit/7c5ac6810ab8); [2023-10-09: CoreWare RevA2](https://github.com/emu-russia/psxcpu/commit/f5d216d48f2f) | Version the master and library; record layer losses. Read the [dataset register][psx-datasets] and [cell catalog][psx-cells]. |
| **Patterns** | [2022-08-06: moved from psxdev](https://github.com/emu-russia/Patterns/commit/021b70dece72); [2023-10-03: text export](https://github.com/emu-russia/Patterns/commit/23c18cbee74b) | Keep the workspace with its image and transfer annotations between tools. Read the [manual][patterns-manual]. |

### Illustrations and source boundaries

Seven illustrations were copied byte-for-byte from the pinned primary sources above; paths and checksums are in the [image register](../imgstore/guide/README.md). Their repositories declare CC0-1.0. This does not automatically assign that license to every external photograph, dataset, or cited work. Individual authorship is not invented: when unknown, the source repository is credited; the psxcpu caption separately clarifies its dataset credits.

External multi-gigabyte datasets were not downloaded. This work covers available documents, artifacts, and selected changes; it does not certify the complete correctness of each project, availability of every external host, or compatibility of their tools with your OS.

[breaks-hdl]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/HDL/Readme.md
[breaks-topo]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/Topo/Readme.md
[dmg-netlist]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/netlist/Readme.md
[dmg-methods]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/wiki/methods.md
[dmg-readme]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/Readme.md
[mappers-cells]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/SharpGateArray/cells.md
[mappers-mbc1]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MBC1/Readme.md
[mappers-test]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MMC1/icarus/Readme.md
[sega-psg]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/VDP/PSG/Readme.md
[sega-cells]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/YM6_Cells/cells.md
[psx-datasets]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/datasets.md
[psx-cells]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/cells/Readme.md
[deroute-manual]: https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/UserManual/DerouteUserManual.md
[deroute-export]: https://github.com/emu-russia/Deroute/blob/86950a9466f6df8a60ac6c306f60cda4abdb07f0/Deroute/GetVerilog.cs
[patterns-manual]: https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/UserManual/patterns_english.md
[ula-report]: https://github.com/emu-russia/ula/blob/7fafd3939c181559ce3d2932773ea987a33c2bb4/docs/hdl-vs-netlist-verification.md
[local-methods]: https://github.com/emu-russia/chips-howto/blob/a96d0b2f78975db32f33fc00f62c384ec6102f31/methods.md
[image-breaks]: https://github.com/emu-russia/breaks/blob/a378efe01259735813a6edd3dd6090e27ee0ee32/BreakingNESWiki/imgstore/6502/6502_locator.jpg
[image-psx]: https://github.com/emu-russia/psxcpu/blob/df47207c9deed1e9e488c49b8b0c362813102863/imgstore/m2_Fused_sm.jpg
[image-sega]: https://github.com/emu-russia/SEGAChips/blob/1b378b45c8f0a88501ba593cc480dc5159149a8d/VDP/PSG/imgstore/vdp-damaged-chip.png
[image-patterns]: https://github.com/emu-russia/Patterns/blob/6dd2badffa8d5422da66b78d20b7330df30ec5c4/imgstore/lambda_delta.png
[image-dmg]: https://github.com/emu-russia/dmgcpu/blob/f0fbc8f293b1687d22cd157968a49cf6e3b13280/imgstore/shop/netlist2.png
[image-mappers]: https://github.com/emu-russia/mappers/blob/d5bb7ac15363f63ff26762b000a1e76ac7aa9ae4/MBC1/netlist/mbc1_design.png
[image-ula]: https://github.com/emu-russia/ula/blob/7fafd3939c181559ce3d2932773ea987a33c2bb4/hdl/ula_top.png
[soviet-tree]: https://github.com/emu-russia/SovietChips/tree/2b64738d83768f9edce4935c2581f0002a4c49fa/580%D0%92%D0%9853
[hf-safety]: https://wwwn.cdc.gov/TSP/MMG/MMGDetails.aspx?mmgid=1142&toxid=250
[acetone-safety]: https://www.cdc.gov/niosh/npg/npgd0004.html
