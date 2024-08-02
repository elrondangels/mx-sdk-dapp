import { loginAction } from 'reduxStore/commonActions';
import { loginInfoSelector } from 'reduxStore/selectors';
import { setTokenLogin } from 'reduxStore/slices';
import { store } from 'reduxStore/store';
import { LoginMethodsEnum } from 'types';
import { decodeNativeAuthToken } from './decodeNativeAuthToken';

export function loginWithNativeAuthToken(
  token: string,
  dispatch = store.dispatch
) {
  const nativeAuthInfo = decodeNativeAuthToken(token);
  const loginInfo = loginInfoSelector(store.getState());

  if (nativeAuthInfo == null) {
    return;
  }

  const { signature, address } = nativeAuthInfo;

  if (signature && token && address) {
    dispatch(
      setTokenLogin({
        loginToken: token,
        signature,
        nativeAuthToken: token
      })
    );

    dispatch(
      loginAction({
        address,
        loginMethod: loginInfo.loginMethod || LoginMethodsEnum.extra
      })
    );
  }
}
