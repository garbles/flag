# Feature Flag

_Feature flagging made easy for React and Redux_

## Motivation

Feature flagging is necessary for large client-side applications. They improve development speed
and allow teams to test new features before they are stable. In order to __WANT__ to use feature
flags in an application, they should be __VERY__ easy to add and remove. That means minimal
boiler plate and no need to pass boolean props down through component hierarchy. Such could be
done with global variables; however, they live outside of the React/Redux lifecycle, making them
more difficult to control. Instead, this library injects and then accesses feature flags directly
from the application Redux store without getting in your way.

## Getting Started


## Installation

```
yarn add react-redux-feature-flag
```

## License

MIT
