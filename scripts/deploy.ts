import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying PSL Pulse Smart Contracts to WireFluid Testnet...\n");
  
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deploying from account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} WIRE\n`);

  // ─────────────── DEPLOY PSLImpactMarket ───────────────
  console.log("1️⃣  Deploying PSLImpactMarket...");
  const PSLImpactMarket = await ethers.getContractFactory("PSLImpactMarket");
  const pslMarket = await PSLImpactMarket.deploy();
  await pslMarket.waitForDeployment();
  const marketAddress = await pslMarket.getAddress();
  console.log(`✅ PSLImpactMarket deployed to: ${marketAddress}`);
  console.log(`📜 Tx Hash: ${pslMarket.deploymentTransaction()?.hash}\n`);

  // ─────────────── DEPLOY ImpactBadge ───────────────
  console.log("2️⃣  Deploying ImpactBadge (ERC-721)...");
  const ImpactBadge = await ethers.getContractFactory("ImpactBadge");
  const badge = await ImpactBadge.deploy();
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log(`✅ ImpactBadge deployed to: ${badgeAddress}`);
  console.log(`📜 Tx Hash: ${badge.deploymentTransaction()?.hash}\n`);

  // ─────────────── DEPLOY PSLTicket ───────────────
  console.log("3️⃣  Deploying PSLTicket (ERC-721)...");
  const PSLTicket = await ethers.getContractFactory("PSLTicket");
  const ticket = await PSLTicket.deploy();
  await ticket.waitForDeployment();
  const ticketAddress = await ticket.getAddress();
  console.log(`✅ PSLTicket deployed to: ${ticketAddress}`);
  console.log(`📜 Tx Hash: ${ticket.deploymentTransaction()?.hash}\n`);

  // ─────────────── SETUP ROLES ───────────────
  console.log("🔐 Setting up roles...");
  
  // Grant MINTER role to deployer on ImpactBadge
  const grantBadgeMinterTx = await badge.grantMinterRole(deployer.address);
  await grantBadgeMinterTx.wait();
  console.log(`✅ Granted MINTER_ROLE to deployer on ImpactBadge`);
  console.log(`📜 Tx Hash: ${grantBadgeMinterTx.hash}\n`);
  
  // Grant ORACLE_ROLE to deployer on PSLImpactMarket
  const grantOracleTx = await pslMarket.grantOracleRole(deployer.address);
  await grantOracleTx.wait();
  console.log(`✅ Granted ORACLE_ROLE to deployer on PSLImpactMarket`);
  console.log(`📜 Tx Hash: ${grantOracleTx.hash}\n`);

  // ─────────────── SEED INITIAL DATA ───────────────
  console.log("📌 Seeding Match 1 (Sample)...");
  
  const now = Math.floor(Date.now() / 1000);
  const matchStartTime = now + 86400; // 24 hours from now
  
  const createMatchTx = await pslMarket.createMatch(
    7, // HYK (team 1)
    0, // LAH (team 2)
    matchStartTime,
    "Gaddafi Stadium, Lahore"
  );
  await createMatchTx.wait();
  console.log(`✅ Match 1 created: HYK vs LAH`);
  console.log(`📜 Tx Hash: ${createMatchTx.hash}\n`);

  // Initialize match capacity on PSLTicket
  const initMatchTx = await ticket.initializeMatch(0);
  await initMatchTx.wait();
  console.log(`✅ Match 1 capacity initialized on PSLTicket`);
  console.log(`📜 Tx Hash: ${initMatchTx.hash}\n`);

  // ─────────────── SUMMARY ───────────────
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎉 PSL PULSE DEPLOYMENT COMPLETE!");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("📦 CONTRACT ADDRESSES:");
  console.log(`   PSLImpactMarket: ${marketAddress}`);
  console.log(`   ImpactBadge:     ${badgeAddress}`);
  console.log(`   PSLTicket:       ${ticketAddress}\n`);

  console.log("🔗 BLOCK EXPLORER:");
  console.log(`   ${marketAddress} → https://wirefluidscan.com/address/${marketAddress}`);
  console.log(`   ${badgeAddress} → https://wirefluidscan.com/address/${badgeAddress}`);
  console.log(`   ${ticketAddress} → https://wirefluidscan.com/address/${ticketAddress}\n`);

  console.log("📋 SAVE THESE ADDRESSES TO YOUR .env.local:");
  console.log(`   NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);
  console.log(`   NEXT_PUBLIC_BADGE_ADDRESS=${badgeAddress}`);
  console.log(`   NEXT_PUBLIC_TICKET_ADDRESS=${ticketAddress}\n`);

  console.log("✨ Next Steps:");
  console.log("   1. Copy the contract addresses above");
  console.log("   2. Paste into frontend/.env.local");
  console.log("   3. Verify contracts on WireScan (optional but recommended)");
  console.log("   4. Start frontend: cd frontend && npm run dev\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
