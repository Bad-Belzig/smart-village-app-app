import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { v4 as uuid } from 'uuid';

import { Icon, colors, normalize, texts } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import { VOUCHER_DEVICE_TOKEN, VOUCHER_TRANSACTIONS } from '../../helpers/voucherHelper';
import { useVoucher } from '../../hooks';
import { REDEEM_QUOTA_OF_VOUCHER } from '../../queries/vouchers';
import { TQuota } from '../../types';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';

const defaultTime = 15 * 60; // 15 * 60 sec.

export const VoucherRedeem = ({ quota, voucherId }: { quota: TQuota; voucherId: string }) => {
  const { isLoggedIn, memberId } = useVoucher();
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(defaultTime);
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // TODO: set voucher availability
  const [isExpiredVoucher, setIsExpiredVoucher] = useState(false);

  const { maxPerPerson } = quota;

  const [redeemQuotaOfVoucher] = useMutation(REDEEM_QUOTA_OF_VOUCHER);

  useEffect(() => {
    if (isRedeemingVoucher) {
      const interval = setInterval(() => {
        if (remainingTime > 0) {
          setRemainingTime(remainingTime - 1);
        } else {
          clearInterval(interval);
          setIsExpiredVoucher(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(defaultTime);
    }
  }, [remainingTime, isRedeemingVoucher]);

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const redeemVoucher = async () => {
    try {
      let deviceToken = await readFromStore(VOUCHER_DEVICE_TOKEN);

      if (!deviceToken) {
        deviceToken = uuid();
        addToStore(VOUCHER_DEVICE_TOKEN, deviceToken);
      }

      redeemQuotaOfVoucher({
        variables: {
          deviceToken,
          quantity,
          voucherId,
          memberId
        }
      });

      const voucherTransactions = (await readFromStore(VOUCHER_TRANSACTIONS)) || [];
      const voucherTransaction = {
        deviceToken,
        quantity,
        voucherId,
        memberId,
        createdAt: new Date().toISOString()
      };

      addToStore(VOUCHER_TRANSACTIONS, [...voucherTransactions, voucherTransaction]);

      setIsRedeemingVoucher(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* TODO: button availability will be adjusted according to voucher availability */}
      <Button
        disabled={!isLoggedIn}
        title={texts.voucher.detailScreen.redeem}
        onPress={() => setIsVisible(true)}
      />

      <Modal
        animationType="none"
        transparent
        visible={isVisible}
        supportedOrientations={['landscape', 'portrait']}
      >
        <View style={styles.sheetBackgroundContainer}>
          <View style={styles.sheetContainer}>
            {isExpiredVoucher ? (
              <WrapperVertical>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.redeemErrorTitle}</BoldText>
                </Wrapper>

                <Wrapper style={[styles.progressContainer, styles.expiredViewContainer]}>
                  <Icon.Close size={normalize(120)} color={colors.surface} />
                  <RegularText lightest>
                    {texts.voucher.detailScreen.redeemErrorDescription}
                  </RegularText>
                </Wrapper>

                <Wrapper style={styles.noPaddingBottom}>
                  <Touchable
                    onPress={() => {
                      setIsVisible(false);
                      setIsRedeemingVoucher(false);
                      setIsExpiredVoucher(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText small center underline lightest>
                      {texts.voucher.detailScreen.close}
                    </BoldText>
                  </Touchable>
                </Wrapper>
              </WrapperVertical>
            ) : isRedeemingVoucher ? (
              <WrapperVertical>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.redeemTitle}</BoldText>
                </Wrapper>

                <Wrapper style={styles.noPaddingTop}>
                  <RegularText lightest>{texts.voucher.detailScreen.redeemDescription}</RegularText>
                </Wrapper>

                <Wrapper style={styles.progressContainer}>
                  <RegularText style={styles.progressOvertitle} lightest>
                    {texts.voucher.detailScreen.progressTitle}
                  </RegularText>

                  <CircularProgress
                    activeStrokeColor={colors.primary}
                    inActiveStrokeColor={colors.lighterPrimary}
                    maxValue={100}
                    radius={120}
                    showProgressValue={false}
                    subtitle={texts.voucher.detailScreen.progressSubtitle}
                    subtitleColor={colors.surface}
                    subtitleFontSize={normalize(15)}
                    title={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
                      2,
                      '0'
                    )}`}
                    titleColor={colors.surface}
                    titleFontSize={normalize(50)}
                    titleStyle={styles.progressTitle}
                    value={((defaultTime - remainingTime) / defaultTime) * 100}
                  />
                </Wrapper>

                <Wrapper style={styles.noPaddingBottom}>
                  <Touchable
                    onPress={() => {
                      setIsVisible(false);
                      setIsRedeemingVoucher(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText small center underline lightest>
                      {texts.voucher.detailScreen.close}
                    </BoldText>
                  </Touchable>
                </Wrapper>
              </WrapperVertical>
            ) : (
              <WrapperVertical>
                <Wrapper>
                  <BoldText lightest>{texts.voucher.detailScreen.sheetTitle}</BoldText>
                </Wrapper>

                <Wrapper style={styles.noPaddingTop}>
                  <RegularText lightest>{texts.voucher.detailScreen.sheetDescription}</RegularText>
                </Wrapper>

                <Wrapper style={styles.noPaddingTop}>
                  <Checkbox
                    checked={isChecked}
                    checkedColor={colors.surface}
                    checkedIcon="check-square-o"
                    containerStyle={styles.checkbox}
                    title={texts.voucher.detailScreen.checkboxLabel}
                    onPress={() => setIsChecked(!isChecked)}
                    uncheckedColor={colors.surface}
                    uncheckedIcon="square-o"
                    lightest
                  />
                </Wrapper>

                {!!maxPerPerson && maxPerPerson > 1 && (
                  <Wrapper style={styles.noPaddingTop}>
                    <WrapperRow style={styles.quantityContainer}>
                      <RegularText lightest small>
                        {texts.voucher.detailScreen.desiredQuantity}:
                      </RegularText>

                      <View style={styles.quantityButtonContainer}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (quantity > 1) {
                              setQuantity(quantity - 1);
                            }
                          }}
                        >
                          <BoldText lightest>－</BoldText>
                        </TouchableOpacity>
                        <BoldText lightest>{quantity}</BoldText>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => {
                            if (quantity < maxPerPerson) {
                              setQuantity(quantity + 1);
                            }
                          }}
                        >
                          <BoldText lightest>＋</BoldText>
                        </TouchableOpacity>
                      </View>
                    </WrapperRow>
                  </Wrapper>
                )}

                <Wrapper style={styles.noPaddingBottom}>
                  <TouchableOpacity
                    disabled={!isChecked}
                    style={[styles.button, !isChecked && styles.buttonDisabled]}
                    onPress={redeemVoucher}
                  >
                    <BoldText lightest>{texts.voucher.detailScreen.redeemNow}</BoldText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.closeButton]}
                    onPress={() => {
                      setIsVisible(false);
                      setIsChecked(false);
                    }}
                  >
                    <BoldText lightest>{texts.voucher.detailScreen.cancel}</BoldText>
                  </TouchableOpacity>
                </Wrapper>
              </WrapperVertical>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(4),
    height: normalize(47),
    justifyContent: 'center',
    marginTop: normalize(12),
    width: '100%'
  },
  buttonDisabled: {
    backgroundColor: colors.placeholder
  },
  checkbox: {
    backgroundColor: colors.transparent,
    padding: 0
  },
  closeButton: {
    backgroundColor: colors.transparent,
    borderColor: colors.surface,
    borderWidth: normalize(1),
    marginTop: normalize(16)
  },
  expiredViewContainer: {
    alignItems: 'center',
    marginVertical: normalize(45),
    paddingTop: 0
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  noPaddingTop: {
    paddingTop: 0
  },
  progressContainer: {
    alignSelf: 'center'
  },
  progressOvertitle: {
    alignSelf: 'center',
    position: 'absolute',
    top: normalize(75)
  },
  progressTitle: {
    alignSelf: 'center',
    fontWeight: 'bold',
    marginTop: normalize(30)
  },
  quantityButton: {
    alignItems: 'center',
    width: normalize(20)
  },
  quantityButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.shadowRgba,
    borderColor: colors.surface,
    borderRadius: normalize(20),
    borderWidth: normalize(1),
    flexDirection: 'row',
    height: normalize(32),
    justifyContent: 'space-around',
    marginLeft: normalize(16),
    width: normalize(93)
  },
  quantityContainer: {
    alignItems: 'center'
  },
  sheetBackgroundContainer: {
    backgroundColor: colors.shadowRgba,
    flex: 1
  },
  sheetContainer: {
    backgroundColor: colors.darkerPrimary,
    borderTopLeftRadius: normalize(5),
    borderTopRightRadius: normalize(5),
    bottom: 0,
    paddingBottom: normalize(20),
    position: 'absolute',
    width: '100%'
  }
});
