export const validateFields = (fields, requiredFields) => {
  if (!fields || !requiredFields) return false;
  for (const field of requiredFields) {
    if (!fields[field]) {
      return false;
    }
  }
  return true;
};
