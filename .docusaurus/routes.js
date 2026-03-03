import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/magma-bench',
    component: ComponentCreator('/magma-bench', '099'),
    exact: true
  },
  {
    path: '/magma-gen',
    component: ComponentCreator('/magma-gen', 'e2e'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/publications',
    component: ComponentCreator('/publications', '671'),
    exact: true
  },
  {
    path: '/team',
    component: ComponentCreator('/team', 'a94'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '990'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '4c6'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '3d3'),
            routes: [
              {
                path: '/docs/category/create-your-own-scenarios',
                component: ComponentCreator('/docs/category/create-your-own-scenarios', '24e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/customization',
                component: ComponentCreator('/docs/category/customization', '7cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/magma-bench',
                component: ComponentCreator('/docs/category/magma-bench', '5f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/magma-gen',
                component: ComponentCreator('/docs/category/magma-gen', '6dc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/customization/create-agent',
                component: ComponentCreator('/docs/customization/create-agent', '69a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/customization/create-backends',
                component: ComponentCreator('/docs/customization/create-backends', 'd9d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/customization/create-planner',
                component: ComponentCreator('/docs/customization/create-planner', '94c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/installation',
                component: ComponentCreator('/docs/installation', 'b74'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-bench/overview',
                component: ComponentCreator('/docs/use-magma-bench/overview', 'dab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/create-scenarios/overview',
                component: ComponentCreator('/docs/use-magma-gen/create-scenarios/overview', 'b28'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/installation',
                component: ComponentCreator('/docs/use-magma-gen/installation', 'eee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/launch-first-generation',
                component: ComponentCreator('/docs/use-magma-gen/launch-first-generation', '4b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/overview',
                component: ComponentCreator('/docs/use-magma-gen/overview', 'c73'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
