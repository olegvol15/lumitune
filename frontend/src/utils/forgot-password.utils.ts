export function maskEmail(email: string): string {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  if (atIndex <= 1) return email;

  return (
    email[0] +
    "*".repeat(5) +
    email.slice(Math.min(6, atIndex), atIndex) +
    email.slice(atIndex)
  );
}
