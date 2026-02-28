import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { FaFacebook, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import AuthLogo from "../../components/auth/AuthLogo";
import Button from "../../components/ui/Button";
import StepBar from "../../components/ui/StepBar";
import PasswordRequirement from "../../components/ui/PasswordRequirement";

export const Route = createFileRoute("/auth/signup")({
  component: SignUpPage,
});

const socialButtons = [
  {
    id: "facebook",
    icon: <FaFacebook size={22} color="#1877F2" />,
    label: "Увійти з Facebook",
  },
  { id: "google", icon: <FcGoogle size={22} />, label: "Увійти з Google" },
  {
    id: "apple",
    icon: <FaApple size={22} color="#fff" />,
    label: "Увійти з Apple",
  },
];

const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Step 0
  const [email, setEmail] = useState("");

  // Step 1
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Step 2
  const [name, setName] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<"user" | "artist">("user");
  const [loading, setLoading] = useState(false);

  const hasLetter = /[a-zA-Zа-яА-ЯіІїЇєЄ]/.test(password);
  const hasNumberOrSpecial = /[0-9!?_&#]/.test(password);
  const hasLength = password.length >= 8;
  const passwordValid = hasLetter && hasNumberOrSpecial && hasLength;

  const handleFinalSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate({ to: "/" });
  };

  // ─── Step 0: email + social ───────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
        <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
          <AuthLogo heading={"Пориньте вперше\nу LumiTune"} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="text-[#D4E3F7] text-sm mb-1.5 block">
                Електронна пошта
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="@gmail.com"
                required
                className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              shape="rect"
              fullWidth
            >
              Далі
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 auth-muted-line" />
            <span className="text-[#769CCF] text-sm">або</span>
            <div className="flex-1 auth-muted-line" />
          </div>

          <div className="space-y-3">
            {socialButtons.map(({ id, icon, label }) => (
              <Button
                key={id}
                variant="auth-outline"
                size="lg"
                shape="rect"
                fullWidth
                leftIcon={
                  <div className="w-7 flex flex-col sm:items-center sm:justify-center">
                    {icon}
                  </div>
                }
              >
                <span className="flex-1 text-center">{label}</span>
              </Button>
            ))}
          </div>

          <div className="auth-muted-line mt-6 mb-5" />

          <p className="text-center text-[#769CCF] text-[15px]">
            Є аккаунт?{" "}
            <Button
              variant="ghost"
              size="sm"
              shape="pill"
              onClick={() => navigate({ to: "/auth/signin" })}
              className="text-[#8AB8F0] font-semibold underline underline-offset-4 !px-0"
            >
              Увійдіть до нього
            </Button>
          </p>
        </div>
      </div>
    );
  }

  // ─── Step 1: password ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
        <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(0)}
            className="text-[#8AB8F0] underline underline-offset-4 !px-0 mb-3"
          >
            Назад
          </Button>

          <div className="flex flex-col items-center">
            <AuthLogo heading="" />
            <p className="text-[#E8EEF8] text-[20px] font-bold -mt-4">
              Створіть профіль
            </p>
            <p className="text-[#769CCF] text-sm mt-0.5 mb-2">Крок 1 із 2</p>
            <StepBar currentStep={1} totalSteps={2} />
          </div>

          <div className="mt-4 mb-4">
            <label className="text-[#D4E3F7] text-sm mb-1.5 block">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="************"
                className="w-full auth-input rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {showPwd ? (
                  <EyeOff size={18} className="text-[#79A9E4]" />
                ) : (
                  <Eye size={18} className="text-[#79A9E4]" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-5 space-y-2">
            <p className="text-[#D4E3F7] text-[13px] font-medium mb-2">
              Пароль має містити принаймні:
            </p>
            <PasswordRequirement met={hasLetter} label="1 літеру" />
            <PasswordRequirement
              met={hasNumberOrSpecial}
              label="1 число або 1 спеціальний символ (наприклад:_!?&#)"
            />
            <PasswordRequirement met={hasLength} label="8 символів" />
          </div>

          <Button
            variant="primary"
            size="lg"
            shape="rect"
            fullWidth
            disabled={!passwordValid}
            onClick={() => setStep(2)}
          >
            Далі
          </Button>
        </div>
      </div>
    );
  }

  // ─── Step 2: profile details ──────────────────────────────────────────────
  return (
    <div className="auth-page-bg min-h-screen px-4 py-6 sm:py-8 flex flex-col sm:items-center sm:justify-center">
      <div className="w-full max-w-[440px] auth-modal px-4 py-5 sm:px-5 sm:py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(1)}
          className="text-[#8AB8F0] underline underline-offset-4 !px-0 mb-3"
        >
          Назад
        </Button>

        <div className="flex flex-col items-center">
          <AuthLogo heading="" />
          <p className="text-[#E8EEF8] text-[20px] font-bold -mt-4">
            Створіть профіль
          </p>
          <p className="text-[#769CCF] text-sm mt-0.5 mb-2">Крок 2 із 2</p>
          <StepBar currentStep={2} totalSteps={2} />
        </div>

        <div className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <label className="text-[#D4E3F7] text-sm font-medium block mb-0.5">
              Ім&apos;я
            </label>
            <p className="text-[#769CCF] text-xs mb-1.5">
              Це ім'я відображатиметься в профілі
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ім'я"
              className="w-full auth-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px]"
            />
          </div>

          {/* Date of birth */}
          <div>
            <label className="text-[#D4E3F7] text-sm font-medium block mb-0.5">
              Дата народження
            </label>
            <p className="text-[#769CCF] text-xs mb-0.5">
              Для чого нам потрібна ваша дата народження?{" "}
              <span className="text-[#8AB8F0] underline cursor-pointer">
                Докладніше
              </span>
            </p>
            <div className="flex gap-2 mt-1.5">
              <input
                type="text"
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                placeholder="рррр"
                maxLength={4}
                className="w-20 auth-input rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px] text-center"
              />
              <div className="relative flex-1">
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className="w-full auth-input rounded-xl px-3 py-3 pr-8 outline-none focus:ring-2 focus:ring-brand/45 text-[15px] appearance-none"
                >
                  <option value="" disabled>
                    Місяць
                  </option>
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#769CCF] pointer-events-none"
                />
              </div>
              <input
                type="text"
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                placeholder="дд"
                maxLength={2}
                className="w-16 auth-input rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-brand/45 text-[15px] text-center"
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="text-[#D4E3F7] text-sm font-medium block mb-0.5">
              Регіон проживання
            </label>
            <p className="text-[#769CCF] text-xs mb-0.5">
              Для чого нам потрібна ваше місце проживання?{" "}
              <span className="text-[#8AB8F0] underline cursor-pointer">
                Докладніше
              </span>
            </p>
            <div className="flex gap-2 mt-1.5">
              <div className="relative flex-1">
                <label className="text-[#A8C4E0] text-xs mb-1 block">
                  Країна
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full auth-input rounded-xl px-3 py-3 pr-8 outline-none focus:ring-2 focus:ring-brand/45 text-[15px] appearance-none"
                >
                  <option value="" disabled>
                    Країна
                  </option>
                  <option value="ua">Україна</option>
                  <option value="us">США</option>
                  <option value="de">Німеччина</option>
                  <option value="pl">Польща</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 bottom-3.5 text-[#769CCF] pointer-events-none"
                />
              </div>
              <div className="relative flex-1">
                <label className="text-[#A8C4E0] text-xs mb-1 block">
                  Місто
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full auth-input rounded-xl px-3 py-3 pr-8 outline-none focus:ring-2 focus:ring-brand/45 text-[15px] appearance-none"
                >
                  <option value="" disabled>
                    Місто
                  </option>
                  <option value="kyiv">Київ</option>
                  <option value="lviv">Львів</option>
                  <option value="odesa">Одеса</option>
                  <option value="kharkiv">Харків</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 bottom-3.5 text-[#769CCF] pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-[#D4E3F7] text-sm font-medium block mb-2">
              Хто ви?
            </label>
            <div className="space-y-2">
              {(
                [
                  { value: "user", label: "Я звичайний користувач" },
                  { value: "artist", label: "Я автор пісень" },
                ] as const
              ).map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <span
                    onClick={() => setRole(value)}
                    className={`w-4 h-4 rounded-full border flex-shrink-0 transition-colors cursor-pointer ${
                      role === value
                        ? "border-[#1CA2EA] bg-[#1CA2EA]"
                        : "border-[#4A6F9A]"
                    }`}
                  />
                  <span className="text-[#A8C4E0] text-[13px]">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          shape="rect"
          fullWidth
          loading={loading}
          disabled={!name}
          onClick={handleFinalSubmit}
          className="mt-5"
        >
          Зареєструватися
        </Button>
      </div>
    </div>
  );
}
