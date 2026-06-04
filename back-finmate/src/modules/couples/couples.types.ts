export interface CreateCoupleBody {
  name: string;
}

export interface UpdateCoupleBody {
  name: string;
}

export interface InviteBody {
  email: string;
}

export interface CoupleResponse {
  id: string;
  name: string | null;
  status: 'active' | 'inactive';
  members: CoupleMemberResponse[];
}

export interface CoupleMemberResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

export interface InvitationResponse {
  id: string;
  coupleId: string;
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
}
