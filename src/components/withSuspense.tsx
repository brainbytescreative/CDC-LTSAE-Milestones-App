import React, {Suspense} from 'react';
import {ReactQueryConfigProvider, ReactQueryProviderConfig} from 'react-query';

import FullScreenLoading from './FullScreenLoading';

const withSuspense = <P extends any>(
  BaseComponent: React.ComponentType<P>,
  config?: ReactQueryProviderConfig,
  fallback?: Element,
): React.FC<P> => (props: any) => (
  <Suspense fallback={fallback ? fallback : <FullScreenLoading />}>
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
