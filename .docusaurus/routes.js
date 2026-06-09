import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
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
    component: ComponentCreator('/docs', 'ef8'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '970'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '89d'),
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
                path: '/docs/category/deep-dive',
                component: ComponentCreator('/docs/category/deep-dive', '47b'),
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
                path: '/docs/category/scenario-building-blocks',
                component: ComponentCreator('/docs/category/scenario-building-blocks', 'ad0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/template-you-can-use',
                component: ComponentCreator('/docs/category/template-you-can-use', '918'),
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
                path: '/docs/use-magma-gen/deep-dive/create-stages',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-stages', 'a17'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/deep-dive/create-tasks',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-tasks', 'c16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/deep-dive/create-tasks-definition',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-tasks-definition', 'e55'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/deep-dive/create-tools',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-tools', 'dbb'),
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
                path: '/docs/use-magma-gen/templates-to-use/constraints-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/constraints-template', '10f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/errors-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/errors-template', 'f9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/goals-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/goals-template', '804'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/requests-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/requests-template', '4eb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/stages-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/stages-template', '2b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/articulated-object',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/articulated-object', 'eb2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/asking-request',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/asking-request', '2ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-envs',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-envs', '055'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-stages-light',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-stages-light', '953'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-tasks-light',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-tasks-light', 'b5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-tools-light',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-tools-light', 'c71'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/constraint-cycle',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/constraint-cycle', '661'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-cycle',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-cycle', '07b'),
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
                path: '/docs/use-magma-gen/tutorials/interuption',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/interuption', 'f54'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/lack-information',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/lack-information', 'c05'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/log-verification',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/log-verification', '9e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/make-reusable-stages',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/make-reusable-stages', '32f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/modify-attributes',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/modify-attributes', '22c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/multi-stages',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/multi-stages', '3af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/task-randomization',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/task-randomization', '19a'),
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
