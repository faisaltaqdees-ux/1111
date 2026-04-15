/**
 * ============================================================================
 * UNIFIED MASTER - QUICK START USAGE EXAMPLE
 * ============================================================================
 */

import UNIFIED_MASTER from './UNIFIED_MASTER';

/**
 * Example 1: Initialize the entire system (one line!)
 */
async function setupSystem() {
  console.log('Initializing unified system...');
  await UNIFIED_MASTER.initialize();
  console.log('Done! All parts loaded and ready.');
}

/**
 * Example 2: Process user queries seamlessly
 */
async function handleUserQuery(query: string, userId: string) {
  const response = await UNIFIED_MASTER.processQuery(query, userId, {
    style: 'concise',
    recordAnalytics: true,
  });

  console.log('Response:', response.response);
  console.log('Processing time:', response.metadata.processingTime, 'ms');
  console.log('Confidence:', response.metadata.confidence);
}

/**
 * Example 3: Query knowledge directly
 */
async function queryKnowledge() {
  const mathKnowledge = await UNIFIED_MASTER.queryKnowledge('MATHEMATICS', 'calculus');
  console.log('Math knowledge:', mathKnowledge);
}

/**
 * Example 4: Check system capabilities
 */
function showCapabilities() {
  const capabilities = UNIFIED_MASTER.getCapabilities();
  console.log('System capabilities:');
  console.log(JSON.stringify(capabilities, null, 2));
}

/**
 * Example 5: Check system health
 */
function checkHealth() {
  const health = UNIFIED_MASTER.getSystemHealth();
  console.log('System health:', health);
  console.log('Status:', health.status);
  console.log('Initialized systems:', health.initializedSystems);
}

/**
 * Example 6: Full workflow
 */
async function fullWorkflow() {
  // 1. Initialize
  await setupSystem();

  // 2. Authenticate user
  const sessionId = await UNIFIED_MASTER.authenticateUser('user123');
  console.log('Session created:', sessionId);

  // 3. Validate session
  const isValid = await UNIFIED_MASTER.validateSession(sessionId!);
  console.log('Session valid:', isValid);

  // 4. Show capabilities
  showCapabilities();

  // 5. Check health
  checkHealth();

  // 6. Process queries
  await handleUserQuery('What is calculus?', 'user123');
  await handleUserQuery('Explain photosynthesis', 'user123');
  await handleUserQuery('What is machine learning?', 'user123');
}

// Run the full workflow if this file is executed
if (require.main === module) {
  fullWorkflow().catch(console.error);
}

export { setupSystem, handleUserQuery, queryKnowledge, showCapabilities, checkHealth, fullWorkflow };
