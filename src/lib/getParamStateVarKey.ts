export const getParamStateVarKey = (paramName: string, city: string): string => {

  if (paramName === 'mayor') {
    return `mayor${city ? `|${city}` : '|city'}`;
  }
  return paramName;
}