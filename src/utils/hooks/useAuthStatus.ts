"use client";

import {useSession} from "next-auth/react";

/**
 * A custom hook to check the user's authentication status.
 * It provides simple boolean flags for guest, authenticated, and loading states,
 * serving as the single source of truth for user session status.
 *
 * @returns {object} An object containing:
 * - `isAuthenticated`: `true` if the user is logged in.
 * - `isGuest`: `true` if the user is not logged in.
 * - `isLoading`: `true` while the session status is being determined.
 */
export const useAuthStatus = () => {
  const {status} = useSession();
  const isAuthenticated = status === "authenticated";
  const isGuest = status === "unauthenticated" || status === "loading";
  const isLoading = status === "loading";

  return {isAuthenticated, isGuest, isLoading};
};
