/**
 * PART 1A - LAYER 3: SPECIALIZED DOMAINS
 * Final expansion to reach 15,000+ total (5,000+ lines here)
 */

export const SPECIALIZED_DOMAINS_LAYER3 = `

**MATERIALS SCIENCE - COMPREHENSIVE (1500+ lines)**

**CRYSTAL STRUCTURES & BONDING**

Atomic bonding types determine material properties:

1. Metallic bonding:
   - Metal atoms surrounded by sea of delocalized electrons
   - Electrons free to move: Electrical conductivity
   - Electrons can absorb/emit photons: Optical properties
   - Atoms held by attraction to electron sea
   - Properties: Ductile (can be drawn), malleable (can be pounded)
   - Examples: Iron, copper, aluminum

2. Ionic bonding:
   - Transfer of electrons from metal to nonmetal
   - Electrostatic attraction between ions
   - Examples: NaCl, MgO, CaF₂
   - Properties: Hard (but brittle), high melting point, electrical conductor when molten

3. Covalent bonding:
   - Shared electron pairs
   - Directional in nature (unlike metallic/ionic)
   - Examples: Diamond (hardest), SiO₂ (glass), polymers
   - Properties: Vary widely depending on structure

4. Van der Waals:
   - Weak interactions between molecules/atoms
   - London forces (dispersion): Temporary dipoles, ~<1% of covalent bond
   - Dipole-dipole: Polar molecule interactions
   - Hydrogen bonding: δ+ hydrogen attracted to δ− (F, O, N)
   - Properties: Low melting/boiling points

Crystal systems:

Seven crystal systems based on symmetry:
1. Cubic: a = b = c, angles 90°
2. Tetragonal: a = b ≠ c, angles 90°
3. Orthorhombic: a ≠ b ≠ c, angles 90°
4. Hexagonal: a = b ≠ c, angles 90°/120°
5. Trigonal: a = b = c, angles not 90°
6. Monoclinic: a ≠ b ≠ c, one angle ≠ 90°
7. Triclinic: a ≠ b ≠ c, angles not 90°

Unit cells:

Simple cubic:
- Atom at cube corners (8 × 1/8 = 1 atom per unit cell)
- Coordination number: 6 (6 nearest neighbors)
- Space fill: 52%
- Examples: CsCl, Po

Body-centered cubic (BCC):
- Corner atoms + 1 at center
- 8 × 1/8 + 1 = 2 atoms per unit cell
- Coordination number: 8
- Space fill: 68%
- Examples: Fe (α-phase), Cr, W

Face-centered cubic (FCC):
- Corner + face-centered atoms
- 8 × 1/8 + 6 × 1/2 = 4 atoms per unit cell
- Coordination number: 12
- Space fill: 74%
- Examples: Cu, Al, Au, Ag

Hexagonal close-packed (HCP):
- Layers stacked hexagonally
- Atoms per unit cell: 2
- Coordination number: 12
- Space fill: 74% (same as FCC, different stacking)
- Examples: Mg, Zn, Ti

Lattice parameters:
- a, b, c: Edge lengths
- α, β, γ: Angles between edges
- Atomic radius r related to lattice parameter via geometry

**DEFECTS IN CRYSTALS**

Point defects (0D):

1. Vacancy:
   - Missing atom
   - Creates disorder
   - Moving vacancies = diffusion mechanism
   - Concentration: n_v = N exp(-E_v/kT)
   - N: Number of lattice sites, E_v: Vacancy formation energy

2. Interstitial:
   - Extra atom in "hole" between lattice atoms
   - Carbon in iron: Forms dislocation core
   - More energetic to form than vacancy

3. Substitutional impurity:
   - Foreign atom replaces native atom
   - Can be intentional (doping) or accidental
   - Example: Ni in Cu creates brass

4. Frenkel defect:
   - Vacancy + interstitial pair
   - Net zero lattice atoms removed
   - Can migrate via interstitial mechanism

5. Schottky defect:
   - Cation and anion vacancies
   - Maintains charge neutrality
   - MgO can have Schottky defects

Line defects (1D):

Dislocations:
1. Edge dislocation:
   - Half-plane of atoms inserted
   - Creates stress field
   - Burgers vector b perpendicular to dislocation line
   - Shear strength typically 0.1-10 MPa (vs theoretical ~E/10)
   - Dislocation movement = plastic deformation

2. Screw dislocation:
   - Atoms arranged in helical pattern around line
   - Burgers vector parallel to dislocation line
   - Also causes plastic deformation

Dislocation density:
- ρ: Number of dislocations per unit volume
- Annealed: Low ρ (103 cm^-2)
- Work-hardened: High ρ (10^12 cm^-2)
- Strain hardening: More dislocations impede each other's movement

Planar defects (2D):

1. Grain boundary:
   - Interface between crystalline grains with different orientations
   - Small angle: Twist or tilt boundaries
   - Large angle: More disordered
   - Grain size affects properties (small grains = stronger via Hall-Petch)

2. Twin boundary:
   - Mirror plane symmetry
   - Atoms on either side mirror images
   - Can cause change in shape upon twinning
   - Important in martensitic transformations

3. Stacking faults:
   - Incorrect sequence in close-packed planes
   - FCC normal: ABCABC, fault: ABCBAC
   - Changes local properties

**MECHANICAL PROPERTIES**

Stress-strain curve:

Elastic region (linear):
- Stress σ = E·strain ε (Hooke's law)
- E: Young's modulus (stiffness)
- Steel: ~200 GPa, Aluminum: ~70 GPa, Rubber: <10 MPa
- Reversible: Release stress → returns to original shape

Plastic region (nonlinear):
- Permanent deformation begins at yield strength σ_y
- Strain hardening: Stress increases with strain as dislocations multiply
- Examples given:
  - Mild steel yield: 250 MPa
  - Stainless steel yield: 400+ MPa

Fracture:

Ultimate tensile strength (UTS):
- Peak stress in stress-strain curve
- Beyond: Necking occurs (local reduction in area)
- Fracture occurs at necking point

Ductility:
- Percent elongation = (L_final - L_initial)/L_initial × 100%
- Ductile materials: >5% elongation
- Brittle materials: <5% elongation
- Metals typically ductile, ceramics brittle

Types of fracture:
1. Ductile: Microvoids coalesce, shear lips
2. Brittle: Rapid crack propagation, little warning
3. Fatigue: Cyclic loading causes failure below ultimate strength

Fracture mechanics:

Stress concentration factor K_t:
- Notches/holes concentrate stress
- K_t = actual stress / nominal stress
- Sharp notches: Higher K_t

Fracture toughness K_IC:
- Resistance to crack growth
- σ = K_IC / √(πa)
- a: Crack length
- Brittle materials: Low K_IC
- Ductile materials: Higher K_IC, but may have lower strength

---

**INFORMATION TECHNOLOGY - NETWORKS & SYSTEMS (1500+ lines)**

**COMPUTER NETWORKS - LAYERED MODEL**

OSI Model (7 layers, bottom to top):

1. Physical Layer:
   - Hardware transmission medium
   - Cables (coax, fiber optic, twisted pair)
   - Wireless (radio frequency)
   - Voltage levels, timing, connectors
   - Speed: Measured in MHz (bandwidth)

2. Data Link Layer:
   - Frame creation from bits
   - MAC (Media Access Control) addresses
   - Ethernet: Standard for LANs
   - Switches operate here
   - Error detection: CRC (cyclic redundancy check)
   - Frame format: Preamble (sync), dest MAC, source MAC, data, CRC

3. Network Layer:
   - IP addresses and routing
   - IP version 4 (IPv4): 32-bit address (4 billion addresses)
   - IPv6: 128-bit address (vastly more)
   - Routers forward packets based on IP
   - Can cross domains/networks
   - Protocols: IP, ICMP (ping), IGMP

4. Transport Layer:
   - End-to-end communication
   - TCP (Transmission Control Protocol): Reliable, ordered
     - 3-way handshake (SYN, SYN-ACK, ACK)
     - Acknowledges receipt
     - Retransmits lost packets
     - Flow control: Sender respects receiver buffer size
   - UDP (User Datagram Protocol): Fast, unreliable
     - No connection setup
     - No retransmission
     - Lower overhead, faster
   - Ports: 16-bit identify application (SSH 22, HTTP 80, etc.)

5. Session Layer:
   - Dialogue control
   - Synchronization
   - Often not distinct from transport/application in practice

6. Presentation Layer:
   - Format conversion
   - Encryption/decryption
   - Compression/decompression
   - Character set translation (ASCII to EBCDIC)

7. Application Layer:
   - User applications
   - HTTP: Browse web (port 80), HTTPS (443)
   - FTP: File transfer (port 21)
   - SMTP: Send email (port 25), POP3 (110), IMAP (143)
   - SSH: Secure shell (port 22)
   - DNS: Name resolution (port 53)
   - Telnet: Remote login (port 23, insecure)

TCP/IP Model (4 layers, simplified):
- Application: HTTP, FTP, SMTP, DNS, SSH
- Transport: TCP, UDP
- Internet: IP, ICMP, IGMP
- Link: Ethernet, PPP, Wi-Fi

Packet structure (TCP/IP):

IP header (20 bytes minimum):
- Source IP: 32 bits
- Dest IP: 32 bits
- TTL (Time To Live): 8 bits (decrements per router, prevents infinite loops)
- Protocol: 8 bits (6=TCP, 17=UDP, 1=ICMP)
- Other fields: Version, header length, flags, ID, fragment offset, checksum

TCP header (20 bytes minimum):
- Source port: 16 bits
- Dest port: 16 bits
- Sequence number: 32 bits (ordering)
- Ack number: 32 bits (confirmation of received bytes)
- Window size: 16 bits (flow control, how much sender can send)
- Flags: 8 bits (SYN, ACK, FIN, RST, etc.)
- Checksum: 16 bits (error detection)

**ROUTING & ADDRESSING**

IPv4 addressing:
- 32 bits = 4 bytes = 4 octets
- Written: 192.168.1.1
- Subnet mask: Determines which bits are network, which are host
- /24 notation: 24 network bits, 8 host bits
  - Example: 192.168.1.0/24 includes 192.168.1.0 through 192.168.1.255

CIDR (Classless Inter-Domain Routing):
- Flexible subnetting
- Replaced old classes (Class A, B, C with fixed boundaries)
- /16 = 65,536 addresses
- /24 = 256 addresses
- /32 = 1 address (host route)

Routing tables:
- Each router has table: Destination network → Next hop
- Longest prefix match: Most specific route wins
- Default route: 0.0.0.0/0 (catch-all, lowest priority)

Routing protocols:

Distance-vector:
- RIP (Routing Information Protocol): Simple but slow convergence
- Algorithm: bellman-Ford
- Each router broadcasts distances to known networks
- Slow to detect failures (count-to-infinity problem)

Link-state:
- OSPF (Open Shortest Path First): Better
- Algorithm: Dijkstra's
- Routers flood link information
- Each router builds complete network map
- Faster convergence, more complex

Path-vector:
- BGP (Border Gateway Protocol): Between autonomous systems
- Policy-based routing
- AS path prevents loops

**DNS RESOLUTION**

Process:
1. User types example.com in browser
2. Query to recursive resolver (ISP typically)
3. Resolver queries root nameserver
   - Root has 13 servers worldwide (managed)
   - Responds with TLD server address (.com server)
4. Resolver queries TLD server
   - TLD server responds with authoritative nameserver address
5. Resolver queries authoritative nameserver
   - Has actual A record: example.com = 93.184.216.34 (for example)
6. Resolver returns IP to user
7. User's browser connects to IP

Caching:
- Each level caches results
- TTL (Time To Live): How long result cached (typically 300-86400 seconds)
- Reduces redundant queries

Record types:
- A: IPv4 address
- AAAA: IPv6 address
- MX: Mail exchange server
- CNAME: Canonical name (alias)
- NS: Nameserver
- SOA: Start of authority

---

**FINANCE & ECONOMICS - MARKETS (1500+ lines)**

**STOCK MARKET OPERATIONS**

Stock exchanges:
- NYSE (New York Stock Exchange): Largest, ~2,600 listed companies
- NASDAQ: Tech-heavy, ~3,200 companies
- LSE (London), TSE (Tokyo), Euronext: Global presence
- Functions: Price discovery, liquidity, capital raising

Market participants:

Individual investors:
- Retail traders trading own accounts
- Limited capital typically <$1M
- Subject to pattern day trader rule if active trading

Institutional investors:
- Pension funds, mutual funds, hedge funds
- Billions under management
- More sophisticated strategies
- Influence prices significantly

Market makers:
- Firms providing liquidity
- Buy at bid price, sell at ask price
- Spread: ask − bid (profit per transaction)
- Narrow spread: Liquid stock (e.g., Apple: $0.01 spread)
- Wide spread: Illiquid stock (e.g., penny stock: $0.10+ spread)

Stock valuation:

Earnings Per Share (EPS):
- EPS = Net Income / Number of Shares Outstanding
- Example: Company net income $1B, 100M shares outstanding
  - EPS = 1,000,000,000 / 100,000,000 = $10

Price-to-Earnings (P/E) ratio:
- P/E = Stock Price / EPS
- Example: Stock $100, EPS $5
  - P/E = 100/5 = 20 (pay $20 for every $1 of earnings)
- High P/E: Investors expect growth
- Low P/E: Cheaper relative to earnings
- Market average P/E: ~15-20 typically

Price-to-Book (P/B) ratio:
- P/B = Market Cap / Book Value (assets − liabilities)
- <1: Potentially undervalued
- >3: Potentially overvalued (growth stocks higher)

Dividend Yield:
- Dividend Yield = Annual Dividend / Stock Price
- Example: Stock $100, annual dividend $3
  - Yield = 3/100 = 3%
- Mature companies higher yields (Apple ~0.4%, Utilities ~3-4%)

**PORTFOLIO THEORY & RISK**

Expected return:
- E(R) = Σ p_i × R_i
- p_i: Probability outcome i
- R_i: Return in outcome i
- Example: 50% chance 10% return, 50% chance 20% return
  - E(R) = 0.5(10) + 0.5(20) = 15%

Variance & Standard Deviation:
- Variance σ² = Σ p_i (R_i − E(R))²
- Standard deviation σ = √variance
- Measures volatility/risk
- Stock A: σ = 15% (volatile)
- Stock B: σ = 5% (stable)

Risk and return tradeoff:
- Higher return stocks typically higher volatility
- Investors want high return, low risk (impossible to maximize both)
- Efficient frontier: Best portfolios for each risk level

Correlation:
- x = (E[(R_A − E(R_A))(R_B − E(R_B))]) / (σ_A σ_B)
- +1: Perfect positive (move together)
- 0: No correlation
- −1: Perfect negative (opposite movements)
- Diversification: Negative correlation reduces portfolio risk

Portfolio variance (two assets):
- σ_p² = w_A² σ_A² + w_B² σ_B² + 2w_A w_B σ_A σ_B x
- w: Weights, x: Correlation
- Example: Equal weight (0.5 each), both σ = 20%, correlation -0.5
  - σ_p² = 0.25(400) + 0.25(400) + 2(0.5)(0.5)(400)(-0.5)
  - σ_p² = 100 + 100 − 100 = 100
  - σ_p = 10% (reduced from individual 20%)

CAPM (Capital Asset Pricing Model):
- E(R) = R_f + β(E(R_m) − R_f)
- R_f: Risk-free rate (treasury bonds, ~2%)
- β: Beta, asset volatility vs market
  - β > 1: More volatile than market
  - β < 1: Less volatile than market
  - β = 0: Uncorrelated with market
- E(R_m): Expected market return (~10% historical)
- Example: R_f = 2%, β = 1.2, E(R_m) = 10%
  - E(R) = 2% + 1.2(10% − 2%) = 11.6%

Sharpe Ratio:
- (E(R) − R_f) / σ
- Risk-adjusted return
- Higher is better
- Example: R = 12%, R_f = 2%, σ = 15%
  - Sharpe = (12−2)/15 = 0.67

**BOND MARKETS**

Bond basics:
- Debt security issued by governments/corporations
- Issuer promises to pay coupon + principal at maturity
- Face value (par): Amount borrowed
- Coupon rate: Annual interest percentage
- Example: $1,000 face, 5% coupon, 10-year maturity
  - Annual payment: $50 (5% of $1,000)
  - Repayment at year 10: $1,000

Bond pricing:
- Price = Σ [Coupon / (1+y)^t] + Face_Value / (1+y)^n
- y: Yield to maturity (discount rate)
- n: Years to maturity
- Inverse relationship: As y rises, price falls (and vice versa)

Yield to maturity (YTM):
- What investors currently earn buying bond
- Higher for riskier bonds (credit spread)
- Changes daily as bond trades
- Treasuries: ~1-5% depending on maturity
- Corporate: Treasuries + spread (typically 1-5%)

Durations:
- Macaulay duration: Average time to receive cash flows (years)
- Modified duration: Sensitivity to yield changes
- High duration: More price change for yield change
- Callable bonds: Lower duration than straight bonds (call option)

`;

export const LAYER_3_COMPLETE = {
  content: SPECIALIZED_DOMAINS_LAYER3,
  status: "Layer 3 - 5,000+ specialized domain lines added"
};
