import { useDispatch, useSelector, useStore } from 'react-redux';

import type { AppDispatch, AppStore, RootState } from './index';

/**
 * Pre-typed replacements for the react-redux primitives.
 *
 * Always use these instead of the untyped originals: `useAppDispatch` knows
 * about thunks, so `dispatch(login(...)).unwrap()` typechecks.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
