// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MAGMA',
  tagline: 'Multi-Agents for Manipulation tasks in robotics',
  favicon: 'img/magma_logo.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://MAGMA-rob.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'MAGMA-rob', // Usually your GitHub org/user name.
  projectName: 'MAGMA-rob.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'MAGMA',
        logo: {
          alt: 'Logo',
          src: 'img/magma_logo.png',
        },
        items: [
          {
            to: '/',
            label: 'Home',
            position: 'left',
          },
          {
            type: 'dropdown',
            label: 'Projects',
            position: 'left',
            items: [
              {
                to: '/magma-gen',
                label: 'MAGMA-Gen',
              },
              {
                to: '/magma-bench',
                label: 'MAGMA-Bench',
              },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/publications',
            label: 'Publications',
            position: 'left',
          },
          {
            to: '/team',
            label: 'Team',
            position: 'left',
          },
          {
            href: 'https://github.com/MAGMA-rob',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Maintainers',
            items: [
              {
                label: 'Siléane',
                href: 'https://www.sileane.com/',
              },
              {
                label: 'LAAS-GEPETTO (CNRS)',
                href: 'https://www.laas.fr/fr/equipes/gepetto/',
              },
              {
                label: 'Loan Bernat',
                href: 'https://loanbrnt.github.io/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/MAGMA-rob',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MAGMA Research Project. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
