declare module '*.svg' {
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-query' {
  export const queryCache: {
    refetchQueries: (
      queryKeyOrPredicateFn: any,
      options?: {exact: boolean; throwOnError: boolean; force: boolean},
    ) => Promise<void>;
  };

  // overloaded useQuery function with pagination
  export function useQuery<TResult, TVariables extends object>(
    queryKey: QueryKey<TVariables>,
    queryFn: QueryFunction<TResult, TVariables>,
    options: QueryOptionsPaginated<TResult>,
  ): QueryResultPaginated<TResult, TVariables>;

  export function useQuery<TResult, TVariables extends object>(
    queryKey: QueryKey<TVariables>,
    queryFn: QueryFunction<TResult, TVariables>,
    options?: QueryOptions<TResult>,
  ): QueryResult<TResult, TVariables>;

  export type QueryKey<TVariables> =
    | string
    | [string, TVariables]
    | false
    | null
    | QueryKeyFunction<TVariables>;
  export type QueryKeyFunction<TVariables> = () =>
    | string
    | [string, TVariables]
    | false
    | null;

  export type QueryFunction<TResult, TVariables extends object> = (
    key: string,
    variables: TVariables,
  ) => Promise<TResult>;

  export interface QueryOptions<TResult> {
    manual?: boolean;
    retry?: boolean | number;
    retryDelay?: (retryAttempt: number) => number;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: false | number;
    refetchIntervalInBackground?: boolean;
    refetchOnWindowFocus?: boolean;
    onError?: (err: any) => void;
    onSuccess?: (data: TResult) => void;
    suspense?: boolean;
    initialData?: TResult;
  }

  export interface QueryOptionsPaginated<TResult>
    extends QueryOptions<TResult> {
    paginated: true;
    getCanFetchMore: (lastPage: TResult, allPages: TResult[]) => boolean;
  }

  export interface QueryResult<TResult, TVariables> {
    status: 'loading' | 'error' | 'success';
    data: null | TResult;
    error: null | Error;
    isFetching: boolean;
    failureCount: number;
    refetch: (arg?: {
      variables?: TVariables;
      merge?: (...args: any[]) => any;
      disableThrow?: boolean;
    }) => Promise<void>;
  }

  export interface QueryResultPaginated<TResult, TVariables>
    extends QueryResult<TResult[], TVariables> {
    isFetchingMore: boolean;
    canFetchMore: boolean;
    fetchMore: (variables?: TVariables) => Promise<TResult>;
  }

  export function prefetchQuery<TResult, TVariables extends object>(
    queryKey: QueryKey<TVariables>,
    queryFn: QueryFunction<TResult, TVariables>,
    options?: PrefetchQueryOptions<TResult>,
  ): Promise<TResult>;

  export interface PrefetchQueryOptions<TResult> extends QueryOptions<TResult> {
    force?: boolean;
  }

  export function useMutation<TResults, TVariables extends object>(
    mutationFn: MutationFunction<TResults, TVariables>,
    mutationOptions?: MutationOptions<TResults, TVariables>,
  ): [MutateFunction<TResults, TVariables>, MutationResult<TResults>];

  export type MutationFunction<TResults, TVariables extends object> = (
    variables: TVariables,
  ) => Promise<TResults>;

  export interface MutationOptions<TResults, TVariables> {
    onMutate?: () => void;
    onSuccess?: (result: TResults, variables: TVariables) => void;
    onError?: () => void;
    onSettled?: () => void;
    throwOnError?: () => void;
    useErrorBoundary?: () => void;
  }

  export type MutateFunction<TResults, TVariables extends object> = (
    variables?: TVariables,
    options?: {
      updateQuery?: string | [string, object];
      waitForRefetchQueries?: boolean;
    },
  ) => Promise<TResults>;

  export interface MutationResult<TResults> {
    status: 'success' | 'error' | 'loading' | 'idle';
    data: TResults | null;
    error: null | Error;
    promise: Promise<TResults>;
  }

  export function setQueryData(
    queryKey: string | [string, object],
    data: any,
    options?: {
      shouldRefetch?: boolean;
    },
  ): void | Promise<void>;

  export function refetchQuery(
    queryKey: string | [string, object] | [string, false],
    force?: {
      force?: boolean;
    },
  ): Promise<void>;

  export function refetchAllQueries(options?: {
    force?: boolean;
    includeInactive: boolean;
  }): Promise<void>;

  export function useIsFetching(): boolean;

  export const ReactQueryConfigProvider: React.ComponentType<{
    config?: ReactQueryProviderConfig;
  }>;

  export interface ReactQueryProviderConfig {
    retry?: number;
    retryDelay?: (attempt: number) => number;
    staleTime?: number;
    cacheTime?: number;
    refetchAllOnWindowFocus?: boolean;
    refetchInterval?: false | number;
    suspense?: boolean;
  }

  export function clearQueryCache(): void;
}
