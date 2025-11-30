import { useAuth } from "@/context/auth-context";

export function useUserProfile() {
    const { user, userTier, loading, refreshUserTier } = useAuth();

    return {
        user,
        userTier,
        loading,
        refreshUserTier,
    };
}
