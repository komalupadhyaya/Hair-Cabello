const API_BASE = import.meta.env.VITE_API_URL || 'https://hair-cabello.onrender.com';

export interface SignupPayload {
    fullName: string;
    email: string;
    phone: string;
    plan: 'essential' | 'premium' | 'luxury';
    hairLength: '16' | '18' | '22';
    hairType: 'body-wave' | 'straight' | 'curly';
    selectedGifts: string[];
    password?: string;
}

export interface SignupResponse {
    url: string;
}

export async function startSignup(payload: SignupPayload): Promise<SignupResponse> {
    const res = await fetch(`${API_BASE}/api/signup/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start signup');
    }

    return res.json();
}

export interface SessionDetails {
    name: string;
    email: string;
    plan: string;
    price: number;
    hairLength: string;
    hairType: string;
    selectedGifts: string[];
    nextBillingDate: string;
}

export async function getSessionDetails(sessionId: string): Promise<SessionDetails> {
    const res = await fetch(`${API_BASE}/api/stripe/session/${sessionId}`);

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch session details');
    }

    return res.json();
}

export async function updateNextOrderPreferences(data: { hairLength?: string, hairType?: string, gifts?: string[] }) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/next-order`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update preferences');
    }
    return res.json();
}

export async function createBillingPortal(): Promise<{ url: string }> {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/billing-portal`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create billing portal');
    }
    return res.json();
}

// Auth
export async function login(credentials: any) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
    }
    return res.json();
}

export async function getMyProfile() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

export async function memberCancelSelf() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
}

export const changePassword = async (newPassword: string): Promise<{ message: string }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/auth/update-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
    }

    return response.json();
};

// Admin
export async function adminLogin(credentials: any) {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Admin login failed');
    }
    return res.json();
}

export async function getDashboardStats() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/admin/ph3/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
}

export async function getMembers() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
}

export async function getMemberById(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch member');
    return res.json();
}

export async function updateMember(id: string, data: any) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update member');
    return res.json();
}

export async function cancelSubscription(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
}

export async function addMemberNote(id: string, data: { note: string }) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}/note`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add member note');
    return res.json();
}

// Legacy Admin (No-op or empty return to avoid crashes)
export async function getClaims() { return []; }
export async function getClaimById(id: string) { return null; }
export async function updateClaimStatus(id: string, status: string) { return { message: "Not applicable" }; }
export async function assignVendor(id: string, vendorId: string) { return { message: "Not applicable" }; }
export async function addClaimNote(id: string, note: string) { return { message: "Not applicable" }; }
export async function getClaimsByMember(memberId: string) { return []; }
export async function getVendors() { return []; }
export async function createVendor() { return { message: "Not applicable" }; }
export async function updateVendor() { return { message: "Not applicable" }; }
export async function deleteVendor() { return { message: "Not applicable" }; }
