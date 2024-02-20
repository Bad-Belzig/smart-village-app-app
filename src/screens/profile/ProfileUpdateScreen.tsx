import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DateTimeInput,
  DefaultKeyboardAvoidingView,
  DropdownInput,
  Input,
  Label,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow
} from '../../components';
import { texts } from '../../config';
import { storeFirstLogin } from '../../helpers';
import { profileUpdate } from '../../queries/profile';
import { ProfileUpdate, ScreenName } from '../../types';

const showUpdateFailAlert = () =>
  Alert.alert(texts.profile.updateProfileFailedTitle, texts.profile.updateProfileFailedBody);

const genderData = [
  { value: 'Frau', gender: 'frau' },
  { value: 'Mann', gender: 'mann' },
  { value: 'divers', gender: 'divers' }
];

export const ProfileUpdateScreen = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileUpdate>({
    defaultValues: {
      birthday: undefined,
      city: '',
      firstName: '',
      gender: '',
      lastName: '',
      postcode: '',
      street: ''
    }
  });

  const {
    mutate: mutateUpdate,
    isError,
    isLoading,
    isSuccess,
    reset,
    data
  } = useMutation(profileUpdate);

  const onSubmit = (updateData: ProfileUpdate) =>
    mutateUpdate(updateData, {
      onSuccess: (responseData) => {
        if (!responseData?.member?.authentication_token) {
          return;
        }

        storeFirstLogin(false);

        // refreshUser param causes the home screen to update and no longer show the welcome component
        navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() });
      }
    });

  if (isError || (isSuccess && !data?.member)) {
    showUpdateFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.update} />
          </WrapperRow>

          <Wrapper>
            <Controller
              name="gender"
              render={({ field: { name, onChange, value } }) => (
                <DropdownInput
                  {...{
                    boldLabel: true,
                    control,
                    data: genderData,
                    errors,
                    label: texts.profile.gender,
                    name,
                    onChange,
                    showSearch: false,
                    value,
                    valueKey: 'gender'
                  }}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.firstName}
              name="firstName"
              placeholder={texts.profile.firstName}
              validate
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.lastName}
              name="lastName"
              placeholder={texts.profile.lastName}
              validate
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Controller
              name="birthday"
              render={({ field: { name, onChange, value } }) => (
                <DateTimeInput
                  {...{
                    boldLabel: true,
                    control,
                    errors,
                    label: texts.profile.birthday,
                    mode: 'date',
                    name,
                    onChange,
                    placeholder: texts.profile.birthday,
                    value
                  }}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.streetAndHouseNumber}
              name="street"
              placeholder={texts.profile.streetAndHouseNumber}
              validate
              rules={{ required: true }}
              errorMessage={
                errors.street && `${texts.profile.streetAndHouseNumber} muss ausgefüllt werden`
              }
            />
            <RegularText small placeholder>
              Die Arbeitsadresse ist auch möglich
            </RegularText>
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.postcode}
              maxLength={5}
              name="postcode"
              keyboardType="numeric"
              placeholder={texts.profile.postcode}
              validate
              rules={{
                required: `${texts.profile.postcode} muss ausgefüllt werden`,
                minLength: { value: 5, message: texts.profile.postcodeMinLength }
              }}
              errorMessage={errors.postcode && errors.postcode.message}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.city}
              name="city"
              placeholder={texts.profile.city}
              validate
              rules={{ required: true }}
              errorMessage={errors.city && `${texts.profile.city} muss ausgefüllt werden`}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.update}
              disabled={isLoading}
            />
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
