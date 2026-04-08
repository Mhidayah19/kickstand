import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

const THUMB = 72;
const THUMB_RADIUS = 10;

interface ReceiptStripProps {
  urls: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onPress: (index: number) => void;
  uploadingCount?: number;
  maxCount?: number;
}

export function ReceiptStrip({
  urls,
  onAdd,
  onRemove,
  onPress,
  uploadingCount = 0,
  maxCount = 5,
}: ReceiptStripProps) {
  const canAddMore = urls.length + uploadingCount < maxCount;

  if (urls.length === 0 && uploadingCount === 0) {
    return (
      <Pressable
        onPress={onAdd}
        className="border-2 border-dashed border-outline rounded-xl py-3xl items-center justify-center active:opacity-70"
      >
        <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
        <Text className="font-sans-bold text-sm text-outline mt-sm">
          Upload Evidence
        </Text>
      </Pressable>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        {urls.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            style={{ width: THUMB, height: THUMB, borderRadius: THUMB_RADIUS, overflow: 'hidden', backgroundColor: colors.surfaceLow }}
          >
            <Pressable onPress={() => onPress(index)} style={{ flex: 1 }} className="active:opacity-80">
              <Image source={{ uri }} style={{ width: THUMB, height: THUMB }} resizeMode="cover" />
            </Pressable>
            <Pressable
              onPress={() => onRemove(index)}
              hitSlop={4}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.danger,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="close" size={10} color="#fff" />
            </Pressable>
          </View>
        ))}

        {uploadingCount > 0 && (
          <View
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB_RADIUS,
              backgroundColor: colors.surfaceLow,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <ActivityIndicator size="small" color={colors.yellow} />
            <Text style={{ color: colors.yellow, fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold' }}>
              {uploadingCount > 1 ? `${uploadingCount} left` : 'Uploading'}
            </Text>
          </View>
        )}

        {canAddMore && (
          <Pressable
            onPress={onAdd}
            style={{
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB_RADIUS,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: colors.outline,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
            className="active:opacity-70"
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.outline} />
            <Text style={{ color: colors.outline, fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold' }}>
              Add
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <Text className="font-sans-medium text-xxs text-sand text-right mt-1">
        {urls.length} of {maxCount}
      </Text>
    </View>
  );
}
