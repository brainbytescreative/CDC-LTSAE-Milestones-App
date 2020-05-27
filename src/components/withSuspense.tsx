import React, {Suspense} from 'react';
import FullScreenLoading from '../FullScreenLoading';
import ErrorBoundary from './ErrorBoundary';

const withSuspense = (BaseComponent: React.FC) => (props: any) => (
  <ErrorBoundary>
    <Suspense fallback={<FullScreenLoading />}>
      <BaseComponent {...props} />
    </Suspense>
  </ErrorBoundary>
);

export default withSuspense;
