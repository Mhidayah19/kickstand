import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { SafeScreen } from '../../components/ui/safe-screen';
import { TextField } from '../../components/ui/text-field';
import { loginSchema, LoginFormValues } from '../../lib/validation/auth-schema';
import { useLogin } from '../../lib/api/use-auth';

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);
  const { mutate: login, isPending } = useLogin();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null);
    login(values, {
      onError: (err) => setError(err.message ?? 'Sign in failed'),
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeScreen scrollable>
        {/* Logo area */}
        <View className="items-center pt-3xl pb-2xl">
          <View className="w-16 h-16 bg-charcoal rounded-2xl items-center justify-center mb-lg">
            <Text className="text-4xl">🏍️</Text>
          </View>
          <Text className="text-3xl font-sans-bold text-charcoal">Kickstand</Text>
          <Text className="text-sm font-sans text-sand mt-xs">Your bike's AI companion</Text>
        </View>

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

          <TouchableOpacity
            className="bg-charcoal rounded-full py-md items-center mt-sm"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-semibold text-sm">
              {isPending ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-xl gap-md">
          <View className="flex-1 h-px bg-outline" />
          <Text className="text-xs text-sand font-sans">or</Text>
          <View className="flex-1 h-px bg-outline" />
        </View>

        {/* Create account */}
        <TouchableOpacity
          className="border border-outline rounded-full py-md items-center"
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.7}
        >
          <Text className="text-charcoal font-sans-medium text-sm">Create account</Text>
        </TouchableOpacity>
      </SafeScreen>
    </KeyboardAvoidingView>
  );
}
