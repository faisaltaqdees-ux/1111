const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying PSL Pulse Smart Contracts to WireFluid Testnet...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying from account: ${deployer.address}`);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} WIRE\n`);

  // Compile contracts first
  console.log("Compiling contracts...");
  try {
    // Deploy PSLImpactMarket
    console.log("1️⃣ Deploying PSLImpactMarket...");
    const PSLImpactMarket = await hre.ethers.getContractFactory("PSLImpactMarket");
    const pslMarket = await PSLImpactMarket.deploy();
    await pslMarket.waitForDeployment();
    const marketAddress = await pslMarket.getAddress();
    const marketTxHash = pslMarket.deploymentTransaction().hash;
    console.log(`✅ PSLImpactMarket deployed to: ${marketAddress}`);
    console.log(`📜 Tx Hash: ${marketTxHash}\n`);

    // Deploy ImpactBadge
    console.log("2️⃣ Deploying ImpactBadge (ERC-721)...");
    const ImpactBadge = await hre.ethers.getContractFactory("ImpactBadge");
    const badge = await ImpactBadge.deploy();
    await badge.waitForDeployment();
    const badgeAddress = await badge.getAddress();
    const badgeTxHash = badge.deploymentTransaction().hash;
    console.log(`✅ ImpactBadge deployed to: ${badgeAddress}`);
    console.log(`📜 Tx Hash: ${badgeTxHash}\n`);

    // Deploy PSLTicket
    console.log("3️⃣ Deploying PSLTicket (ERC-721)...");
    const PSLTicket = await hre.ethers.getContractFactory("PSLTicket");
    const ticket = await PSLTicket.deploy();
    await ticket.waitForDeployment();
    const ticketAddress = await ticket.getAddress();
    const ticketTxHash = ticket.deploymentTransaction().hash;
    console.log(`✅ PSLTicket deployed to: ${ticketAddress}`);
    console.log(`📜 Tx Hash: ${ticketTxHash}\n`);

    // Setup roles
    console.log("🔐 Setting up roles...");
    
    const grantBadgeMinterTx = await badge.grantMinterRole(deployer.address);
    const badgeMinterReceipt = await grantBadgeMinterTx.wait();
    console.log(`✅ Granted MINTER_ROLE to deployer on ImpactBadge`);
    console.log(`📜 Tx Hash: ${grantBadgeMinterTx.hash}\n`);
    
    const grantOracleTx = await pslMarket.grantOracleRole(deployer.address);
    const oracleReceipt = await grantOracleTx.wait();
    console.log(`✅ Granted ORACLE_ROLE to deployer on PSLImpactMarket`);
    console.log(`📜 Tx Hash: ${grantOracleTx.hash}\n`);

    // Seed Match 1
    console.log("📌 Seeding Match 1 (Sample)...");
    
    const now = Math.floor(Date.now() / 1000);
    const matchStartTime = now + 86400;
    
    const createMatchTx = await pslMarket.createMatch(
      7,
      0,
      matchStartTime,
      "Gaddafi Stadium, Lahore"
    );
    const matchReceipt = await createMatchTx.wait();
    console.log(`✅ Match 1 created: HYK vs LAH`);
    console.log(`📜 Tx Hash: ${createMatchTx.hash}\n`);

    const initMatchTx = await ticket.initializeMatch(0);
    const initReceipt = await initMatchTx.wait();
    console.log(`✅ Match 1 capacity initialized on PSLTicket`);
    console.log(`📜 Tx Hash: ${initMatchTx.hash}\n`);

    // Summary
    console.log("═══════════════════════════════════════════════════════════");
    console.log("🎉 PSL PULSE DEPLOYMENT COMPLETE!");
    console.log("═══════════════════════════════════════════════════════════\n");

    console.log("📦 CONTRACT ADDRESSES:");
    console.log(`   PSLImpactMarket: ${marketAddress}`);
    console.log(`   ImpactBadge:     ${badgeAddress}`);
    console.log(`   PSLTicket:       ${ticketAddress}\n`);

    console.log("📋 TRANSACTION HASHES:");
    console.log(`   PSLImpactMarket Deploy:   ${marketTxHash}`);
    console.log(`   ImpactBadge Deploy:       ${badgeTxHash}`);
    console.log(`   PSLTicket Deploy:         ${ticketTxHash}`);
    console.log(`   Grant Badge Minter:       ${grantBadgeMinterTx.hash}`);
    console.log(`   Grant Oracle Role:        ${grantOracleTx.hash}`);
    console.log(`   Create Match 1:           ${createMatchTx.hash}`);
    console.log(`   Initialize Match 1:       ${initMatchTx.hash}\n`);

    console.log("🔗 BLOCK EXPLORER:");
    console.log(`   https://wirefluidscan.com/address/${marketAddress}`);
    console.log(`   https://wirefluidscan.com/address/${badgeAddress}`);
    console.log(`   https://wirefluidscan.com/address/${ticketAddress}\n`);

    console.log("📋 SAVE TO .env.local:");
    console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);
    console.log(`NEXT_PUBLIC_BADGE_ADDRESS=${badgeAddress}`);
    console.log(`NEXT_PUBLIC_TICKET_ADDRESS=${ticketAddress}\n`);

    // Save to file
    const fs = require("fs");
    const deploymentData = {
      timestamp: new Date().toISOString(),
      network: "wirefluidTestnet",
      deployer: deployer.address,
      contracts: {
        PSLImpactMarket: {
          address: marketAddress,
          deploymentTxHash: marketTxHash
        },
        ImpactBadge: {
          address: badgeAddress,
          deploymentTxHash: badgeTxHash
        },
        PSLTicket: {
          address: ticketAddress,
          deploymentTxHash: ticketTxHash
        }
      },
      transactionHashes: {
        marketDeploy: marketTxHash,
        badgeDeploy: badgeTxHash,
        ticketDeploy: ticketTxHash,
        grantBadgeMinter: grantBadgeMinterTx.hash,
        grantOracleRole: grantOracleTx.hash,
        createMatch1: createMatchTx.hash,
        initializeMatch1: initMatchTx.hash
      }
    };
    
    fs.writeFileSync("DEPLOYMENT_DATA.json", JSON.stringify(deploymentData, null, 2));
    console.log("✅ Deployment data saved to DEPLOYMENT_DATA.json");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
