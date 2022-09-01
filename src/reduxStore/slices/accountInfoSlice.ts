import { Address } from '@elrondnetwork/erdjs';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { AccountType } from 'types/account.types';
import { storage } from 'utils/storage';
import { localStorageKeys } from 'utils/storage/local';

import {
  loginAction,
  logoutAction,
  LoginActionPayloadType
} from '../commonActions';

export interface LedgerAccountType {
  index: number;
  address: string;
  hasContractDataEnabled: boolean;
  version: string;
}

export interface UpdateLedgerAccountPayloadType {
  index: number;
  address: string;
}

export interface AccountInfoSliceType {
  address: string;
  shard?: number;
  accounts: { [address: string]: AccountType };
  publicKey: string;
  ledgerAccount: LedgerAccountType | null;
  walletConnectAccount: string | null;
  isAccountLoading: boolean;
  accountLoadingError: string | null;
}

export const emptyAccount: AccountType = {
  balance: '...',
  address: '',
  nonce: 0,
  txCount: 0,
  scrCount: 0,
  claimableRewards: '0'
};

const initialState: AccountInfoSliceType = {
  address: '',
  accounts: { '': emptyAccount },
  ledgerAccount: null,
  publicKey: '',
  walletConnectAccount: null,
  isAccountLoading: true,
  accountLoadingError: null
};

export const accountInfoSlice = createSlice({
  name: 'accountInfoSlice',
  initialState: initialState,
  reducers: {
    setAddress: (
      state: AccountInfoSliceType,
      action: PayloadAction<string>
    ) => {
      const address = action.payload;
      state.address = address;
      state.publicKey = new Address(address).hex();
    },
    setAccount: (
      state: AccountInfoSliceType,
      action: PayloadAction<AccountType>
    ) => {
      // account fetching always comes after address is populated
      const isSameAddress = state.address === action.payload.address;
      state.accounts = {
        [state.address]: isSameAddress ? action.payload : emptyAccount
      };
      state.isAccountLoading = false;
      state.accountLoadingError = null;
    },
    setAccountNonce: (
      state: AccountInfoSliceType,
      action: PayloadAction<number>
    ) => {
      const { address } = state;
      state.accounts[address].nonce = action.payload;
    },
    setAccountShard: (
      state: AccountInfoSliceType,
      action: PayloadAction<number>
    ) => {
      state.shard = action.payload;
    },
    setLedgerAccount: (
      state: AccountInfoSliceType,
      action: PayloadAction<LedgerAccountType | null>
    ) => {
      state.ledgerAccount = action.payload;
    },
    updateLedgerAccount: (
      state: AccountInfoSliceType,
      action: PayloadAction<UpdateLedgerAccountPayloadType>
    ) => {
      if (state.ledgerAccount != null) {
        state.ledgerAccount.index = action.payload.index;
        state.ledgerAccount.address = action.payload.address;
      }
    },
    setWalletConnectAccount: (
      state: AccountInfoSliceType,
      action: PayloadAction<string | null>
    ) => {
      state.walletConnectAccount = action.payload;
    },
    setIsAccountLoading: (
      state: AccountInfoSliceType,
      action: PayloadAction<boolean>
    ) => {
      state.isAccountLoading = action.payload;
      state.accountLoadingError = null;
    },
    setAccountLoadingError: (
      state: AccountInfoSliceType,
      action: PayloadAction<string | null>
    ) => {
      state.accountLoadingError = action.payload;
      state.isAccountLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logoutAction, () => {
      storage.local.removeItem(localStorageKeys.loginExpiresAt);
      return initialState;
    });
    builder.addCase(
      loginAction,
      (
        state: AccountInfoSliceType,
        action: PayloadAction<LoginActionPayloadType>
      ) => {
        const { address } = action.payload;
        state.address = address;
        state.publicKey = new Address(address).hex();
      }
    );
    builder.addCase(REHYDRATE, (state, action: any) => {
      if (!action.payload?.account) {
        return;
      }

      const { account: accountInfo } = action.payload;
      const {
        address,
        shard,
        accounts,
        publicKey
      } = accountInfo as AccountInfoSliceType;
      state.address = address;
      state.shard = shard;
      const isAddressInAccounts = accounts && address in accounts;
      state.accounts = isAddressInAccounts ? accounts : initialState.accounts;
      state.publicKey = publicKey;
    });
  }
});

export const {
  setAccount,
  setAddress,
  setAccountNonce,
  setAccountShard,
  setLedgerAccount,
  updateLedgerAccount,
  setWalletConnectAccount,
  setIsAccountLoading,
  setAccountLoadingError
} = accountInfoSlice.actions;

export default accountInfoSlice.reducer;
