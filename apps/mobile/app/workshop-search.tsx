import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { SafeScreen } from '../components/ui/safe-screen';
import { useWorkshopSearch } from '../lib/api/use-workshop-search';
import { useMyWorkshops } from '../lib/api/use-my-workshops';
import { useUpsertWorkshop } from '../lib/api/use-upsert-workshop';
import { useWorkshopPickerStore } from '../lib/store/workshop-picker-store';
import { colors } from '../lib/colors';
import type { Workshop, WorkshopSuggestion } from '../lib/types/workshop';

export default function WorkshopSearchScreen() {
  const [query, setQuery] = useState('');
  const sessionToken = useMemo(() => Crypto.randomUUID(), []);
  const setSelection = useWorkshopPickerStore((s) => s.setSelection);

  const search = useWorkshopSearch({ query, sessionToken });
  const upsert = useUpsertWorkshop();

  const showingResults = query.trim().length >= 2;
  const hasResults = (search.data?.length ?? 0) > 0;
  const showAddManually = showingResults && !search.isFetching && !hasResults;

  const handleSelectMine = useCallback(
    (w: Workshop) => {
      setSelection({ id: w.id, name: w.name, address: w.address ?? null });
      router.back();
    },
    [setSelection],
  );

  const handleSelectSuggestion = useCallback(
    async (s: WorkshopSuggestion) => {
      try {
        const workshop = await upsert.mutateAsync({
          placeId: s.placeId,
          sessionToken,
        });
        setSelection({
          id: workshop.id,
          name: workshop.name,
          address: workshop.address ?? null,
        });
        router.back();
      } catch {
        // surface minimally; keep user on screen so they can retry or add manually
      }
    },
    [upsert, sessionToken, setSelection],
  );

  const handleAddManually = useCallback(() => {
    router.push({
      pathname: '/workshop-manual',
      params: { prefill: query },
    });
  }, [query]);

  return (
    <SafeScreen showAppBar={false} scrollable={false}>
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text className="text-[13px] font-sans-bold text-charcoal">
            Cancel
          </Text>
        </Pressable>
        <Text className="text-[13px] font-sans-bold text-charcoal">
          Select workshop
        </Text>
        <View className="w-10" />
      </View>

      <View className="bg-surface-low rounded-2xl flex-row items-center px-3 py-2 mb-4">
        <MaterialCommunityIcons
          name="magnify"
          size={18}
          color={colors.charcoal}
        />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search workshops…"
          placeholderTextColor={`${colors.charcoal}88`}
          className="flex-1 ml-2 text-[15px] font-sans-medium text-charcoal"
          returnKeyType="search"
        />
        {search.isFetching ? (
          <ActivityIndicator size="small" color={colors.charcoal} />
        ) : query.length > 0 ? (
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <MaterialCommunityIcons
              name="close"
              size={16}
              color={colors.charcoal}
            />
          </Pressable>
        ) : null}
      </View>

      {showingResults ? (
        <FlatList
          data={search.data ?? []}
          keyExtractor={(item) => item.placeId}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ResultRow
              name={item.name}
              address={item.address}
              onPress={() => handleSelectSuggestion(item)}
            />
          )}
          ListEmptyComponent={
            search.isFetching ? null : (
              <Text className="text-[12px] font-sans-medium text-charcoal/55 py-6 text-center">
                No workshops found.
              </Text>
            )
          }
        />
      ) : (
        <MyWorkshopsList onSelect={handleSelectMine} />
      )}

      {showAddManually && (
        <Pressable
          onPress={handleAddManually}
          accessibilityRole="button"
          className="rounded-2xl bg-sand/20 py-4 items-center mt-2 active:opacity-90"
        >
          <Text className="text-[13px] font-sans-bold text-charcoal">
            Can&apos;t find it? Add manually
          </Text>
        </Pressable>
      )}
    </SafeScreen>
  );
}

function ResultRow({
  name,
  address,
  onPress,
}: {
  name: string;
  address: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3 active:opacity-80"
    >
      <View className="w-9 h-9 rounded-xl bg-sand/20 items-center justify-center mr-3">
        <MaterialCommunityIcons
          name="wrench"
          size={16}
          color={colors.charcoal}
        />
      </View>
      <View className="flex-1 pr-2">
        <Text
          className="text-[15px] font-sans-bold text-charcoal"
          numberOfLines={1}
        >
          {name}
        </Text>
        {!!address && (
          <Text
            className="text-[12px] font-sans-medium text-charcoal/55 mt-0.5"
            numberOfLines={1}
          >
            {address}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

function MyWorkshopsList({
  onSelect,
}: {
  onSelect: (w: Workshop) => void;
}) {
  const { data, isLoading } = useMyWorkshops();

  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator color={colors.charcoal} />
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="py-8 px-4 items-center">
        <Text className="text-[12px] font-sans-medium text-charcoal/55 text-center">
          Start typing to search workshops.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-2 mt-1">
        Your workshops
      </Text>
      <FlatList
        data={data}
        keyExtractor={(w) => w.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ResultRow
            name={item.name}
            address={item.address ?? null}
            onPress={() => onSelect(item)}
          />
        )}
      />
    </View>
  );
}
