// @ts-check

import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import OriginalDocSidebarItems from '@theme-original/DocSidebarItems';

import styles from './styles.module.css';

/** @typedef {{activePath: string, sectionLabel: string | null}} SidebarNavigation */

/** @param {import('@theme/DocSidebarItems').Props} props */
function DocSidebarSections({items, activePath, ...props}) {
  const sections = items.filter((item) => item.type === 'category');
  const activeSection = sections.find((item) =>
    isActiveSidebarItem(item, activePath),
  );
  // The documentation landing page shows all five sections.
  const activeSectionLabel = activeSection?.customProps?.sidebarLanding
    ? null
    : activeSection?.label ?? null;
  const [navigation, setNavigation] = useState(/** @type {SidebarNavigation} */ ({
    activePath,
    sectionLabel: activeSectionLabel,
  }));
  const backButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const sectionButtonRefs = useRef(/** @type {Map<string, HTMLButtonElement>} */ (new Map()));
  const pendingFocusRef = useRef(/** @type {string | null} */ (null));

  // Follow page navigation, including direct links and browser back/forward.
  // Returning to the section list alone does not change the current page.
  if (navigation.activePath !== activePath) {
    setNavigation({activePath, sectionLabel: activeSectionLabel});
  }

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (!target) {
      return;
    }
    const button = target === 'back'
      ? backButtonRef.current
      : sectionButtonRefs.current.get(target);
    button?.focus();
    button?.closest('nav, .navbar-sidebar__items')?.scrollTo({top: 0});
    pendingFocusRef.current = null;
  }, [navigation.sectionLabel]);

  const selectedSection = sections.find(
    (item) => item.label === navigation.sectionLabel,
  );

  return (
    <li className={styles.sections}>
      {selectedSection ? (
        <>
          <div className={styles.header}>
            <button
              ref={backButtonRef}
              type="button"
              className={clsx('clean-btn menu__link', styles.backButton)}
              aria-label="Back to documentation sections"
              onClick={() => {
                pendingFocusRef.current = selectedSection.label;
                setNavigation({activePath, sectionLabel: null});
              }}>
              <span aria-hidden="true">←</span>
              Back
            </button>
            <h2 className={styles.title}>{selectedSection.label}</h2>
          </div>
          <ul key={selectedSection.label} className={clsx('menu__list', styles.content)}>
            <OriginalDocSidebarItems
              {...props}
              items={selectedSection.items}
              activePath={activePath}
              level={1}
            />
          </ul>
        </>
      ) : (
        <ul className={clsx('menu__list', styles.root, styles.content)}>
          {sections.map((item) => (
            <li key={item.label} className="menu__list-item">
              <button
                ref={(button) => {
                  if (button) {
                    sectionButtonRefs.current.set(item.label, button);
                  } else {
                    sectionButtonRefs.current.delete(item.label);
                  }
                }}
                type="button"
                className={clsx('clean-btn menu__link', styles.sectionButton, {
                  'menu__link--active': isActiveSidebarItem(item, activePath),
                })}
                onClick={() => {
                  pendingFocusRef.current = 'back';
                  setNavigation({activePath, sectionLabel: item.label});
                }}>
                {item.label}
                <span className={styles.chevron} aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** @param {import('@theme/DocSidebarItems').Props} props */
export default function DocSidebarItems(props) {
  // Keep Docusaurus' usual expandable categories below the section selector.
  if (props.level !== 1) {
    return <OriginalDocSidebarItems {...props} />;
  }
  return <DocSidebarSections {...props} />;
}
