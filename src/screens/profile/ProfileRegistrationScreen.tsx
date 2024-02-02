import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow
} from '../../components';
import { Icon, colors, consts, texts } from '../../config';
import { profileRegister } from '../../queries/profile';
import { ProfileRegistration, ScreenName } from '../../types';

const { EMAIL_REGEX } = consts;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.profile.registrationFailedTitle, texts.profile.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.profile.privacyCheckRequireTitle, texts.profile.privacyCheckRequireBody);

// eslint-disable-next-line complexity
export const ProfileRegistrationScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isSecureTextEntryConfirmation, setIsSecureTextEntryConfirmation] = useState(true);
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const dataPrivacyLink = route.params?.webUrl ?? '';

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<ProfileRegistration>({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: '',
      dataPrivacyCheck: false
    }
  });
  const password = watch('password');

  const { mutate: mutateRegister, isLoading, reset } = useMutation(profileRegister);

  const onSubmit = (registerData: ProfileRegistration) => {
    if (!hasAcceptedDataPrivacy) return showPrivacyCheckedAlert();

    mutateRegister(
      { ...registerData, dataPrivacyCheck: hasAcceptedDataPrivacy },
      {
        onSuccess: (responseData) => {
          if (!responseData?.status || responseData?.errorMessage) {
            showRegistrationFailAlert();
            reset();
            return;
          }

          navigation.navigate(ScreenName.ProfileLogin, {
            email: registerData.email,
            password: registerData.password
          });
        }
      }
    );
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.registrationTitle} />
          </WrapperRow>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.profile.email}
              placeholder={texts.profile.email}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.profile.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.profile.emailInvalid }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="password"
              label={texts.profile.password}
              placeholder={texts.profile.password}
              textContentType="password"
              autoCompleteType="password"
              secureTextEntry={isSecureTextEntry}
              rightIcon={
                <InputSecureTextIcon
                  isSecureTextEntry={isSecureTextEntry}
                  setIsSecureTextEntry={setIsSecureTextEntry}
                />
              }
              validate
              rules={{
                required: texts.profile.passwordError,
                minLength: { value: 5, message: texts.profile.passwordLengthError }
              }}
              errorMessage={errors.password && errors.password.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="passwordConfirmation"
              label={texts.profile.passwordConfirmation}
              placeholder={texts.profile.passwordConfirmation}
              textContentType="password"
              autoCompleteType="password"
              secureTextEntry={isSecureTextEntryConfirmation}
              rightIcon={
                <InputSecureTextIcon
                  isSecureTextEntry={isSecureTextEntryConfirmation}
                  setIsSecureTextEntry={setIsSecureTextEntryConfirmation}
                />
              }
              validate
              rules={{
                required: texts.profile.passwordError,
                minLength: { value: 5, message: texts.profile.passwordLengthError },
                validate: (value: string) => value === password || texts.profile.passwordDoNotMatch
              }}
              errorMessage={errors.passwordConfirmation && errors.passwordConfirmation.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Checkbox
              boldTitle={undefined}
              center={false}
              checked={hasAcceptedDataPrivacy}
              checkedIcon={<Icon.SquareCheckFilled />}
              containerStyle={undefined}
              link={dataPrivacyLink}
              linkDescription={texts.profile.privacyCheckLink}
              onPress={() => setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy)}
              title={texts.profile.privacyChecked}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.register}
              disabled={isLoading}
            />

            <RegularText />

            <RegularText primary center>
              {texts.profile.alreadyRegistered}
              <RegularText
                primary
                underline
                onPress={() =>
                  navigation.navigate(ScreenName.ProfileLogin, { webUrl: dataPrivacyLink })
                }
              >
                {texts.profile.login}
              </RegularText>
            </RegularText>
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
