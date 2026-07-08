import type { ProfilePrivacy } from "@/types";
import { Globe, MessageCircle, Users } from "lucide-react";

const PRIVACY_ROWS: {
  key: keyof ProfilePrivacy;
  title: string;
  hint: string;
  Icon: typeof Globe;
}[] = [
  {
    key: "is_public",
    title: "Public profile",
    hint: "Anyone can view your @handle page.",
    Icon: Globe,
  },
  {
    key: "show_followers",
    title: "Show follower count",
    hint: "Display how many people follow you.",
    Icon: Users,
  },
  {
    key: "allow_follow",
    title: "Allow follows",
    hint: "Let visitors subscribe to your new links.",
    Icon: Users,
  },
  {
    key: "allow_messages",
    title: "Allow messages",
    hint: "Show a message button on your profile.",
    Icon: MessageCircle,
  },
];

interface Props {
  privacy: ProfilePrivacy;
  onToggle: (key: keyof ProfilePrivacy, next: ProfilePrivacy) => void;
}

export function PrivacyTab({ privacy, onToggle }: Props) {
  return (
    <div>
      {PRIVACY_ROWS.map(({ key, title, hint, Icon }) => (
        <div className="tlpe-toggle-row" key={key}>
          <span className="tlpe-toggle-icon">
            <Icon size={18} />
          </span>
          <div className="tlpe-toggle-text">
            <div className="tlpe-toggle-title">{title}</div>
            <div className="tlpe-toggle-hint">{hint}</div>
          </div>
          <button
            type="button"
            aria-label={title}
            className={`tlpe-switch${privacy[key] ? " tlpe-switch--on" : ""}`}
            onClick={() => onToggle(key, { ...privacy, [key]: !privacy[key] })}
          />
        </div>
      ))}
    </div>
  );
}
