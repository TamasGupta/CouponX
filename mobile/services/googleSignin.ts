const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

let GoogleSignin: any = null;
let statusCodes: any = null;
let initialized = false;

function loadModule() {
  if (initialized) return;
  initialized = true;
  try {
    const mod = require('@react-native-google-signin/google-signin');
    GoogleSignin = mod.GoogleSignin;
    statusCodes = mod.statusCodes;
    if (googleClientId) {
      GoogleSignin.configure({ webClientId: googleClientId });
    }
  } catch {
    console.warn('GoogleSignin native module not available');
  }
}

export function isGoogleSigninAvailable(): boolean {
  loadModule();
  return GoogleSignin !== null;
}

export async function signInWithGoogle(): Promise<string | null> {
  loadModule();
  if (!GoogleSignin) {
    throw new Error('Google Sign-In is not configured');
  }
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type === 'success') {
    return response.data.idToken;
  }
  return null;
}

export { googleClientId };
