import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';
import { TextField } from '../../components/ui/text-field';
import { registerSchema, RegisterFormValues } from '../../lib/validation/auth-schema';
import { useRegister } from '../../lib/api/use-auth';

export default function RegisterScreen() {
  const [error, setError] = useState<string | null>(null);
  const { mutate: register, isPending } = useRegister();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    setError(null);
    register(values, {
      onError: (err) => {
        const msg = (err as Error).message;
        setError(msg ?? 'Registration failed');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeScreen scrollable>
        <ScreenHeader
          title="Create account"
          rightAction={
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-yellow font-sans-medium text-sm">Sign in</Text>
            </TouchableOpacity>
          }
        />

        {/* Error banner */}
        {error ? (
          <View className="bg-danger-surface rounded-lg px-lg py-md mb-lg">
            <Text className="text-sm text-danger font-sans">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="gap-xs">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Full name"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Password"
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Confirm password"
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <TouchableOpacity
            className="bg-charcoal rounded-full py-md items-center mt-sm"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-semibold text-sm">
              {isPending ? 'Creating account...' : 'Create account'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    </KeyboardAvoidingView>
  );
}
