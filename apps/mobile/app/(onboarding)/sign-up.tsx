import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../../components/ui/text-field';
import { FormField } from '../../components/ui/form-field';
import { registerSchema, RegisterFormValues } from '../../lib/validation/auth-schema';
import { useRegister } from '../../lib/api/use-auth';
import { justRegisteredRef } from '../../lib/auth-state';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

export default function SignUpScreen() {
  const [error, setError] = useState<string | null>(null);
  const { mutate: register, isPending } = useRegister();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    setError(null);
    register(values, {
      onSuccess: () => {
        justRegisteredRef.current = true; // guard SIGNED_IN auto-redirect
        router.push('/(onboarding)/success' as any);
      },
      onError: (err) => setError((err as Error).message ?? 'Registration failed'),
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView className="flex-1 bg-surface">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}>
          {/* Back */}
          <TouchableOpacity
            className="mb-lg"
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.charcoal} />
          </TouchableOpacity>

          {/* Logo */}
          <View className="mb-xl">
            <View className="w-12 h-12 bg-charcoal rounded-2xl items-center justify-center mb-md">
              <MaterialCommunityIcons name="motorbike" size={24} color="white" />
            </View>
            <Text className="text-3xl font-sans-bold text-charcoal">KICKSTAND</Text>
            <Text className="text-sm font-sans-medium text-sand mt-xs">Your digital garage for the extraordinary.</Text>
          </View>

          {/* Error banner */}
          {error ? (
            <View className="bg-danger-surface rounded-lg px-md py-sm mb-md">
              <Text className="text-sm text-danger font-sans-medium">{error}</Text>
            </View>
          ) : null}

          {/* Form fields */}
          <View className="gap-xs">
            <FormField control={control} name="name" errors={errors}>
              <TextField label="Full Name" autoCapitalize="words" />
            </FormField>
            <FormField control={control} name="email" errors={errors}>
              <TextField label="Email Address" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </FormField>
            <FormField control={control} name="password" errors={errors}>
              <TextField label="Secure Password" secureTextEntry />
            </FormField>
            <FormField control={control} name="confirmPassword" errors={errors}>
              <TextField label="Confirm Password" secureTextEntry />
            </FormField>
          </View>

          {/* Submit */}
          <TouchableOpacity
            className="bg-yellow rounded-full py-md items-center flex-row justify-center gap-xs mt-lg"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <Text className="text-charcoal font-sans-bold text-base">
              {isPending ? 'Creating...' : 'Create Account'}
            </Text>
            {!isPending && <Text className="text-charcoal font-sans-bold">→</Text>}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            className="items-center mt-md"
            onPress={() => router.push('/(auth)/login' as any)}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-sans-medium text-sand">
              Already have an account?{' '}
              <Text className="text-charcoal font-sans-semibold">Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
