import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  return (
    <Avatar className="size-8">
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
