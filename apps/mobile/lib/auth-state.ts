/**
 * Shared auth navigation state.
 * Prevents the SIGNED_IN event in _layout from redirecting to (tabs)
 * when sign-up.tsx is already handling the post-registration navigation.
 */
export const justRegisteredRef = { current: false };
