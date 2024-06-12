import { loginRedirector } from '../../features/Auth/common/common';
import {
  getSSMeta,
  getSSProps,
  getSSTrans,
} from '../../common/helpers/serverSideUtils';
import { addHeaders } from '../../common/helpers/addHeaders';
import dynamic from 'next/dynamic';

const Login = dynamic(
  () =>
    import('../../features/Auth/components/LoginProvider').then(
      (component) => component.LoginProvider,
    ),
  { ssr: false },
);

export const getServerSideProps = getSSProps(
  [getSSMeta('static-login'), getSSTrans()],
  loginRedirector,
);

export default addHeaders(Login);
