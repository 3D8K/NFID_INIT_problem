import { InternetIdentityProvider } from 'ic-use-internet-identity';
import { Actors } from './ICP/Actor';
import { Login } from './Login';

export const LoginProvider = () => {
  return (
    <InternetIdentityProvider>
      <Actors>
        <Login />
      </Actors>
    </InternetIdentityProvider>
  );
};
