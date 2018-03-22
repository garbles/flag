import * as React from 'react';
import { ResolvedFlags } from './types';
export declare function withFlags<P, F = ResolvedFlags>(Component: React.ComponentType<{
    flags: F;
} & P>): React.ComponentType<P>;
