import { useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function OneSignalSetup() {
  useEffect(() => {
    // Wait for OneSignal to be ready
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function (OneSignal) {
      console.log("🔔 OneSignal initialized");

      // Ask for permission (only if not already granted/denied)
      try {
        await OneSignal.Notifications.requestPermission();
      } catch (err) {
        console.log("Permission request skipped:", err);
      }

      // Track auth changes
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          // Log out from OneSignal
          try {
            await OneSignal.logout();
          } catch (err) {
            console.log("OneSignal logout error:", err);
          }
          return;
        }

        // Log in to OneSignal with the Firebase user ID
        try {
          await OneSignal.login(user.uid);
          console.log("✅ OneSignal logged in as:", user.uid);
        } catch (err) {
          console.error("OneSignal login error:", err);
        }
      });
    });
  }, []);

  return null;
}

export default OneSignalSetup;
