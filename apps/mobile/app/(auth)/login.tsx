import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../components/ui/safe-screen';
import { TextField } from '../../components/ui/text-field';
import { FormField } from '../../components/ui/form-field';
import { loginSchema, LoginFormValues } from '../../lib/validation/auth-schema';
import { useLogin } from '../../lib/api/use-auth';
import { DevAuthToggle } from '../../components/dev/DevAuthToggle';

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
          <View className="w-16 h-16 bg-ink rounded-2xl items-center justify-center mb-lg">
            <MaterialCommunityIcons name="motorbike" size={24} color="white" />
          </View>
          <DevAuthToggle>
            <Text className="text-3xl font-sans-bold text-ink">Kickstand</Text>
          </DevAuthToggle>
          <Text className="text-sm font-sans-medium text-muted mt-xs">{"Your bike's AI companion"}</Text>
        </View>

        {/* Error banner */}
        {error ? (
          <View className="bg-danger-surface rounded-lg px-lg py-md mb-lg">
            <Text className="text-sm text-danger font-sans-medium">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="gap-xs">
          <FormField control={control} name="email" errors={errors}>
            <TextField label="Email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </FormField>
          <FormField control={control} name="password" errors={errors}>
            <TextField label="Password" secureTextEntry />
          </FormField>

          <TouchableOpacity
            className="bg-ink rounded-full py-md items-center mt-sm"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <Text className="text-white font-sans-semibold text-sm">
              {isPending ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View className="items-center my-2xl">
          <Text className="text-xs text-muted font-sans-medium">or</Text>
        </View>

        {/* Create account */}
        <TouchableOpacity
          className="border border-hairline-2 rounded-full py-md items-center"
          onPress={() => router.push('/(onboarding)/sign-up')}
          activeOpacity={0.7}
        >
          <Text className="text-ink font-sans-medium text-sm">Create account</Text>
        </TouchableOpacity>
      </SafeScreen>
    </KeyboardAvoidingView>
  );
}
