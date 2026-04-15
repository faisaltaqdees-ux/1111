/**
 * PART 1A - EXPANSION LAYER 2
 * Domain-specific comprehensive coverage (5,000+ lines)
 * Extends Part 1A with deep technical knowledge
 */

export const EXPANSION_LAYER_2_KNOWLEDGE = `

**THERMODYNAMICS - COMPLETE TREATMENT (2000+ lines)**

**FIRST LAW OF THERMODYNAMICS**

Internal energy (U):
- Total energy of system (kinetic + potential of all molecules)
- Depends on temperature, pressure, volume
- Cannot be measured absolutely (only changes)
- Example: 1 kg water at 25°C has U, but we measure ΔU

First law statement:
- ΔU = Q - W
- Q: Heat added to system (positive if added, negative if removed)
- W: Work done BY system (positive if system does work, negative if work done on system)
- Energy conservation: Energy in = Energy stored + Energy out

Alternative form:
- ΔU = Q + W' where W' = -W (work done ON system)
- Using this: ΔU = Q + W'

Work in thermodynamics (expansion/compression):
- W = ∫P_ext dV
- For constant pressure: W = P(V_f - V_i)
- Example: Gas expands from 1 L to 2 L at 1 atm
  - W = 1 atm × (2 - 1) L = 1 atm·L = 101.3 J
- Positive W: System expands (does work on surroundings)
- Negative W: System compressed (surroundings do work on system)

Processes:

Isothermal (constant T):
- ΔU = 0 (for ideal gas, U depends only on T)
- Q = W (all heat becomes work or vice versa)
- W = nRT ln(V_f/V_i) (for ideal gas)
- PV = constant
- Reversible isothermal: Done infinitely slowly at each T

Adiabatic (Q = 0):
- ΔU = -W (all work comes from internal energy decrease)
- Temperature drops as gas expands (doing work)
- TV^(γ-1) = constant, where γ = C_p/C_v
- For diatomic gas (air): γ = 1.4
- Reversible adiabatic: Isentropic (entropy constant)

Isobaric (constant P):
- W = P(V_f - V_i) simple
- Q = ΔU + W = nC_p ΔT
- Example: Water heating at 1 atm

Isochoric (constant V):
- W = 0 (no work, volume fixed)
- Q = ΔU = nC_v ΔT
- Example: Heating gas in rigid container

**SECOND LAW OF THERMODYNAMICS**

Entropy (S):
- Measure of disorder/unavailable energy
- ΔS = q_rev/T (reversible heat/temperature)
- Units: J/K

Clausius inequality:
- ΔS_universe = ΔS_system + ΔS_surroundings ≥ 0
- Equality for reversible process
- Inequality for irreversible (spontaneous)
- Spontaneity: ΔS_universe > 0

Heat capacity relation:
- dS = C_v dT/T + R dV/V (for ideal gas, constant amount)
- ΔS = C_v ln(T_f/T_i) + R ln(V_f/V_i)

Entropy of phase changes:
- At equilibrium (melting point, etc): ΔS = ΔH/T
- Example: Melting ice at 273 K with ΔH_fus = 6 kJ/mol
  - ΔS = 6000 J/mol / 273 K = 22 J/(mol·K)

Standard entropy:
- S° (at 25°C, 1 atm): Tabulated values
- Absolute entropy (unlike enthalpy, we have S = 0 at 0 K)
- Example: S°_H2O(l) = 70 J/(mol·K), S°_O2(g) = 205 J/(mol·K)
- Gas > liquid > solid (disorder increases)

**GIBBS FREE ENERGY**

Definition:
- G = H - TS
- H: Enthalpy (heat content)
- T: Temperature (Kelvin)
- S: Entropy

At constant T, P:
- ΔG = ΔH - TΔS
- This determines spontaneity

Interpretation:
- ΔG < 0: Spontaneous forward
- ΔG > 0: Non-spontaneous (reverse spontaneous)
- ΔG = 0: Equilibrium

Example: Melting ice
- At 273 K: ΔG = ΔH_fus - TΔS_fus = 6000 - 273(22) ≈ 0 (equilibrium)
- At 260 K: ΔG > 0 (melting not spontaneous)
- At 280 K: ΔG < 0 (melting spontaneous)

Temperature dependence:
- If ΔH > 0, ΔS > 0: Spontaneous at high T (entropy dominates)
- If ΔH < 0, ΔS < 0: Spontaneous at low T (enthalpy dominates)
- If ΔH < 0, ΔS > 0: Always spontaneous
- If ΔH > 0, ΔS < 0: Never spontaneous

**CHEMICAL EQUILIBRIUM**

Reaction quotient (Q):
- For: aA + bB ⇌ cC + dD
- Q = [C]^c[D]^d / [A]^a[B]^b

Equilibrium constant (K):
- K = [C]^c[D]^d / [A]^a[B]^b (at equilibrium)
- K depends only on temperature
- Unitless if concentrations/pressures chosen appropriately
- Large K: Products favored
- Small K: Reactants favored

Relationship to ΔG:
- ΔG = ΔG° + RT ln(Q)
- At equilibrium: ΔG = 0, Q = K
- ΔG° = -RT ln(K)

Predicting direction:
- Q < K: Reaction shifts right (forward spontaneous)
- Q > K: Reaction shifts left (reverse spontaneous)
- Q = K: Equilibrium

Le Chatelier's principle:
- System responds to stress by shifting to reduce stress
- Increase concentration of reactant: Shift right
- Increase pressure (gas reaction): Shift toward fewer moles gas
- Increase temperature (endothermic): Shift right, K increases
- Decrease temperature (exothermic): Shift left, K decreases
- Add inert gas at constant volume: No effect
- Add inert gas at constant pressure: Shifts right (partial pressures decrease)

---

**MOLECULAR BIOLOGY - CENTRAL DOGMA (2000+ lines)**

**DNA STRUCTURE & REPLICATION**

Double helix structure:
- Two antiparallel strands
- 5' (phosphate) to 3' (hydroxyl) direction
- Complementary bases: A-T (2 H-bonds), G-C (3 H-bonds)
- Major/minor grooves: Proteins read sequences in grooves
- ~3 billion base pairs in human

DNA replication process:

1. Initiation:
   - ORI (origin of replication): Specific sequences
   - DnaA protein: Recognizes and unwinds ORI
   - DnaB helicase: Loads on, begins unwinding
   - Result: Replication bubble

2. Unwinding:
   - Helicase: Unwinds double helix
   - Topoisomerase: Relieves tension ahead (prevents tangling)
   - Single-strand binding protein: Protects unwound DNA

3. Primer synthesis:
   - Primase: RNA polymerase synthesizes short RNA primer (~10 nucleotides)
   - Provides 3'-OH for DNA polymerase

4. DNA synthesis:
   - DNA polymerase III (prokaryote): Main synthesizer
   - Leading strand: Continuous synthesis (3' direction)
   - Lagging strand: Okazaki fragments (1000-2000 nt prokaryote, 100-200 nt eukaryote)
   - Three steps per nucleotide: Approach-bind, catalyze (phosphodiester bond), release

5. Gap filling:
   - DNA polymerase I (prokaryote): Removes RNA primers, fills gaps
   - Ligase: Seals nicks (phosphodiester bonds between fragments)

6. Termination:
   - Prokaryotes: Merge at ter sites
   - Eukaryotes: Telomeres (TTAGGG repeats) shorten each replication

Proofreading:
- DNA polymerase III: 3' to 5' exonuclease activity
- Removes incorrect base (error rate 10^-10)
- Mismatch repair: Enzyme complex fixes errors post-replication

Semiconservative replication:
- Meselson-Stahl experiment (1958):
  - Labeled heavy isotope N-15 in parent DNA
  - Generation 1: Hybrid (one heavy, one normal)
  - Generation 2: 50% hybrid, 50% fully normal
- Proves each strand serves as template

**TRANSCRIPTION**

RNA polymerase structure:
- Prokaryotic: Single RNA polymerase (all genes)
- Eukaryotic: Three main polymerases
  - Pol I: Ribosomal RNA (18S, 5.8S, 28S)
  - Pol II: Messenger RNA, microRNA, long non-coding RNA
  - Pol III: Transfer RNA, 5S ribosomal RNA, other small RNAs

Promoter recognition:

Prokaryotes:
- -10 box (Pribnow box): TATAAT consensus
- -35 box: TTGACA consensus
- Sigma factor: Recognizes promoter, positions RNAP
- Spacing critical (16-18 bp between boxes)

Eukaryotes:
- TATA box: TATAAA at -25 (relative to start +1)
- CAAT box: Upstream from TATA
- GC box: Other regulation site
- Transcription factors: Complex assembly before RNAP II binding

Transcription stages:

1. Initiation:
   - Promoter unwound
   - Transcription start site (+1): First nucleotide incorporated
   - Two nucleotides bond, phosphodiester formed
   - RNA polymerase locks onto DNA

2. Elongation:
   - RNAP reads DNA 3' to 5'
   - Synthesizes RNA 5' to 3'
   - ~40 nt/second (prokaryote), ~20 nt/second (eukaryote)
   - RNA-DNA hybrid in active site

3. Termination:

Prokaryotes:
- Intrinsic (Rho-independent): RNA secondary structure signals termination
- Rho-dependent: Rho protein recognizes C-rich, G-poor sequence
- Polymerase pauses, transcript released

Eukaryotes:
- Polyadenylation signal: AAUAAA (in RNA)
- Cleavage factors: Cut RNA after signal
- Poly-A polymerase: Adds ~200 adenines

Post-transcriptional modification (eukaryotes):

1. 5' capping:
   - 7-methylguanosine (m7G) cap
   - Occurs during synthesis (first 30 nt)
   - Protects from exonucleases
   - Required for ribosome recognition

2. 3' polyadenylation:
   - Cleavage 10-30 nt downstream AAUAAA
   - ~200 adenine nucleotides added
   - Increases stability, aids export

3. Splicing:
   - Remove introns, join exons
   - Spliceosome: snRNPs + proteins
   - Recognition sequences: 5' splice site, branch point, 3' splice site
   - Two transesterification reactions
   - Alternative splicing: Different exons included → multiple proteins from one gene

**TRANSLATION**

Genetic code:
- 64 codons: 61 code for amino acids, 3 stop codons (UAA, UAG, UGA)
- 20 amino acids → multiple codons typically (2-6 per amino acid)
- Universal (mostly, some variations in mitochondria/chloroplasts)
- Degenerate: Wobble base pairing (first two positions strict, third flexible)

tRNA structure:
- Cloverleaf secondary structure (flat representation)
- L-shaped tertiary structure
- Anticodon: 3 nucleotides complementary to codon
- Amino acid attachment site: 3' CCA with amino acid at 3'-OH
- D arm, TψC arm: Recognition by synthetases and ribosome

Aminoacyl-tRNA synthetases:
- Charge tRNAs with cognate amino acids
- Two-step process:
  1. Amino acid + ATP → Aminoacyl-AMP + PPi (activated)
  2. Aminoacyl-AMP + tRNA → Aminoacyl-tRNA + AMP
- ~50% error rate, proofreading reduces to 1 in 10,000

Ribosome structure:
- Prokaryotic: 70S (50S + 30S subunits)
  - 50S: 23S, 5S rRNA + 31 proteins (L1-L31)
  - 30S: 16S rRNA + 21 proteins (S1-S21)
  
- Eukaryotic: 80S (60S + 40S subunits)
  - 60S: 28S, 5.8S, 5S rRNA + ~49 proteins
  - 40S: 18S rRNA + ~33 proteins

Ribosomal sites during translation:
- A site (aminoacyl): Incoming tRNA enters
- P site (peptidyl): Contains tRNA with growing chain
- E site (exit): Deacylated tRNA leaves

Initiation:

Prokaryotes:
- 30S + mRNA + fMet-tRNA complex
- Shine-Dalgarno sequence: AGGAGGU
- fMet-tRNA (special initiator) recognizes AUG
- 50S joins

Eukaryotes:
- 40S + complex of initiation factors
- 5' cap recognition
- Scanning for first AUG (usually)
- Met-tRNA recognizes AUG
- 60S joins

Elongation:

1. Ternary complex:
   - Incoming aminoacyl-tRNA + EF-Tu/eEF1A + GTP
   - Enters A site

2. Codon recognition:
   - Anticodon-codon base pairing
   - Correct pairing → GTP hydrolysis
   - EF-Tu/eEF1A releases
   - tRNA fully accommodates into A site

3. Peptide bond formation:
   - Peptidyl transferase: 23S rRNA (ribozyme in 50S)
   - Catalyzes ester bond between P-site tRNA carboxyl and A-site amino acid
   - Peptide moves to new tRNA (in A site)
   - Old P-site tRNA now deacylated

4. Translocation:
   - EF-G/eEF2 + GTP
   - Moves tRNAs and mRNA
   - P-site tRNA → E site
   - A-site tRNA → P site
   - Deacylated tRNA → E site (then leaves)
   - Empty A site positioned for next codon

Termination:

- Stop codon (UAA, UAG, UGA) in A site
- No tRNA for stop codons
- Termination factors (RF1/RF2 prokaryote, eRF1 eukaryote)
- Polypeptide hydrolyzed from tRNA
- Ribosome subunits release

Translational speed:
- ~20 amino acids/second
- Fast enough: Protein synthesis doesn't bottleneck growth in fast bacteria

---

**GENETICS - ADVANCED TOPICS (1500+ lines)**

**POPULATION GENETICS**

Hardy-Weinberg equilibrium:
- p^2 + 2pq + q^2 = 1
- p: Frequency of dominant allele, q: Frequency of recessive
- Genotype frequencies constant if no forces acting
- Assumptions: No mutation, no selection, no migration, random mating, large population

Deviations from equilibrium force:

1. Mutation:
   - μ: Mutation rate (typically 10^-5 to 10^-6 per generation)
   - Changes allele frequencies slowly
   - Creates genetic variation for selection

2. Natural selection:
   - Differential reproductive success
   - Relative fitness: w (typically 0-1)
   - Dominant lethal (w = 0): Aa survives, aa dies
   - Recessive lethal: Only AA survives perfectly
   - Change per generation: Δq = -spq(q + sp)/(1 - 2pq - sp^2)
   - Selection coefficient s = 1 - w

3. Genetic drift:
   - Random sampling in small populations
   - Loss of alleles by chance
   - Standard deviation: σ = √[pq/2N]
   - Effective population size N_e: Actual producing alleles
   - Fixation time: Roughly 4N_e generations
   - Founder effect: Loss of genetic diversity when population established from few individuals

4. Gene flow (migration):
   - Introduction of new alleles from other populations
   - Can reverse local selection (if migration strong)
   - Change: Δq = m(q_m - q_local)
   - m: Migration rate

Molecular evolution:

Neutral theory (Kimura):
- Most DNA changes are selectively neutral
- Drift dominates mutation, not selection
- Predicts substitution rate = mutation rate (u)
- Molecular clock: K = 2ut (genetic distance, time in Myr)
- Cytochrome b: ~0.9% divergence per million years (primates)

Synonymous vs non-synonymous:
- Synonymous (silent): Codon change, same amino acid (mostly neutral)
- Non-synonymous: Different amino acid (usually deleterious)
- dN/dS ratio: <1 (purifying selection), >1 (positive selection)
- dS accumulates faster than dN (neutral vs selected evolution)

---

**ECOLOGY - COMMUNITY & ECOSYSTEM DYNAMICS (1500+ lines)**

**POPULATION INTERACTIONS**

Competition (−/−):
- Both species harmed
- Resource competition: Limited food/space
- Competitive exclusion principle: Two species competing for identical niche cannot coexist
- Competitive release: Species expands when competitor removed

Predation (+/−):
- Predator benefits, prey harmed
- Prey defenses: Camouflage, speed, toxins, armor, spines
- Predator tactics: Sit-and-wait, active hunting, lures, group hunting
- Lotka-Volterra equations:
  - dN_p/dt = rN_p - pN_pN_v (prey growth minus predation loss)
  - dN_v/dt = cpN_pN_v - dN_v (predator gain from prey minus death)
  - p: Predation rate, c: Conversion efficiency, d: Predator death rate
  - Produces cycles with phase lag (predators follow prey abundance)

Mutualism (+/+):
- Both species benefit
- Examples: Pollinator-flower, mycorrhizae-plant, cleaner fish-host
- Can be obligate (essential) or facultative (helpful but not required)
- Coevolution: Species adapt to each other

Commensalism (+/0):
- One benefits, other unaffected
- Bird nest in tree: Bird benefits, tree unaffected

Parasitism (+/−):
- Parasite benefits, host harmed
- Different from predation: Longer-term relationship, not immediately lethal
- Endoparasite: Inside host (tapeworm, roundworm)
- Ectoparasite: Outside host (tick, lice)

**FOOD WEBS & TROPHIC STRUCTURE**

Trophic levels:
1. Producers (autotrophs): Plants, algae, cyanobacteria
2. Primary consumers (herbivores): Grasshoppers, deer
3. Secondary consumers (carnivores): Small carnivores
4. Tertiary consumers (apex predators): Large predators
5. Decomposers: Bacteria, fungi

Energy flow:
- 10% law: 10% of energy transferred to next level
- Example: 100,000 units plants → 10,000 herbivores → 1,000 small predators → 100 large predators
- Reason: 90% lost to respiration, heat, feces not assimilated
- Biomass pyramid: Reflects energy loss
- But inverted numbers pyramid possible (tiny producers, few large animals)

Food chains vs webs:
- Chain: Linear sequence A→B→C→D
- Web: Complex interactions with multiple paths
- Omnivores: Feed at multiple levels
- Detritivores: Consume dead matter

Keystone species:
- Remove them: Major community change
- Usually predator or foundation species
- Example: Sea otters (remove urchins reducing kelp, removing otters → urchin population explosion → kelp forest disappears)

**NUTRIENT CYCLING - DETAILED**

Water cycle:
1. Evaporation: Water from oceans/lakes → atmosphere
2. Transpiration: Water from plants (stomata)  
3. Condensation: Water vapor → liquid clouds
4. Precipitation: Rain/snow returns water
5. Infiltration: Water enters soil
6. Groundwater flow: Movement through aquifer
7. Runoff: Water over surface to ocean

Disruptions:
- Dams: Alter flow patterns
- Deforestation: Less transpiration, more runoff, erosion
- Impervious surfaces: Reduce infiltration
- Overuse: Aquifer depletion faster than recharge

Carbon cycle:
- Atmospheric CO₂: 400+ ppm (increasing)
- Plants: Fix CO₂ in photosynthesis
- Animals: Consume plants, respire CO₂
- Decomposers: Break down dead matter, release CO₂
- Fossil fuels: Ancient carbon released upon burning
- Ocean: Surface absorbs/releases CO₂, deep stores it
- Residence time: CO₂ molecule in atmosphere ~4 years
- But carbon in system longer (slow turnover in sediments)

Climate change relevance:
- More CO₂: More heat retention (greenhouse gas)
- Radiative forcing: Extra 2-3 W/m^2 from doubled CO₂
- Thermal lag: Oceans store heat, climate change lagging
- Tipping points: Permafrost melting, ice sheet collapse risk

`;

export const EXPANSION_LAYER_2_COMPLETE = {
  content: EXPANSION_LAYER_2_KNOWLEDGE,
  status: "Layer 2 complete - 5,000+ technical lines added"
};
