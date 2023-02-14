import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Notification from 'components/shared/notification';
import Icon from 'components/shared/icon';
import Timer from 'components/shared/timer';
import { useSocketContext } from 'utils/context/socket/context';
import { OrderServiceContext } from 'utils/services/service/orderService';
import { PaymentServiceContext } from 'utils/services/service/paymentService';
import { UserServiceContext } from 'utils/services/service/userService';
import * as localStorage from 'utils/services/localStorageService';
import { imagesSvg } from 'utils/constants/imagesSrc';
import { handleCopyText, handleQrCode } from 'utils/constants/functions';
import localStorageKeys from 'utils/constants/localStorageKeys';
import { ChildWallet } from 'utils/model/user';
import { QrPayWidgetScreenProps } from './types';
import { OrderDataResponse, OrderStatus } from 'types/orders';

import styles from './qrPayWidgetScreen.module.scss';

export default function QrPayWidgetScreen({
  setModal,
  orderDetails,
  primaryWalletId,
  usdt,
}: QrPayWidgetScreenProps): JSX.Element {
  const router = useRouter();
  const userService = useContext(UserServiceContext);
  const paymentService = useContext(PaymentServiceContext);
  const orderService = useContext(OrderServiceContext);
  const { socket } = useSocketContext();

  const identificationToken = router.asPath.split('=')[1];

  const [childWallet, setChildWallet] = useState<ChildWallet>();
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [listenerSet, setListenerSet] = useState<boolean>(false);
  const [qrContent, setQrContent] = useState<string>();
  const [timePassed, setTimePassed] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    await handleCopyText(childWallet.address);
    Notification('Wallet address copied successfully');
  };

  const handleChangeModal = (): void => {
    setModal(3);
  };

  const goBack = (): void => {
    setModal(1);
  };

  const createOrder = async (): Promise<OrderDataResponse> => {
    return await orderService.createOrder({
      title: orderDetails.product.name,
      amount: orderDetails.total,
      identificationToken,
    });
  };

  const updateOrder = async (
    status: OrderStatus
  ): Promise<OrderDataResponse> => {
    const updatedOrder = await orderService.updateOrder(
      localStorage
        .getItemFromLocalStorage(localStorageKeys.ORDER_ID)
        .toString(),
      identificationToken,
      { status }
    );

    if (updatedOrder?.success)
      localStorage.removeItemFromLocalStorage(localStorageKeys.ORDER_ID);

    return updatedOrder;
  };

  const getChildWalletForPay = async (): Promise<void> => {
    const wallet = await userService.getPayWallet(primaryWalletId);

    if (wallet?.success) {
      const url = await paymentService.payWithQr(
        wallet?.childWallet?.parentWalletId,
        wallet?.childWallet?._id,
        usdt
      );

      if (url) {
        const createdOrder = await createOrder();

        if (!createdOrder?.success) {
          console.log('createdOrder error: ', createdOrder.error);

          return;
        }

        localStorage.setItemInLocalStorage(
          localStorageKeys.ORDER_ID,
          createdOrder.data._id
        );
      }

      setChildWallet(wallet.childWallet);
      if (url?.success) {
        setQrContent(url?.data);
      }

      socket.emit('childWallet', {
        childId: wallet?.childWallet?._id,
        parentId: wallet?.childWallet?.parentWalletId,
        orderAmount: orderDetails.total,
      });
    }
  };

  socket.connect();

  useEffect(() => {
    getChildWalletForPay();
  }, []);

  useEffect(() => {
    if (qrContent) {
      const qr = handleQrCode(qrContent);
      setQrDataUrl(qr);
    }
  }, [qrContent]);

  const checkPaymentStatus = async (): Promise<void> => {
    if (timePassed) {
      socket.disconnect();
      return;
    }

    if (!listenerSet) {
      socket.on('childWallet', async (childWallet) => {
        if (childWallet?.success) {
          const updatedOrder = await updateOrder(OrderStatus.DONE);

          if (updatedOrder?.success) {
            socket.disconnect();
            handleChangeModal();
          }
        }
      });

      setListenerSet(true);
    }
  };

  const checkPassedTime = async (): Promise<void> => {
    if (timePassed) await updateOrder(OrderStatus.FAILED);
  };

  useEffect(() => {
    checkPaymentStatus();
  }, [listenerSet, timePassed]);

  useEffect(() => {
    checkPassedTime();
  }, [timePassed]);

  return (
    <div className={styles.container}>
      <div className={styles.goBack}>
        <Icon src={imagesSvg.goBack} width={30} height={20} onClick={goBack} />
        <div className={styles.price}>
          <div>
            Paying: <span>${orderDetails.total}</span>
          </div>
          <div>
            By USDT: <span>{usdt} USDT</span>
          </div>
        </div>
      </div>
      <div className={styles.payMethods}>
        <div className={styles.title}>Scan QR</div>
        <div className={styles.qrWrapper}>
          <img src={qrDataUrl} width={150} height={150} />
        </div>
        <span>or</span>
        <div className={styles.title}>Send to Wallet Address</div>
        <div className={styles.walletAddress}>
          <div className={styles.addressWrapper}>
            <Icon src={imagesSvg.wallet} width={20} height={20} />
            <div className={styles.address}>{childWallet?.address}</div>
          </div>
          <div className={styles.copyBackground}>
            <div className={styles.copyWrapper} onClick={handleCopy}>
              <Icon src={imagesSvg.copy} width={20} height={20} />
              <span>Copy</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.time}>
        <Icon src={imagesSvg.timer} width={20} height={20} />
        <div className={styles.text}>
          Payment expires in
          <Timer setCheckTime={setTimePassed} checkTime={timePassed} /> Minutes
        </div>
      </div>

      <div className={styles.support}>
        <div>
          Need any help please visit to <a>Support Center</a>
        </div>
        <div>
          If it is taking time, you can check the status on this <a>link</a>
        </div>
      </div>
      <div className={styles.modalFooter}>
        <Icon src={imagesSvg.modalLogo} width={100} height={40} />
        <div className={styles.infoSection}>
          <a>Help & Privacy Policy</a>
          <a>Terms & Conditions</a>
        </div>
      </div>
    </div>
  );
}
