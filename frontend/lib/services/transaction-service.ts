/**
 * Transaction Data Service
 * Saves payment transactions and NFT minting records to Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PaymentTransaction {
  user_id: string;
  match_id: string;
  wallet_address: string;
  transaction_hash: string;
  amount_wire: number;
  amount_pkr?: number;
  quantity: number;
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  confirmations?: number;
}

export interface NFTMintingRecord {
  transaction_hash: string;
  match_id: string;
  wallet_address: string;
  token_id: string;
  quantity: number;
  status: 'pending' | 'minting' | 'confirmed';
  contract_address?: string;
}

export interface TicketRecord {
  user_id: string;
  match_id: string;
  transaction_hash: string;
  nft_token_id: string;
  status: 'active' | 'used' | 'transferred';
  qr_code?: string;
}

/**
 * Save payment transaction to Supabase
 * @param transaction - Transaction data
 * @returns Saved transaction or error
 */
export async function savePaymentTransaction(transaction: PaymentTransaction) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: transaction.user_id,
        match_id: transaction.match_id,
        wallet_address: transaction.wallet_address,
        transaction_hash: transaction.transaction_hash,
        amount_wire: transaction.amount_wire,
        amount_pkr: transaction.amount_pkr,
        quantity: transaction.quantity,
        status: transaction.status,
        block_number: transaction.block_number,
        confirmations: transaction.confirmations,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to save transaction:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Save NFT minting record to Supabase
 * @param record - NFT minting data
 * @returns Saved record or error
 */
export async function saveNFTMintingRecord(record: NFTMintingRecord) {
  try {
    const { data, error } = await supabase
      .from('nft_minting_records')
      .insert({
        transaction_hash: record.transaction_hash,
        match_id: record.match_id,
        wallet_address: record.wallet_address,
        token_id: record.token_id,
        quantity: record.quantity,
        status: record.status,
        contract_address: record.contract_address || process.env.NEXT_PUBLIC_NFT_CONTRACT,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to save NFT record:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Save ticket record to Supabase
 * @param ticket - Ticket data
 * @returns Saved ticket or error
 */
export async function saveTicketRecord(ticket: TicketRecord) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: ticket.user_id,
        match_id: ticket.match_id,
        transaction_hash: ticket.transaction_hash,
        nft_token_id: ticket.nft_token_id,
        status: ticket.status,
        qr_code: ticket.qr_code,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to save ticket:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Update match ticket inventory after purchase
 * @param matchId - Match ID
 * @param quantity - Number of tickets sold
 * @returns Updated inventory or error
 */
export async function updateMatchInventory(matchId: string, quantity: number) {
  try {
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('tickets_available')
      .eq('match_id', matchId)
      .single();

    if (fetchError) throw fetchError;

    const newAvailable = (match?.tickets_available || 0) - quantity;

    const { data, error } = await supabase
      .from('matches')
      .update({
        tickets_available: Math.max(0, newAvailable),
        updated_at: new Date().toISOString(),
      })
      .eq('match_id', matchId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to update inventory:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's tickets
 * @param userId - User ID
 * @returns Array of tickets
 */
export async function getUserTickets(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        match:matches(team1, team2, date, venue),
        transaction:transactions(transaction_hash, amount_wire)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to fetch user tickets:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get transaction details
 * @param transactionHash - Transaction hash
 * @returns Transaction details
 */
export async function getTransactionDetails(transactionHash: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        match:matches(team1, team2, date, venue),
        nft_records:nft_minting_records(token_id, status)
      `)
      .eq('transaction_hash', transactionHash)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to fetch transaction:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get match inventory
 * @param matchId - Match ID
 * @returns Match inventory data
 */
export async function getMatchInventory(matchId: string) {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('tickets_available, tickets_sold')
      .eq('match_id', matchId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('[Supabase] Failed to fetch inventory:', error.message);
    return { success: false, error: error.message };
  }
}
