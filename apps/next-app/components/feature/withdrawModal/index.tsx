import { useState } from 'react';
import TransactionFeeModal from 'components/feature/transactionFeeModal';
import Modal from 'components/shared/modal';
import Icon from 'components/shared/icon';
import {
  conversionType,
  ConversionTypeProps,
} from 'utils/constants/paymentsModal';
import { imagesSvg } from 'utils/constants/imagesSrc';
import { WithdrawModalProps } from './types';

import styles from './withdrawModal.module.scss';

export default function WithdrawModal({
  open,
  setOpen,
  bunkNumber,
  balance,
  setOpenChild,
}: WithdrawModalProps): JSX.Element {
  return (
    <Modal
      isModalVisible={open}
      onCancel={() => setOpen(false)}
      className={styles.withdrawModal}
      closeIcon={<Icon src={imagesSvg.close} width={22} height={22} />}
    >
      <div className={styles.titleSection}>
        <h1>Withdraw</h1>
        <Icon src={imagesSvg.gradientLine} width={60} height={3} />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.firstSection}>
          <div>
            <h3>Balance</h3>
            <h1>${balance}*</h1>
            <div className={styles.informationSection}>
              <p>*Transaction fees are included</p>
              <span className={styles.warning}>
                <Icon
                  src={imagesSvg.warning}
                  width={15}
                  height={15}
                  className={styles.warning}
                />
              </span>
            </div>
          </div>
          <div className={styles.rightSection}>
            <p>Conversion</p>
            <div className={styles.conversionContainer}>
              {conversionType.map(
                (e: ConversionTypeProps, index: number): JSX.Element => (
                  <div
                    key={index}
                    className={`${styles.conversionType} ${
                      e.active && styles.activeConversion
                    }`}
                  >
                    <Icon src={e.icon} width={25} height={25} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        <div className={styles.secondSection}>
          <h1>Select your withdrawal currency</h1>
          {conversionType
            .map(
              (e: ConversionTypeProps, index: number): JSX.Element => (
                <div key={index} className={styles.successWalletSelector}>
                  {e.active && (
                    <div className={styles.successIcon}>
                      <Icon src={imagesSvg.success} width={25} height={25} />
                    </div>
                  )}
                  <div
                    className={`${styles.withdrawSelector} ${
                      e.active && styles.activeWithdrawSelector
                    }`}
                  >
                    <Icon src={e.icon} width={20} height={20} />
                    <h1>{e.title}</h1>
                  </div>
                </div>
              )
            )
            .reverse()}
          <span>
            *Any changes to the withdrawal currency will reflect after 24 hours
          </span>
          <h2>Withdrawal Bank Account</h2>
          <div className={styles.bankSection}>
            <Icon src={imagesSvg.bankIcon} width={28} height={28} />
            {/* To do number cut functionality */}
            <h1>Bank number ending with ***{bunkNumber}</h1>
          </div>
          <p>
            *To change, <span> click here </span>or got your profile screen
          </p>
        </div>
        <div
          className={styles.withdrawConfirmButton}
          onClick={() => {
            setOpen(false);
            setOpenChild(true);
          }}
        >
          <h1>Withdraw</h1>
          <Icon src={imagesSvg.nextIcon} width={38} height={38} />
        </div>
      </div>
    </Modal>
  );
}