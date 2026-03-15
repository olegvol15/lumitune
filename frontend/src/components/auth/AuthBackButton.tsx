import type { AuthBackButtonProps } from "../../types/auth/auth-component.types";
import Button from "../ui/Button";

export default function AuthBackButton({ onBack }: AuthBackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onBack}
      className="mb-3 !px-0 text-[#8AB8F0] underline underline-offset-4"
    >
      Назад
    </Button>
  );
}
