import { useMemo } from 'react';
import { useSelector } from 'reduxStore/DappProviderContext';
import { accountInfoSelector } from 'reduxStore/selectors';
import { useGetAccount } from './useGetAccount';

export const useGetAccountInfo = () => {
  const account = useGetAccount();
  const info = useSelector(accountInfoSelector);

  const accountInfo = useMemo(() => {
    return {
      ...info,
      account
    };
  }, [account, info]);

  return accountInfo;
};
