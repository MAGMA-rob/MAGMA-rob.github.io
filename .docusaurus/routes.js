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
    component: ComponentCreator('/docs', '185'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '451'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '75b'),
            routes: [
              {
                path: '/docs/category/concepts-and-architecture',
                component: ComponentCreator('/docs/category/concepts-and-architecture', '538'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/custom-agent',
                component: ComponentCreator('/docs/category/custom-agent', '71e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/evaluate-your-agent--magma-bench',
                component: ComponentCreator('/docs/category/evaluate-your-agent--magma-bench', 'fa5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/first-generation',
                component: ComponentCreator('/docs/category/first-generation', '10e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/generate-data--magma-gen',
                component: ComponentCreator('/docs/category/generate-data--magma-gen', '5af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/get-started',
                component: ComponentCreator('/docs/category/get-started', '11c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/planner-and-backend-integration',
                component: ComponentCreator('/docs/category/planner-and-backend-integration', '5b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/reference',
                component: ComponentCreator('/docs/category/reference', '2af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/reusable-components',
                component: ComponentCreator('/docs/category/reusable-components', '62a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/category/scenario-contracts',
                component: ComponentCreator('/docs/category/scenario-contracts', '887'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/architecture',
                component: ComponentCreator('/docs/concepts/architecture', '46a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/errors',
                component: ComponentCreator('/docs/concepts/errors', 'c1b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/execution',
                component: ComponentCreator('/docs/concepts/execution', 'fdd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/perfect-traces',
                component: ComponentCreator('/docs/concepts/perfect-traces', '2e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/requests',
                component: ComponentCreator('/docs/concepts/requests', '3dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/stages',
                component: ComponentCreator('/docs/concepts/stages', '10e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/concepts/state',
                component: ComponentCreator('/docs/concepts/state', 'e3d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/envs',
                component: ComponentCreator('/docs/core-concepts/envs', '918'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/overview',
                component: ComponentCreator('/docs/core-concepts/overview', '689'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/scenarios',
                component: ComponentCreator('/docs/core-concepts/scenarios', '70a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/tasks',
                component: ComponentCreator('/docs/core-concepts/tasks', 'a36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/core-concepts/tools',
                component: ComponentCreator('/docs/core-concepts/tools', 'b0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/building-blocks',
                component: ComponentCreator('/docs/create-scenarios/building-blocks', '4b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/env-transitions',
                component: ComponentCreator('/docs/create-scenarios/env-transitions', '530'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/errors',
                component: ComponentCreator('/docs/create-scenarios/errors', '222'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/execution',
                component: ComponentCreator('/docs/create-scenarios/execution', 'd48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/first-scenario',
                component: ComponentCreator('/docs/create-scenarios/first-scenario', 'c43'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/interactions',
                component: ComponentCreator('/docs/create-scenarios/interactions', '656'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/multi-robot',
                component: ComponentCreator('/docs/create-scenarios/multi-robot', '75d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/overview',
                component: ComponentCreator('/docs/create-scenarios/overview', '2ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/perfect-traces',
                component: ComponentCreator('/docs/create-scenarios/perfect-traces', 'c2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/procedural-tasks',
                component: ComponentCreator('/docs/create-scenarios/procedural-tasks', 'a3b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/requests',
                component: ComponentCreator('/docs/create-scenarios/requests', 'f21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/serialization',
                component: ComponentCreator('/docs/create-scenarios/serialization', '4e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/testing',
                component: ComponentCreator('/docs/create-scenarios/testing', '071'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/create-scenarios/traces-and-replay',
                component: ComponentCreator('/docs/create-scenarios/traces-and-replay', 'bca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/custom-agent/overview',
                component: ComponentCreator('/docs/custom-agent/overview', '1f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/customization/create-agent',
                component: ComponentCreator('/docs/customization/create-agent', '0b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/customization/create-backends',
                component: ComponentCreator('/docs/customization/create-backends', '9e1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/customization/create-planner',
                component: ComponentCreator('/docs/customization/create-planner', 'fb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/getting-started/overview',
                component: ComponentCreator('/docs/getting-started/overview', '3b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/installation',
                component: ComponentCreator('/docs/installation', '494'),
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
                path: '/docs/reference/overview',
                component: ComponentCreator('/docs/reference/overview', 'ada'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/reference/scenarios/errors',
                component: ComponentCreator('/docs/reference/scenarios/errors', '9a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/reference/scenarios/perfect-traces',
                component: ComponentCreator('/docs/reference/scenarios/perfect-traces', '757'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/reference/scenarios/providers',
                component: ComponentCreator('/docs/reference/scenarios/providers', 'a67'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/reference/scenarios/skills',
                component: ComponentCreator('/docs/reference/scenarios/skills', '7ce'),
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
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-stages', '8aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/deep-dive/create-tasks',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-tasks', 'cdf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/deep-dive/create-tasks-definition',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-tasks-definition', '9f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/deep-dive/create-tools',
                component: ComponentCreator('/docs/use-magma-gen/deep-dive/create-tools', '411'),
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
                component: ComponentCreator('/docs/use-magma-gen/running-generation/cli-argument', 'b77'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/running-generation/export',
                component: ComponentCreator('/docs/use-magma-gen/running-generation/export', 'af1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/running-generation/key-systems',
                component: ComponentCreator('/docs/use-magma-gen/running-generation/key-systems', '040'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/constraints-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/constraints-template', '10c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/errors-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/errors-template', '039'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/goals-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/goals-template', 'a6b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/requests-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/requests-template', '209'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/templates-to-use/stages-template',
                component: ComponentCreator('/docs/use-magma-gen/templates-to-use/stages-template', 'a94'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/articulated-object',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/articulated-object', '45e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/asking-request',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/asking-request', '1f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-envs',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-envs', 'fad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-stages-light',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-stages-light', '8e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-tasks-light',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-tasks-light', '1e8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/building-blocks/create-tools-light',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/building-blocks/create-tools-light', '936'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/constraint-cycle',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/constraint-cycle', '770'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-cycle',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-cycle', '0ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/create-scenarios',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/create-scenarios', 'f55'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/interuption',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/interuption', '1ce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/lack-information',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/lack-information', '268'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/log-verification',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/log-verification', 'ea7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/make-reusable-stages',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/make-reusable-stages', '701'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/modify-attributes',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/modify-attributes', 'e8f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/multi-stages',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/multi-stages', '0f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/use-magma-gen/tutorials/task-randomization',
                component: ComponentCreator('/docs/use-magma-gen/tutorials/task-randomization', '5b6'),
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
