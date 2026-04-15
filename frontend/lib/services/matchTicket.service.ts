/**
 * Match Ticket Service
 * Creates and manages ticket entries for cricket matches
 * Integrates with CricAPI for match data
 * @file frontend/lib/services/matchTicket.service.ts
 */

import { useCricketMatches } from '@/lib/hooks/useCricketMatches';
import { Match } from '@/lib/services/cricapi.service';

/**
 * Ticket information
 */
export interface Ticket {
  ticketId: string;
  matchId: string;
  userId: string;
  userEmail: string;
  walletAddress: string;
  team1: string;
  team2: string;
  matchDate: string;
  matchVenue: string;
  matchType: string; // odi, t20, test
  ticketType: string; // standard, vip, premium
  quantity: number;
  seatNumbers?: string[];
  section?: string;
  pricePerTicket: {
    pkr: number;
    wire: number;
  };
  totalPrice: {
    pkr: number;
    wire: number;
  };
  transactionHash?: string;
  nftTokenId?: string;
  qrCode?: string;
  receiptId?: string;
  purchaseDate: string;
  status: 'pending' | 'confirmed' | 'used' | 'cancelled';
  expiryDate?: string;
  notes?: string;
}

/**
 * Match Ticket Service
 */
class MatchTicketService {
  /**
   * Create ticket from match data
   */
  createTicket(
    matchId: string,
    match: Match,
    userId: string,
    userEmail: string,
    walletAddress: string,
    ticketType: string = 'standard',
    quantity: number = 1,
    seatNumbers?: string[]
  ): Ticket {
    const ticketId = this.generateTicketId();
    const purchaseDate = new Date().toISOString();
    const expiryDate = new Date(new Date(match.startTime).getTime() + 24 * 60 * 60 * 1000).toISOString();

    // Price mapping based on ticket type and match type
    const pricePerTicket = this.calculatePrice(
      match.matchType,
      ticketType
    );

    const totalPrice = {
      pkr: pricePerTicket.pkr * quantity,
      wire: pricePerTicket.wire * quantity,
    };

    const ticket: Ticket = {
      ticketId,
      matchId,
      userId,
      userEmail,
      walletAddress,
      team1: match.team1,
      team2: match.team2,
      matchDate: match.startTime,
      matchVenue: match.venue || 'TBA',
      matchType: match.matchType,
      ticketType,
      quantity,
      seatNumbers,
      pricePerTicket,
      totalPrice,
      purchaseDate,
      status: 'pending',
      expiryDate,
    };

    return ticket;
  }

  /**
   * Calculate ticket price based on type and match
   */
  private calculatePrice(
    matchType: string,
    ticketType: string
  ): { pkr: number; wire: number } {
    // Price mapping (in PKR and WIRE equivalent)
    const priceMap: Record<string, Record<string, { pkr: number; wire: number }>> = {
      test: {
        standard: { pkr: 2500, wire: 2.5 },
        vip: { pkr: 5000, wire: 5 },
        premium: { pkr: 10000, wire: 10 },
      },
      odi: {
        standard: { pkr: 3500, wire: 3.5 },
        vip: { pkr: 7000, wire: 7 },
        premium: { pkr: 14000, wire: 14 },
      },
      t20: {
        standard: { pkr: 3000, wire: 3 },
        vip: { pkr: 6000, wire: 6 },
        premium: { pkr: 12000, wire: 12 },
      },
    };

    const prices = priceMap[matchType] || priceMap['t20'];
    return prices[ticketType] || prices['standard'];
  }

  /**
   * Generate unique ticket ID
   */
  private generateTicketId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  /**
   * Validate ticket information
   */
  validateTicket(ticket: Ticket): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!ticket.ticketId || ticket.ticketId.length === 0) {
      errors.push('Ticket ID is required');
    }

    if (!ticket.matchId || ticket.matchId.length === 0) {
      errors.push('Match ID is required');
    }

    if (!ticket.userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ticket.userEmail)) {
      errors.push('Valid user email is required');
    }

    if (!ticket.walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(ticket.walletAddress)) {
      errors.push('Valid wallet address is required');
    }

    if (!ticket.team1 || ticket.team1.length === 0) {
      errors.push('Team 1 is required');
    }

    if (!ticket.team2 || ticket.team2.length === 0) {
      errors.push('Team 2 is required');
    }

    if (ticket.quantity < 1) {
      errors.push('Quantity must be at least 1');
    }

    if (ticket.quantity > 50) {
      errors.push('Cannot purchase more than 50 tickets at once');
    }

    if (!['standard', 'vip', 'premium'].includes(ticket.ticketType)) {
      errors.push('Invalid ticket type');
    }

    if (!['odi', 't20', 'test'].includes(ticket.matchType)) {
      errors.push('Invalid match type');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if ticket is still valid
   */
  isTicketValid(ticket: Ticket): boolean {
    if (ticket.status === 'cancelled') {
      return false;
    }

    if (ticket.status === 'used') {
      return false;
    }

    if (ticket.expiryDate) {
      const expiryTime = new Date(ticket.expiryDate).getTime();
      if (Date.now() > expiryTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * Mark ticket as used
   */
  markUsed(ticket: Ticket): Ticket {
    return {
      ...ticket,
      status: 'used',
    };
  }

  /**
   * Cancel ticket
   */
  cancel(ticket: Ticket): Ticket {
    return {
      ...ticket,
      status: 'cancelled',
    };
  }

  /**
   * Get available ticket types for match
   */
  getAvailableTicketTypes(matchType: string): string[] {
    // All match types have all ticket categories
    return ['standard', 'vip', 'premium'];
  }

  /**
   * Get tickets for a user
   * @param userId - User ID
   * @param status - Filter by status (optional)
   * @returns Array of user's tickets
   */
  async getUserTickets(
    userId: string,
    status?: 'pending' | 'confirmed' | 'used' | 'cancelled'
  ): Promise<Ticket[]> {
    try {
      // In production, fetch from database
      // const tickets = await db.query(
      //   'SELECT * FROM tickets WHERE user_id = ?' + (status ? ' AND status = ?' : ''),
      //   status ? [userId, status] : [userId]
      // );

      // For now, return empty array (will be populated with actual DB calls)
      return [];
    } catch (error) {
      console.error('[MatchTicket] Error getting user tickets:', error);
      return [];
    }
  }

  /**
   * Get all available tickets for a match
   * @param matchId - Match ID
   * @param ticketType - Filter by type (optional)
   * @returns Available ticket count
   */
  async getAvailableTickets(
    matchId: string,
    ticketType?: string
  ): Promise<number> {
    try {
      // In production:
      // const result = await db.query(
      //   'SELECT COALESCE(SUM(capacity - sold), 0) as available FROM match_tickets WHERE match_id = ?' +
      //   (ticketType ? ' AND ticket_type = ?' : ''),
      //   ticketType ? [matchId, ticketType] : [matchId]
      // );

      // For demo: return large number
      return 10000;
    } catch (error) {
      console.error('[MatchTicket] Error getting available tickets:', error);
      return 0;
    }
  }

  /**
   * Reserve tickets for purchase
   * @param matchId - Match ID
   * @param quantity - Number of tickets to reserve
   * @param ticketType - Type of ticket
   * @returns Reservation ID or null if not available
   */
  async reserveTickets(
    matchId: string,
    quantity: number,
    ticketType: string
  ): Promise<string | null> {
    try {
      const available = await this.getAvailableTickets(matchId, ticketType);

      if (available < quantity) {
        console.warn('[MatchTicket] Not enough tickets available');
        return null;
      }

      // In production: Create reservation with 10-minute expiry
      // INSERT INTO ticket_reservations (match_id, ticket_type, quantity, expires_at)
      // VALUES (?, ?, ?, NOW() + INTERVAL 10 MINUTE)

      const reservationId = `RES-${Date.now().toString(36).toUpperCase()}`;
      return reservationId;
    } catch (error) {
      console.error('[MatchTicket] Error reserving tickets:', error);
      return null;
    }
  }

  /**
   * Confirm ticket purchase (after payment)
   */
  async confirmPurchase(
    ticket: Ticket,
    transactionHash: string,
    nftTokenId: string
  ): Promise<Ticket> {
    try {
      const confirmedTicket: Ticket = {
        ...ticket,
        transactionHash,
        nftTokenId,
        status: 'confirmed',
      };

      // In production: Update in database
      // UPDATE tickets SET transaction_hash = ?, nft_token_id = ?, status = 'confirmed', confirmed_at = NOW()
      // WHERE ticket_id = ?

      return confirmedTicket;
    } catch (error) {
      console.error('[MatchTicket] Error confirming purchase:', error);
      throw error;
    }
  }

  /**
   * Format ticket for display
   */
  formatTicketDisplay(ticket: Ticket): string {
    return `
    🎫 Ticket #${ticket.ticketId}
    ${ticket.team1} vs ${ticket.team2}
    📅 ${new Date(ticket.matchDate).toLocaleDateString()}
    🏏 ${ticket.matchType.toUpperCase()} • ${ticket.ticketType.toUpperCase()}
    💳 ${ticket.totalPrice.wire} WIRE (₨${ticket.totalPrice.pkr.toLocaleString()})
    Status: ${ticket.status.toUpperCase()}
    `;
  }
}

// Export singleton instance
export const matchTicketService = new MatchTicketService();
