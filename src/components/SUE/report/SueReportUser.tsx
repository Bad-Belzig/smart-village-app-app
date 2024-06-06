import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { colors, consts, normalize, texts } from '../../../config';
import { TValues } from '../../../screens';
import { Checkbox } from '../../Checkbox';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';

const { EMAIL_REGEX, PHONE_NUMBER_REGEX } = consts;

export const SueReportUser = ({
  configuration,
  control,
  errors,
  requiredInputs
}: {
  configuration: any;
  control: any;
  errors: any;
  requiredInputs: keyof TValues[];
}) => {
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  return (
    <View style={styles.container}>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="firstName"
          label={`${texts.sue.report.firstName} ${
            requiredInputs?.includes('firstName') ? '*' : ''
          }`}
          placeholder={texts.sue.report.firstName}
          textContentType="givenName"
          control={control}
          ref={firstNameRef}
          onSubmitEditing={() => lastNameRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="lastName"
          label={`${texts.sue.report.lastName} ${requiredInputs?.includes('lastName') ? '*' : ''}`}
          placeholder={texts.sue.report.lastName}
          textContentType="familyName"
          control={control}
          ref={lastNameRef}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="email"
          label={`${texts.sue.report.email} ${requiredInputs?.includes('email') ? '*' : ''}`}
          placeholder={texts.sue.report.email}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          control={control}
          ref={emailRef}
          rules={{
            required: false,
            pattern: {
              value: EMAIL_REGEX,
              message: texts.sue.report.alerts.invalidMail
            }
          }}
          errorMessage={errors.email && errors.email.message}
          onSubmitEditing={() => phoneRef.current?.focus()}
        />

        <RegularText small>{texts.sue.report.emailHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="phone"
          label={`${texts.sue.report.phone} ${requiredInputs?.includes('phone') ? '*' : ''}`}
          placeholder={texts.sue.report.phone}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          control={control}
          ref={phoneRef}
          rules={{
            required: false,
            pattern: {
              value: PHONE_NUMBER_REGEX,
              message: texts.sue.report.alerts.invalidPhone
            }
          }}
          errorMessage={errors.phone && errors.phone.message}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="termsOfService"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={!!value}
              onPress={() => onChange(!value)}
              link={
                configuration?.limitation?.privacyPolicy?.value ||
                'https://smart-village.app/datenschutzerklaerung/'
              }
              linkDescription={texts.sue.report.termsOfService}
              title={`${texts.defectReport.inputCheckbox} *`}
              checkedColor={colors.accent}
              checkedIcon="check-square-o"
              uncheckedColor={colors.darkText}
              uncheckedIcon="square-o"
              containerStyle={styles.checkboxContainerStyle}
              textStyle={styles.checkboxTextStyle}
            />
          )}
          control={control}
        />
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  },
  container: {
    paddingTop: normalize(14),
    width: '100%'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
