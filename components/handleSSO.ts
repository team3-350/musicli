import { setItemAsync, getItemAsync } from "expo-secure-store";

export async function setSSO(platform: string, idToken: string) {
  await setItemAsync("platform", platform);
  await setItemAsync("idToken", idToken);
}

export async function getSSO(key: string) {
  const result = await getItemAsync(key);
  if (!result) {
    return false;
    // there is no SSO saved
  }
  return result;
}
