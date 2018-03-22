import * as React from 'react';
import { Flags, ResolvedFlags } from './types';
export interface FlagProviderProps {
    flags: Flags;
    children: React.ReactNode;
}
export interface FlagProviderState {
    computed: ResolvedFlags;
}
export declare class FlagsProvider extends React.PureComponent<FlagProviderProps, FlagProviderState> {
    static childContextTypes: {
        [x: string]: () => null;
    };
    constructor(props: FlagProviderProps);
    componentWillReceiveProps(props: FlagProviderProps): void;
    getChildContext(): {
        [x: string]: ResolvedFlags;
    };
    render(): any;
}
