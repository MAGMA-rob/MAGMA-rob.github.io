import React from 'react';
import clsx from 'clsx';
import {
  useCurrentSidebarSiblings,
  filterDocCardListItems,
} from '@docusaurus/plugin-content-docs/client';
import DocCard from '@theme/DocCard';

function DocCardListForCurrentSidebarCategory({className}) {
  const items = useCurrentSidebarSiblings();
  return <DocCardList items={items} className={className} />;
}

export default function DocCardList(props) {
  const {items, className} = props;

  if (!items) {
    return <DocCardListForCurrentSidebarCategory {...props} />;
  }

  const filteredItems = filterDocCardListItems(items);

  return (
    <section className={clsx('magmaOverviewGrid', className)}>
      {filteredItems.map((item, index) => (
        <DocCard key={item.href ?? item.label ?? index} item={item} />
      ))}
    </section>
  );
}
