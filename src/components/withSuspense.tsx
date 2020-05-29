import React, {Suspense} from 'react';
import FullScreenLoading from '../FullScreenLoading';
import ErrorBoundary from './ErrorBoundary';
import {ReactQueryConfigProvider, ReactQueryProviderConfig} from 'react-query';

const withSuspense = (BaseComponent: any, config?: ReactQueryProviderConfig) => (props: any) => (
  <Suspense fallback={<FullScreenLoading />}>
    {config ? (
      <ReactQueryConfigProvider config={config}>
        <BaseComponent {...props} />
      </ReactQueryConfigProvider>
    ) : (
      <BaseComponent {...props} />
    )}
  </Suspense>
);

export default withSuspense;
