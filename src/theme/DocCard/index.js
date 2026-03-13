import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  useDocById,
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import isInternalUrl from '@docusaurus/isInternalUrl';
import Heading from '@theme/Heading';

const labelEmojiMap = {
  'core concepts': '🧠',
  'overview': '🧭',
  'scenarios': '🌍',
  'tasks and stages': '🪜',
  'tools': '🧰',
  'environments': '🌐',
  'magma-gen': '🌋',
  'magma-bench': '📏',
  'quickstart': '🚀',
  'tutorials': '🛠️',
  'running generation': '⚙️',
  'customization': '🧩',
  'installation': '📦',
  'launch first generation': '▶️',
  'create a scenario': '🏗️',
  'create a task': '📋',
  'create stages': '🪜',
  'create tools': '🔧',
  'create an environment': '🧪',
};

const pathEmojiRules = [
  {match: '/core-concepts/', emoji: '🧠'},
  {match: '/use-magma-gen/tutorials/', emoji: '🛠️'},
  {match: '/use-magma-gen/quickstart/', emoji: '🚀'},
  {match: '/use-magma-gen/running-generation/', emoji: '⚙️'},
  {match: '/use-magma-gen/', emoji: '🌋'},
  {match: '/use-magma-bench/', emoji: '📏'},
  {match: '/customization/', emoji: '🧩'},
];

function getEmoji({item, href}) {
  const normalizedLabel = item.label?.trim().toLowerCase();
  if (normalizedLabel && labelEmojiMap[normalizedLabel]) {
    return labelEmojiMap[normalizedLabel];
  }

  if (href) {
    const matchedRule = pathEmojiRules.find((rule) => href.includes(rule.match));
    if (matchedRule) {
      return matchedRule.emoji;
    }
  }

  if (item.type === 'category') {
    return '🗂️';
  }

  return isInternalUrl(href ?? '') ? '📄' : '🔗';
}

function getDescription({item, doc}) {
  if (item.description) {
    return item.description;
  }

  if (item.type === 'category') {
    const count = item.items?.length ?? 0;
    return `${count} item${count === 1 ? '' : 's'}`;
  }

  return doc?.description;
}

function getCta({item, href}) {
  if (item.type === 'category') {
    return 'Open section';
  }

  return isInternalUrl(href ?? '') ? 'Read page' : 'Open link';
}

function Card({href, className, title, description, emoji, cta}) {
  return (
    <Link href={href} className={clsx('magmaDocCard', className)}>
      <div className="magmaDocCard__icon" aria-hidden="true">
        {emoji}
      </div>
      <Heading as="h3">{title}</Heading>
      {description ? <p>{description}</p> : null}
      <span className="magmaDocCard__cta">{cta}</span>
    </Link>
  );
}

function CardCategory({item}) {
  const href = findFirstSidebarItemLink(item);

  if (!href) {
    return null;
  }

  return (
    <Card
      href={href}
      className={item.className}
      title={item.label}
      description={getDescription({item})}
      emoji={getEmoji({item, href})}
      cta={getCta({item, href})}
    />
  );
}

function CardLink({item}) {
  const href = item.href;
  const doc = useDocById(item.docId ?? undefined);

  return (
    <Card
      href={href}
      className={item.className}
      title={item.label}
      description={getDescription({item, doc})}
      emoji={getEmoji({item, href})}
      cta={getCta({item, href})}
    />
  );
}

export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
