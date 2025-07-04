import { User } from "lucide-react";
import type { GreenhouseUser } from "~/server/api/routers/greenhouse";

interface UserInfoProps {
  user: GreenhouseUser;
}

function getDisplayName(user: GreenhouseUser): string {
  if (user.name) {
    return user.name;
  }
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if (user.first_name) {
    return user.first_name;
  }
  
  return 'User';
}

export function UserInfo({ user }: UserInfoProps) {
  const displayName = getDisplayName(user);
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
      <User className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">
        {displayName}
      </span>
    </div>
  );
}