import { Address } from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';
import addressIsValid from 'utils/account/addressIsValid';
import decodePart from 'utils/decoders/decodePart';
import { TransactionTypesEnum } from '../../types/transactions';

const noData = {
  tokenId: '',
  amount: ''
};

const decodeData = (data: string) => {
  const nonceIndex = 2;
  const amountIndex = 3;
  const parts = data.split('@');
  const decodedParts = parts.map((part, i) =>
    [nonceIndex, amountIndex].includes(i) ? part : decodePart(part)
  );
  return decodedParts;
};

export function getTokenFromData(data?: string): {
  tokenId: string;
  amount: string;
  collection?: string;
  nonce?: string;
  receiver?: string;
} {
  if (!data) {
    return noData;
  }

  const isTokenTransfer = data.startsWith(TransactionTypesEnum.ESDTTransfer);
  const nftTransfer =
    data.startsWith(TransactionTypesEnum.ESDTNFTTransfer) && data.includes('@');

  if (isTokenTransfer) {
    const [, encodedToken, encodedAmount] = data.split('@');
    try {
      const tokenId = Buffer.from(encodedToken, 'hex').toString('ascii');

      if (!tokenId) {
        return noData;
      }

      const amount = new BigNumber(
        '0x' + encodedAmount.replace('0x', '')
      ).toString(10);

      return {
        tokenId,
        amount
      };
    } catch (e) {}
  }

  if (nftTransfer) {
    try {
      const [, /*ESDTNFTTransfer*/ collection, nonce, quantity, receiver] =
        decodeData(data);
      if (
        [collection, nonce, quantity, receiver].every((el) => Boolean(el)) &&
        addressIsValid(new Address(receiver).bech32())
      ) {
        return {
          tokenId: `${collection}-${nonce}`,
          amount: new BigNumber(quantity, 16).toString(10),
          collection,
          nonce,
          receiver: new Address(receiver).bech32()
        };
      }
    } catch (err) {}
  }

  return noData;
}
export default getTokenFromData;
