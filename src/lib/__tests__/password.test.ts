import { hashPassword, comparePassword } from "../password.js";

describe("password hashing", () => {
  it("produces a hash different from the plaintext", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).not.toBe("correct horse battery staple");
  });

  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("mypassword123");
    await expect(comparePassword("mypassword123", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("mypassword123");
    await expect(comparePassword("wrongpassword", hash)).resolves.toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const hash1 = await hashPassword("samepassword");
    const hash2 = await hashPassword("samepassword");
    expect(hash1).not.toBe(hash2);
  });
});