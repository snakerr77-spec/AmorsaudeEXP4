type IconProps = { size?: number; className?: string; style?: Record<string, unknown> };

function makeIcon(className: string) {
  return function Icon({ size = 18, className: extra = "", style = {} }: IconProps) {
    return <i aria-hidden="true" className={`${className} ${extra}`.trim()} style={{ fontSize: size, width: size, height: size, lineHeight: `${size}px`, textAlign: "center", ...style }} />;
  };
}

export const Activity = makeIcon("fa-solid fa-wave-square");
export const AlertCircle = makeIcon("fa-solid fa-circle-exclamation");
export const ArrowLeft = makeIcon("fa-solid fa-arrow-left");
export const ArrowRight = makeIcon("fa-solid fa-arrow-right");
export const Bell = makeIcon("fa-regular fa-bell");
export const BookOpenCheck = makeIcon("fa-solid fa-book-open-reader");
export const BriefcaseMedical = makeIcon("fa-solid fa-briefcase-medical");
export const Building2 = makeIcon("fa-regular fa-building");
export const CalendarDays = makeIcon("fa-regular fa-calendar-days");
export const CheckCircle2 = makeIcon("fa-regular fa-circle-check");
export const ChevronDown = makeIcon("fa-solid fa-chevron-down");
export const ChevronRight = makeIcon("fa-solid fa-chevron-right");
export const ClipboardCheck = makeIcon("fa-solid fa-clipboard-check");
export const ClipboardList = makeIcon("fa-solid fa-clipboard-list");
export const Clock3 = makeIcon("fa-regular fa-clock");
export const FileHeart = makeIcon("fa-solid fa-file-circle-plus");
export const FilePlus2 = makeIcon("fa-solid fa-file-circle-plus");
export const FileText = makeIcon("fa-regular fa-file-lines");
export const Filter = makeIcon("fa-solid fa-filter");
export const FolderKanban = makeIcon("fa-solid fa-folder-tree");
export const GraduationCap = makeIcon("fa-solid fa-graduation-cap");
export const HeartPulse = makeIcon("fa-solid fa-heart-pulse");
export const History = makeIcon("fa-solid fa-clock-rotate-left");
export const Home = makeIcon("fa-solid fa-house");
export const LayoutDashboard = makeIcon("fa-solid fa-chart-line");
export const LoaderCircle = makeIcon("fa-solid fa-spinner");
export const LogOut = makeIcon("fa-solid fa-right-from-bracket");
export const MapPin = makeIcon("fa-solid fa-location-dot");
export const Menu = makeIcon("fa-solid fa-bars");
export const Moon = makeIcon("fa-regular fa-moon");
export const Pill = makeIcon("fa-solid fa-pills");
export const Printer = makeIcon("fa-solid fa-print");
export const RefreshCw = makeIcon("fa-solid fa-rotate");
export const RotateCcw = makeIcon("fa-solid fa-arrow-rotate-left");
export const Save = makeIcon("fa-solid fa-floppy-disk");
export const Search = makeIcon("fa-solid fa-magnifying-glass");
export const ShieldCheck = makeIcon("fa-solid fa-shield-halved");
export const Sparkles = makeIcon("fa-solid fa-wand-magic-sparkles");
export const Stethoscope = makeIcon("fa-solid fa-stethoscope");
export const Sun = makeIcon("fa-regular fa-sun");
export const Trash2 = makeIcon("fa-solid fa-trash");
export const TrendingUp = makeIcon("fa-solid fa-arrow-trend-up");
export const UserRound = makeIcon("fa-regular fa-user");
export const UserRoundCheck = makeIcon("fa-solid fa-user-check");
export const UsersRound = makeIcon("fa-solid fa-users-gear");
export const X = makeIcon("fa-solid fa-xmark");
export type IconComponent = ReturnType<typeof makeIcon>;
