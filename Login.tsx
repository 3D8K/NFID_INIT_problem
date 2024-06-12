'use client';

import { Link, Typography } from '@material-ui/core';
import MailIcon from '../../../common/assets/svg/mailIcon.svg';
import LoginBackground from '../../../common/assets/svg/auth/BackgroundLogin.svg';
import { FacebookButton } from './FacebookButton';
import { useRouter } from 'next/router';
import TermsOfUseCaption from '../../../common/components/Captions/TermsOfUseCaption';
import GetAppsAuth from './GetAppsAuth';
import { AuthWrapper } from './AuthWrapper';
import { AuthSeparator } from './AuthSeparator';
import cls from 'classnames';
import { Trans, useTranslation } from 'next-i18next';
import { GoogleButton } from './GoogleButton';
import { MainButton } from '../../../common/components/Buttons/MainButton';
import classNames from 'classnames';
import { openSans } from '../../../pages/_app';
import { AuthData } from '../common/useAuthChange';
import { usePushSignup } from '../common/hooks';
import { useEffect, useState } from 'react';
import RatersLogo from '../../../features/Landing/static/assets/img/navbar/logo.svg';
import { Web3Button } from './Web3Button';
import { Web3Modal } from './Web3Modal';
import { NFID } from '@nfid/embed';
import type { IdleOptions, AuthClientStorage } from '@dfinity/auth-client';
import type { SignIdentity } from '@dfinity/agent';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { authApiClient } from '../../../common/api/authApiClient';

const algorithm = {
  name: 'ECDSA',
  hash: { name: 'SHA-256' },
};

type NFIDConfig = {
  origin?: string;
  application?: {
    name?: string;
    logo?: string;
  };
  identity?: SignIdentity;
  storage?: AuthClientStorage;
  keyType?: 'ECDSA' | 'Ed25519';
  idleOptions?: IdleOptions;
};

export const Login = () => {
  const { t, i18n } = useTranslation(); // Использование хука для интернационализации
  const router = useRouter();
  const { pushSignup } = usePushSignup();
  const [open, setOpen] = useState(false);

  const [nfid, setNfid] = useState<null | any>(null);
  const [info, setInfo] = useState('');

  function arrayBufferToHex(buffer: any) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  const [loginHandler, loginResult] = authApiClient.useLoginICPMutation();

  const { isLoggingIn, login, clear, identity, loginStatus } =
    useInternetIdentity();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNFIDAuth = () => {
    if (nfid) {
      nfid.getDelegation({});
    }
  };

  const handleICPAuth = () => {
    login();
  };

  useEffect(() => {
    const processIdentity = async () => {
      if (identity) {
        try {
          const delegationArr = (identity as any)._delegation.delegations[0]
            .delegation.pubkey;
          const principalArr = identity.getPrincipal();
          const uint8Array = (principalArr as any)._arr;
          const principal = arrayBufferToHex(uint8Array);
          const delegation = arrayBufferToHex(delegationArr);
          const { privateKey } = (identity as any)._inner._keyPair;

          const signedPrincipal = await window.crypto.subtle.sign(
            algorithm,
            privateKey,
            uint8Array,
          );
          const signedPrincipalString = arrayBufferToHex(signedPrincipal);

          loginHandler({
            principal_id: principal,
            signed_principal: signedPrincipalString,
            delegation_pubkey: delegation,
          });
        } catch (err) {
          console.error('Error processing identity or signing:', err);
        }
      }
    };

    processIdentity();
  }, [identity]);

  // useEffect(() => {
  //   console.log(loginResult);
  // }, [loginResult]);

  useEffect(() => {
    async function initializeNFID() {
      try {
        const nfidInstance = await NFID.init({
          application: {
            name: 'Raters',
            logo: RatersLogo,
          },
        } as NFIDConfig);
        setNfid(nfidInstance);
        const res = nfidInstance.getIdentity();
        setInfo(JSON.stringify(res));
      } catch (error) {
        console.error('Failed to initialize NFID:', error);
      }
    }
    initializeNFID();
  }, []);

  return (
    <AuthWrapper Background={LoginBackground}>
      <Web3Modal
        open={open}
        handleClose={handleClose}
        handleNFIDAuth={handleNFIDAuth}
        handleICPAuth={handleICPAuth}
      />
      <Typography variant={'h6'} className="authWelcomeMessage">
        {t('NewLogin.Title')}
      </Typography>
      <h5
        className={classNames([
          'welcomeMessageDescription',
          openSans.className,
        ])}
      >
        {t('NewLogin.Subtitle')}
      </h5>
      <span className="authWelcomeMessage">{t('NewLogin.SignIn')}</span>
      <FacebookButton />
      <Web3Button handleOpen={handleOpen} />
      <GoogleButton />
      <MainButton
        onClick={() => router.push('/login/email')}
        className={cls('viaEmailButton', 'authButtonSpace')}
        variant="contained"
        color={'default'}
      >
        <div className={'authButtonLogo'}>
          <MailIcon />
        </div>
        <p>{t('NewLogin.Email')}</p>
      </MainButton>
      <AuthSeparator />
      <MainButton
        onClick={pushSignup}
        className={'authOutlinedButton'}
        variant="outlined"
        text={t('NewLogin.Signup')}
      />
      <TermsOfUseCaption />
      <Typography
        className={classNames(['continueAsGuestButton', openSans.className])}
      >
        <Trans i18nKey="NewLogin.Guest" i18n={i18n}>
          {t('NewLogin.Guest')}
          <Link onClick={() => router.push(AuthData.state.startPage || '/')}>
            Continue as Guest
          </Link>
        </Trans>
      </Typography>
      <GetAppsAuth />
    </AuthWrapper>
  );
};
