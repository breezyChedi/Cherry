declare module 'react-world-flags' {
  import { FC } from 'react';

  interface FlagProps {
    code: string;
    style?: React.CSSProperties;
  }

  const Flag: FC<FlagProps>;
  export default Flag;
}
