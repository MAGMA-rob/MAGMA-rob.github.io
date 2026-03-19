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
    component: ComponentCreator('/docs', '05b'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '1cd'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'f5e'),
            routes: [
              {
                path: '/docs/category/core-concepts',
                component: ComponentCreator('/docs/category/core-concepts', '409'),
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
                path: '/docs/category/quickstart',
                component: ComponentCreator('/docs/category/quickstart', 'b0c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/tutorials',
                component: ComponentCreator('/docs/category/tutorials', 'aaa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/understand',
                component: ComponentCreator('/docs/category/understand', 'f8c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/envs',
                component: ComponentCreator('/docs/core-concepts/envs', '537'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/overview',
                component: ComponentCreator('/docs/core-concepts/overview', 'c43'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/scenarios',
                component: ComponentCreator('/docs/core-concepts/scenarios', '43d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/tasks',
                component: ComponentCreator('/docs/core-concepts/tasks', 'c7e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/tools',
                component: ComponentCreator('/docs/core-concepts/tools', 'dcb'),
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
                path: '/docs/use-magma-gen/overview',
                component: ComponentCreator('/docs/use-magma-gen/overview', 'c73'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/quickstart/installation',
                component: ComponentCreator('/docs/use-magma-gen/quickstart/installation', 'd98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/quickstart/launch-first-generation',
                component: ComponentCreator('/docs/use-magma-gen/quickstart/launch-first-generation', '0a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/running-generation/cli-argument',
                component: ComponentCreator('/docs/use-magma-gen/running-generation/cli-argument', '1ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/running-generation/export',
                component: ComponentCreator('/docs/use-magma-gen/running-generation/export', 'edc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/running-generation/key-systems',
                component: ComponentCreator('/docs/use-magma-gen/running-generation/key-systems', '3e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-envs',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-envs', '57a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-scenarios',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-scenarios', '36c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-stages',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-stages', '085'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-tasks',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-tasks', 'bb6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-tasks-definition',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-tasks-definition', 'a95'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-tools',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-tools', '6b0'),
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
