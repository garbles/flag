import * as React from 'react';
import { Flags } from './types';
export interface ConnectedFlagsProviderState {
    flags: Flags;
}
export declare class ConnectedFlagsProvider extends React.Component<{}, ConnectedFlagsProviderState> {
    static contextTypes: {
        store: () => null;
    };
    private store;
    private unsubscribe;
    constructor(props: {});
    componentWillMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
