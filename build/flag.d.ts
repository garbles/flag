import * as React from 'react';
import { FlagChildProps, Renderer } from './types';
export interface FlagProps {
    name: string;
    component?: React.ComponentType<FlagChildProps<any>>;
    fallbackComponent?: React.ComponentType<FlagChildProps<any>>;
    render?: Renderer;
    fallbackRender?: Renderer;
    [key: string]: any;
}
export declare class Flag extends React.Component<FlagProps, {}> {
    static contextTypes: {
        [x: string]: () => null;
    };
    render(): any;
}
