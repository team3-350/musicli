import { setItemAsync, getItemAsync } from "expo-secure-store";

export async function setSSO(key: string, value: string) {
  await setItemAsync(key, value);
}

export async function getSSO(key: string) {
  const result = await getItemAsync(key);
  if (!result) {
    return false;
    // there is no SSO saved
  }
  return result;
}
