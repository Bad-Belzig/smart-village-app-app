import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import * as appJson from '../../../app.json';
import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { consts, secrets, texts } from '../../config';
import { storeVolunteerAuthToken, storeVolunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { logIn, me } from '../../queries/volunteer';
import { ScreenName, VolunteerLogin } from '../../types';

const { a11yLabel } = consts;
const namespace = appJson.expo.slug as keyof typeof secrets;
const passwordForgottenUrl = secrets[namespace]?.volunteer?.passwordForgottenUrl;

const showLoginFailAlert = () =>
  Alert.alert(texts.volunteer.loginFailedTitle, texts.volunteer.loginFailedBody);

// eslint-disable-next-line complexity
export const VolunteerLoginScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<VolunteerLogin>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const { mutate: mutateLogIn, isLoading, isError, isSuccess, data, reset } = useMutation(logIn);
  const {
    isLoading: isLoadingMe,
    isError: isErrorMe,
    isSuccess: isSuccessMe,
    data: dataMe
  } = useQuery(QUERY_TYPES.VOLUNTEER.ME, me, {
    enabled: !!data?.auth_token, // the query will not execute until the auth token exists
    onSuccess: (responseData) => {
      if (!responseData?.account) {
        return;
      }

      // save user data to global state
      storeVolunteerUserData(responseData.account);

      // refreshUser param causes the home screen to update and no longer show the welcome component
      navigation.navigate(ScreenName.VolunteerHome, { refreshUser: new Date().valueOf() });
    }
  });

  const onSubmit = (loginData: VolunteerLogin) =>
    mutateLogIn(loginData, {
      onSuccess: (responseData) => {
        if (!responseData?.auth_token) {
          return;
        }

        // wait for saving auth token to global state
        return storeVolunteerAuthToken(responseData.auth_token);
      }
    });

  if (
    isError ||
    isErrorMe ||
    (isSuccess && data?.code && data?.code !== 200) ||
    (isSuccessMe && dataMe?.status && dataMe?.status !== 200)
  ) {
    showLoginFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${texts.volunteer.loginTitle} ${a11yLabel.heading}`}
              >
                {texts.volunteer.loginTitle}
              </Title>
            </TitleContainer>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="username"
                label={texts.volunteer.usernameOrEmail}
                placeholder={texts.volunteer.usernameOrEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                validate
                rules={{ required: true }}
                errorMessage={
                  errors.username && `${texts.volunteer.usernameOrEmail} muss ausgefüllt werden`
                }
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password"
                label={texts.volunteer.password}
                placeholder={texts.volunteer.password}
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
                rules={{ required: true }}
                errorMessage={
                  errors.password && `${texts.volunteer.password} muss ausgefüllt werden`
                }
                control={control}
              />
            </Wrapper>

            <Wrapper>
              <Touchable
                accessibilityLabel={`${texts.volunteer.passwordForgotten} ${a11yLabel.button}`}
                onPress={() =>
                  navigation.navigate(ScreenName.Web, {
                    title: texts.volunteer.passwordForgotten,
                    webUrl: passwordForgottenUrl,
                    injectedJavaScript: `
                      document.getElementById('app-title') && document.getElementById('app-title').remove();
                      document.getElementById('img-logo') && document.getElementById('img-logo').remove();
                      document.querySelector('button[type="submit"] + a') && document.querySelector('button[type="submit"] + a').remove();
                      document.querySelector('.powered') && document.querySelector('.powered').remove();
                    `
                  })
                }
              >
                <RegularText small underline>
                  {texts.volunteer.passwordForgotten}
                </RegularText>
              </Touchable>
            </Wrapper>

            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.volunteer.login}
                disabled={isLoading || isLoadingMe}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.volunteer.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>

          <LoadingModal loading={isLoading || isLoadingMe} />
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
