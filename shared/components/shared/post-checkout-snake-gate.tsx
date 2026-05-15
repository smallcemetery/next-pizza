'use client';

import React, { Suspense } from 'react';
import { PostCheckoutSnakeFlow } from './post-checkout-snake-flow';

export const PostCheckoutSnakeGate: React.FC = () => (
  <Suspense fallback={null}>
    <PostCheckoutSnakeFlow />
  </Suspense>
);
