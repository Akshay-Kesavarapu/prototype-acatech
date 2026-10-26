
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

// Deploy this function in Mumbai.
setGlobalOptions({
  region: "asia-south1",
  maxInstances: 5,
});

const ALLOWED_ROLES = ["user", "admin", "super-admin"];

/**
 * Assign a Firebase Authentication custom role.
 *
 * Only an authenticated super-admin can call this function.
 * Roles are stored as trusted Firebase custom claims, not browser storage.
 */
exports.setUserRole = onCall(async (request) => {
  // Require an authenticated caller.
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must sign in before assigning roles."
    );
  }

  // Only an existing super-admin may assign roles.
  if (request.auth.token.role !== "super-admin") {
    throw new HttpsError(
      "permission-denied",
      "Only a super-admin can assign roles."
    );
  }

  const { uid, role } = request.data || {};

  if (typeof uid !== "string" || !uid.trim()) {
    throw new HttpsError(
      "invalid-argument",
      "A valid target user UID is required."
    );
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      "Role must be user, admin, or super-admin."
    );
  }

  // Prevent accidentally changing the caller's own role.
  if (uid === request.auth.uid) {
    throw new HttpsError(
      "failed-precondition",
      "You cannot change your own role using this function."
    );
  }

  try {
    const auth = getAuth();

    // Verify that the target account exists.
    await auth.getUser(uid);

    // Set the trusted custom claim.
    const targetUser = await auth.getUser(uid);
    await auth.setCustomUserClaims(uid, {
     ...(targetUser.customClaims || {}),
     role,
    });

    // Revoke existing refresh tokens so the target must refresh
    // their session before receiving the updated claims.
    await auth.revokeRefreshTokens(uid);

    return {
      success: true,
      uid,
      role,
      message: `Role assigned successfully: ${role}`,
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    console.error("Role assignment failed:", error);

    throw new HttpsError(
      "internal",
      "Role assignment failed. Check the function logs."
    );
  }
});



/**
 * List real Firebase Authentication accounts.
 * Only authenticated super-admins may access this list.
 */
exports.listAuthUsers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in.");
  }

  if (request.auth.token.role !== "super-admin") {
    throw new HttpsError(
      "permission-denied",
      "Only a super-admin can list Firebase accounts."
    );
  }

  try {
    const auth = getAuth();
    const users = [];
    let pageToken;

    do {
      const page = await auth.listUsers(1000, pageToken);

      for (const user of page.users) {
        users.push({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          disabled: user.disabled,
          role: user.customClaims?.role || "user",
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        });
      }

      pageToken = page.pageToken;
    } while (pageToken);

    return { users };
  } catch (error) {
    console.error("Failed to list Firebase accounts:", error);
    throw new HttpsError(
      "internal",
      "Could not load Firebase accounts."
    );
  }
});

/**
 * Disable or re-enable a Firebase Authentication account.
 * Only authenticated super-admins may do this.
 */
exports.setUserDisabled = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in.");
  }

  if (request.auth.token.role !== "super-admin") {
    throw new HttpsError(
      "permission-denied",
      "Only a super-admin can change account status."
    );
  }

  const { uid, disabled } = request.data || {};

  if (typeof uid !== "string" || !uid.trim()) {
    throw new HttpsError(
      "invalid-argument",
      "A valid target user UID is required."
    );
  }

  if (typeof disabled !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      "The disabled value must be true or false."
    );
  }

  if (uid === request.auth.uid && disabled) {
    throw new HttpsError(
      "failed-precondition",
      "You cannot disable your own account."
    );
  }

  try {
    const auth = getAuth();

    await auth.updateUser(uid, { disabled });

    return {
      success: true,
      uid,
      disabled,
      message: disabled
        ? "Account disabled successfully."
        : "Account re-enabled successfully.",
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;

    console.error("Failed to update account status:", error);
    throw new HttpsError(
      "internal",
      "Could not update the account. Check the function logs."
    );
  }
});

