import { useState } from 'react';

interface UserAvatarProps {
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
}

function initials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.trim()[0] ?? 'U';
  const last = lastName?.trim()[0] ?? 'S';

  return `${first}${last}`.toUpperCase();
}

/**
 * Round avatar, falling back to initials.
 *
 * Uploads are not served yet, so a stored relative path will 404; the error
 * handler swaps in the initials rather than leaving a broken image, and the
 * photo starts working on its own once the files are hosted.
 */
export function UserAvatar({ firstName, lastName, profileImage }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (profileImage && !failed) {
    return (
      <img
        className="user-avatar"
        src={profileImage}
        alt=""
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="user-avatar user-avatar--initials" aria-hidden="true">
      {initials(firstName, lastName)}
    </span>
  );
}
