export const RemoveNullFields = (inputObj: Record<string, unknown>, fieldId: string) => {
  return Object.fromEntries(
    Object.entries(inputObj).filter(
      ([key, value]) =>
        key !== fieldId &&
        value != null &&
        !(typeof value === 'string' && value.trim() === '')
    )
  );
}