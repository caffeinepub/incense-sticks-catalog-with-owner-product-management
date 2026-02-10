import { useActor } from './useActor';

/**
 * Extended actor hook that provides additional state information
 * for UI components to handle loading, error, and ready states.
 */
export function useActorState() {
  const { actor, isFetching } = useActor();
  
  // Derive additional states from the base actor hook
  const isReady = !!actor && !isFetching;
  const isLoading = !actor && isFetching;
  const isError = !actor && !isFetching; // If no actor after fetching, assume error
  
  const retry = () => {
    // Trigger a page reload as a simple retry mechanism
    window.location.reload();
  };
  
  return {
    actor,
    isFetching,
    isLoading,
    isError,
    isReady,
    retry,
    error: isError ? new Error('Failed to initialize actor') : null,
  };
}
