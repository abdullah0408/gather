import Link from "next/link";
import { LinkItUrl, LinkIt } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";
import { JSX } from "react";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyHashtag>
      <LinkifyUsername>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyUsername>
    </LinkifyHashtag>
  );
}

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}

function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_]+)/}
      component={(match, key) => {
        return (
          <UserLinkWithTooltip key={key} username={match.slice(1)}>
            {match}
          </UserLinkWithTooltip>
        ) as unknown as JSX.Element;
      }}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9_]+)/}
      component={(match, key) => {
        return (
          <Link
            key={key}
            href={`/hashtag/${match.slice(1)}`}
            className="text-primary hover:underline"
          >
            {match}
          </Link>
        ) as unknown as JSX.Element;
      }}
    >
      {children}
    </LinkIt>
  );
}
