import { cloneElement, type ReactElement } from 'react';
import { Controller, type Control, type FieldValues, type Path, type FieldErrors } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  errors: FieldErrors<T>;
  children: ReactElement;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  errors,
  children,
}: FormFieldProps<T>) {
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => {
        const stringValue =
          typeof value === 'number' ? String(value) : (value ?? '');

        const injected: Record<string, unknown> = {
          value: stringValue,
          onBlur,
          error: errorMessage,
          onChangeText: onChange,
          onChange,
          onValueChange: onChange,
        };

        const childProps = children.props as Record<string, unknown>;
        const merged: Record<string, unknown> = {};
        for (const key of Object.keys(injected)) {
          if (childProps[key] === undefined) {
            merged[key] = injected[key];
          }
        }

        return cloneElement(children, merged);
      }}
    />
  );
}
