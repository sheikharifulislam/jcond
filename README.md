<!-- # JCond - JavaScript/TypeScript Condition Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/jcond.svg)](https://badge.fury.io/js/jcond)
[![GitHub stars](https://img.shields.io/github/stars/sheikharifulislam/jcond.svg?style=social)](https://github.com/sheikharifulislam/jcond/stargazers)

JCond is a powerful and flexible condition engine for JavaScript/TypeScript that allows you to evaluate complex nested conditions with support for various logical operators and deep object traversal.

## Features

-   🚀 **TypeScript Support**: Full TypeScript support with type definitions
-   🔍 **Deep Object Traversal**: Access nested properties using `{{path.to.property}}` notation
-   🧩 **Multiple Logical Operators**: Supports AND/OR logic with unlimited nesting
-   🔄 **Dynamic Paths & Values**: Use `{{variables}}` for both field paths and values
-   � **Mixed Paths**: Combine static and dynamic path segments (e.g., `style.{{device}}`)
-   📦 **Lightweight**: Zero dependencies (production)

## Installation

```bash
# Using npm
npm install jcond

# Using yarn
yarn add jcond

# Using pnpm
pnpm add jcond
```

## Basic Usage

```typescript
import { JsonConditionParser } from "jcond";

// Create a new instance
const parser = new JsonConditionParser();

// Sample data to evaluate against
const data = {
    user: {
        name: "John",
        age: 30,
        roles: ["admin", "editor"],
        preferences: {
            theme: "dark",
            notifications: {
                email: true,
                push: false,
            },
        },
        device: "mobile",
    },
    environment: "production",
};

// Define your conditions with dynamic paths and values
const conditions = {
    logic: "and",
    conditions: [
        // Simple field comparison with dynamic path
        { field: "{{user.name}}", operator: "===", value: "John" },

        // Dynamic value from data
        { field: "{{user.age}}", operator: ">=", value: "{{user.preferences.minAge}}" },

        // Check if array contains value
        { field: "{{user.roles}}", operator: "contains", value: "admin" },

        // Nested property check
        { field: "{{user.preferences.notifications.email}}", operator: "===", value: true },

        // Mixed static and dynamic path
        { field: "user.preferences.{{user.device}}.settings.enabled", operator: "===", value: true },
    ],
};

// Evaluate the conditions
const result = parser.evaluate(conditions, data);
console.log(result); // true or false
```

## Available Operators

| Operator   | Description                           | Example                                                    |
| ---------- | ------------------------------------- | ---------------------------------------------------------- |
| `===`      | Strict equality                       | `{ field: 'age', operator: '===', value: 30 }`             |
| `!==`      | Strict inequality                     | `{ field: 'name', operator: '!==', value: 'Admin' }`       |
| `<`        | Less than                             | `{ field: 'age', operator: '<', value: 30 }`               |
| `>`        | Greater than                          | `{ field: 'score', operator: '>', value: 80 }`             |
| `<=`       | Less than or equal to                 | `{ field: 'items', operator: '<=', value: 10 }`            |
| `>=`       | Greater than or equal to              | `{ field: 'level', operator: '>=', value: 5 }`             |
| `isTruthy` | Checks if value is truthy             | `{ field: 'isActive', operator: 'isTruthy' }`              |
| `isFalsy`  | Checks if value is falsy              | `{ field: 'isBanned', operator: 'isFalsy' }`               |
| `contains` | Checks if array/string contains value | `{ field: 'roles', operator: 'contains', value: 'admin' }` |

## Advanced Usage

### Nested Conditions with Dynamic Paths

```typescript
const complexConditions = {
    logic: "or",
    conditions: [
        {
            logic: "and",
            conditions: [
                // Dynamic path with nested conditions
                { field: "{{user.demographics.age}}", operator: ">=", value: 18 },
                { field: "user.preferences.{{user.region}}.notifications", operator: "===", value: true },
                {
                    // Nested condition group
                    logic: "or",
                    conditions: [
                        { field: "{{user.roles}}", operator: "contains", value: "admin" },
                        { field: "{{user.permissions}}", operator: "contains", value: "override" },
                    ],
                },
            ],
        },
        {
            logic: "and",
            conditions: [
                // Dynamic value comparison
                {
                    field: "{{user.session.duration}}",
                    operator: ">=",
                    value: "{{user.subscription.trialPeriod}}",
                },
                // Mixed static/dynamic path
                { field: "features.{{user.plan}}.enabled", operator: "===", value: true },
            ],
        },
    ],
};
```

### Complex Example with Dynamic Paths and Values

```typescript
const featureFlags = {
    features: {
        darkMode: true,
        notifications: {
            email: true,
            push: false,
            inApp: true,
        },
        experimental: {
            newDashboard: false,
            betaFeatures: true,
        },
    },
    user: {
        id: 123,
        name: "John",
        preferences: {
            theme: "dark",
            notifications: {
                email: true,
                push: false,
                frequency: "daily",
            },
            experimental: {
                enabled: true,
                features: ["newDashboard"],
            },
        },
        subscription: {
            plan: "pro",
            status: "active",
            features: ["advancedAnalytics", "customThemes"],
        },
    },
};

const conditions = {
    logic: "and",
    conditions: [
        // Check if feature is enabled for user's plan
        {
            field: "features.{{user.subscription.plan}}.enabled",
            operator: "===",
            value: true,
        },
        // Check if user has a specific feature enabled
        {
            field: "user.subscription.features",
            operator: "contains",
            value: "{{user.preferences.theme}}.themes",
        },
        // Check notification preferences
        {
            field: "user.preferences.notifications.{{notificationType}}",
            operator: "===",
            value: true,
        },
    ],
};

const result = parser.evaluate(conditions, featureFlags);
```

## Dynamic Path Resolution

JCond supports flexible path resolution using `{{}}` syntax for both field paths and values:

### Basic Dynamic Paths

```typescript
const data = {
    user: {
        profile: {
            name: "John",
            settings: {
                theme: "dark",
                notifications: {
                    email: true,
                    push: false,
                    devices: ["mobile", "tablet"],
                },
            },
            preferences: {
                notificationType: "email",
            },
        },
        device: "mobile",
    },
};

// Dynamic path using variables
const conditions = {
    field: "user.profile.settings.notifications.{{user.device}}",
    operator: "===",
    value: true,
};

// Dynamic value from nested property
const dynamicValueCondition = {
    field: "user.profile.settings.theme",
    operator: "===",
    value: "{{user.profile.preferences.theme}}",
};

// Dynamic array access
const arrayAccessCondition = {
    field: "user.profile.settings.notifications.devices[0]",
    operator: "===",
    value: "{{user.device}}",
};
```

### Mixed Static and Dynamic Paths

```typescript
const conditions = {
    logic: "and",
    conditions: [
        // Static path with dynamic value
        {
            field: "user.profile.settings.theme",
            operator: "===",
            value: "{{user.preferences.theme}}",
        },
        // Dynamic path segment
        {
            field: "features.{{user.device}}.enabled",
            operator: "===",
            value: true,
        },
        // Dynamic array index
        {
            field: "notifications[{{user.preferences.defaultNotificationIndex || 0}}].enabled",
            operator: "===",
            value: true,
        },
    ],
};
```

### Context-Aware Evaluation

You can provide additional context for evaluation that isn't part of the main data object:

```typescript
const data = {
    user: {
        id: 123,
        name: "John",
    },
};

const context = {
    currentTime: new Date().getHours(),
    isWeekend: [0, 6].includes(new Date().getDay()),
};

const conditions = {
    logic: "and",
    conditions: [
        {
            field: "user.name",
            operator: "===",
            value: "{{user.name}}",
        },
        {
            // Only show special content on weekends
            field: "{{isWeekend}}",
            operator: "===",
            value: true,
            context: context,
        },
        {
            // Only show between 9 AM and 5 PM
            field: "{{currentTime}}",
            operator: ">=",
            value: 9,
            context: context,
        },
        {
            field: "{{currentTime}}",
            operator: "<",
            value: 17,
            context: context,
        },
    ],
};
```

## API Reference

### `new JsonConditionParser()`

Creates a new instance of the condition parser.

### `evaluate(conditions: ConditionConfig, data: any): boolean`

Evaluates the given conditions against the provided data.

-   `conditions`: The condition configuration to evaluate
-   `data`: The data object to evaluate against
-   Returns: `boolean` - The result of the evaluation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Sheikh Ariful Islam - [@your_twitter](https://twitter.com/your_twitter)

Project Link: [https://github.com/sheikharifulislam/jcond](https://github.com/sheikharifulislam/jcond)

## Acknowledgments

-   [es-toolkit](https://github.com/the-spyke/es-toolkit) - For utility functions
-   All contributors who have helped shape this project -->
