import { describe, it, expect } from "vitest";

interface UserDocAccess {
  ownerId: string;
  shares: Array<{ userId: string; permission: "VIEWER" | "EDITOR" }>;
}

function checkDocumentAccess(
  doc: UserDocAccess,
  userId: string
): { canView: boolean; canEdit: boolean; canDelete: boolean; canShare: boolean } {
  if (doc.ownerId === userId) {
    return { canView: true, canEdit: true, canDelete: true, canShare: true };
  }

  const share = doc.shares.find((s) => s.userId === userId);
  if (!share) {
    return { canView: false, canEdit: false, canDelete: false, canShare: false };
  }

  if (share.permission === "EDITOR") {
    return { canView: true, canEdit: true, canDelete: false, canShare: false };
  }

  return { canView: true, canEdit: false, canDelete: false, canShare: false };
}

describe("Document Access & Sharing Permissions Engine", () => {
  const sampleDoc: UserDocAccess = {
    ownerId: "user_alice",
    shares: [
      { userId: "user_bob", permission: "EDITOR" },
      { userId: "user_diana", permission: "VIEWER" },
    ],
  };

  it("grants owner complete control (view, edit, delete, share)", () => {
    const access = checkDocumentAccess(sampleDoc, "user_alice");
    expect(access.canView).toBe(true);
    expect(access.canEdit).toBe(true);
    expect(access.canDelete).toBe(true);
    expect(access.canShare).toBe(true);
  });

  it("grants shared EDITOR view and edit rights, but prevents delete/share", () => {
    const access = checkDocumentAccess(sampleDoc, "user_bob");
    expect(access.canView).toBe(true);
    expect(access.canEdit).toBe(true);
    expect(access.canDelete).toBe(false);
    expect(access.canShare).toBe(false);
  });

  it("grants shared VIEWER view-only rights and prevents editing", () => {
    const access = checkDocumentAccess(sampleDoc, "user_diana");
    expect(access.canView).toBe(true);
    expect(access.canEdit).toBe(false);
    expect(access.canDelete).toBe(false);
  });

  it("strictly denies unshared users any access", () => {
    const access = checkDocumentAccess(sampleDoc, "user_charlie");
    expect(access.canView).toBe(false);
    expect(access.canEdit).toBe(false);
    expect(access.canDelete).toBe(false);
  });
});
