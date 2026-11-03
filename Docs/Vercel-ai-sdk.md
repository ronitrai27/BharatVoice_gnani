---
title: Overview
description: An overview of AI SDK Core.
url: "https://ai-sdk.dev/docs/ai-sdk-core/overview"
docs_index: /llms.txt
---

> For an index of all documentation, see [/llms.txt](/llms.txt).

Large Language Models (LLMs) are advanced programs that can understand, create, and engage with human language on a large scale.
They are trained on vast amounts of written material to recognize patterns in language and predict what might come next in a given piece of text.

AI SDK Core **simplifies working with LLMs by offering a standardized way of integrating them into your app** - so you can focus on building great AI applications for your users, not waste time on technical details.

For example, here’s how you can generate text with various models using the AI SDK:

## AI SDK Core Functions

AI SDK Core has various functions designed for [text generation](./generating-text), [structured data generation](./generating-structured-data), and [tool usage](./tools-and-tool-calling).
These functions take a standardized approach to setting up [prompts](/docs/foundations/prompts) and [settings](./settings), making it easier to work with different models.

- [`generateText`](/docs/ai-sdk-core/generating-text): Generates text and [tool calls](./tools-and-tool-calling).
  This function is ideal for non-interactive use cases such as automation tasks where you need to write text (e.g. drafting email or summarizing web pages) and for agents that use tools.
- [`streamText`](/docs/ai-sdk-core/generating-text): Stream text and tool calls.
  You can use the `streamText` function for interactive use cases such as [chat bots](/docs/ai-sdk-ui/chatbot) and [content streaming](/docs/ai-sdk-ui/completion).

Both `generateText` and `streamText` support [structured output](/docs/ai-sdk-core/generating-structured-data) via the `output` property (e.g. `Output.object()`, `Output.array()`), allowing you to generate typed, schema-validated data for information extraction, synthetic data generation, classification tasks, and [streaming generated UIs](/docs/ai-sdk-ui/object-generation).

## API Reference

Please check out the [AI SDK Core API Reference](/docs/reference/ai-sdk-core) for more details on each function.

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/llms.txt](/llms.txt)

For agent-facing discovery, including API and MCP surfaces, see [/agents.md](/agents.md)


==============================================================================================

---
title: Tool Calling
description: Learn about tool calling and multi-step calls (using stopWhen) with AI SDK Core.
url: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling"
docs_index: /llms.txt
---

> For an index of all documentation, see [/llms.txt](/llms.txt).

As covered under Foundations, [tools](/docs/foundations/tools) are objects that can be called by the model to perform a specific task.
Function tools and dynamic tools contain several core elements:

- **`description`**: An optional description of the tool that can influence when the tool is picked. It can be a string or a function that derives the description from the tool's context and experimental sandbox.
- **`inputSchema`**: A [Zod schema](/docs/foundations/tools#schemas) or a [JSON schema](/docs/reference/ai-sdk-core/json-schema) that defines the input parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls.
- **`execute`**: An optional async function that is called with the inputs from the tool call. It produces a value of type `RESULT` (generic type). It is optional because you might want to forward tool calls to the client or to a queue instead of executing them in the same process.
- **`strict`**: *(optional, boolean)* Enables strict tool calling when supported by the provider

You can use the [`tool`](/docs/reference/ai-sdk-core/tool) helper function to
infer the types of the `execute` parameters.

The `tools` parameter of `generateText` and `streamText` is an object that has the tool names as keys and the tools as values:

```ts {7-18}
import { z } from 'zod';
import { generateText, tool, isStepCount } from 'ai';

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  stopWhen: isStepCount(5),
  prompt: 'What is the weather in San Francisco?',
});
```

When a model uses a tool, it is called a "tool call" and the output of the
tool is called a "tool result".

Tool calling is not restricted to only text generation.
You can also use it to render user interfaces (Generative UI).

## Dynamic Descriptions

Tool descriptions can be fixed strings or functions. Use a function when the
description sent to the model should depend on the current tool context or
experimental sandbox, such as a tenant, project, environment, or workspace.

The description function is resolved before the tool definition is sent to the
model for each generation step. It receives the matching tool `context` from
`toolsContext` and the current `experimental_sandbox`, if one was provided. If `prepareStep`
updates `toolsContext` or `experimental_sandbox`, the next step uses those updated values.

```ts {5-16,32-35}
import { generateText, tool } from 'ai';
import { z } from 'zod';

const shell = tool({
  contextSchema: z.object({
    projectName: z.string(),
  }),
  description: ({ context, experimental_sandbox }) =>
    [
      `Run shell commands for the ${context.projectName} project.`,
      experimental_sandbox != null
        ? `Sandbox: ${experimental_sandbox.description}`
        : undefined,
    ]
      .filter(Boolean)
      .join('\n'),
  inputSchema: z.object({
    command: z.string(),
  }),
  execute: async ({ command }, { experimental_sandbox }) => {
    if (!experimental_sandbox) {
      throw new Error('Experimental sandbox is not available');
    }

    return experimental_sandbox.run({ command });
  },
});

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: { shell },
  toolsContext: {
    shell: { projectName: 'web-app' },
  },
  experimental_sandbox,
  prompt: 'List the project files.',
});
```

## Strict Mode

When enabled, language model providers that support strict tool calling will only generate tool calls that are valid according to your defined `inputSchema`.
This increases the reliability of tool calling.
However, not all schemas may be supported in strict mode, and what is supported depends on the specific provider.

By default, strict mode is disabled. You can enable it per-tool by setting `strict: true`:

```ts
tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  strict: true, // Enable strict validation for this tool
  execute: async ({ location }) => ({
    // ...
  }),
});
```

Not all providers or models support strict mode. For those that do not, this
option is ignored.

## Input Examples

You can specify example inputs for your tools to help guide the model on how input data should be structured.
When supported by providers, input examples can help when JSON schema itself does not fully specify the intended
usage or when there are optional values.

```ts
tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  inputExamples: [
    { input: { location: 'San Francisco' } },
    { input: { location: 'London' } },
  ],
  execute: async ({ location }) => {
    // ...
  },
});
```

Only the Anthropic providers supports tool input examples natively. Other
providers ignore the setting.

## Tool Execution Approval

By default, tools with an `execute` function run automatically as the model calls them. Configure approval with `toolApproval` on `generateText`, `streamText`, or `ToolLoopAgent`.

`toolApproval` can be either:

- A `GenericToolApprovalFunction` for all tool calls
- A per-tool map of statuses and/or `SingleToolApprovalFunction` callbacks (either function may return `undefined` for the same effect as `'not-applicable'`)

The older `needsApproval` property on `tool()` definitions is deprecated. Existing code still works, but new code should move approval logic to `toolApproval`.

### Configure `toolApproval`

```ts {4-6}
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: { runCommand },
  toolApproval: {
    runCommand: 'user-approval',
  },
  prompt: 'Remove the most recent file in the downloads folder',
});
```

In the per-tool object form, each key can be one of four statuses, either as a
string or as an object with a `type` field:

- `'not-applicable'`: the tool is executed without an approval flow. This is the default behavior.
- `'approved'`: record an automatic approval by emitting approval request/response parts in the output, then execute the tool
- `'denied'`: record an automatic denial by emitting approval request/response parts in the output, then surface a denied tool output
- `'user-approval'`: emit an approval request and wait for an explicit response

Object statuses can also include a reason. For automatic approvals and denials,
the reason is emitted on the approval response. For manual approval, the reason
is emitted on the approval request so it can be shown to the approver:

```ts
toolApproval: {
  runCommand: {
    type: 'user-approval',
    reason: 'filesystem changes require operator review',
  },
}
```

#### Generic `toolApproval` function

Pass a `GenericToolApprovalFunction` as `toolApproval` to handle every tool
call in one place. The callback receives `toolCall`, `tools`, `toolsContext`,
`messages`, and `runtimeContext` (the same `runtimeContext` you pass to
`generateText` or `streamText`, typed as the second `ToolApprovalConfiguration`
type parameter; it defaults to `Context`). It may return `undefined` for the same effect as `'not-applicable'`.

```ts {4-10}
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: { runCommand },
  toolApproval: ({
    toolCall,
    tools,
    toolsContext,
    messages,
    runtimeContext,
  }) => {
    if (toolCall.toolName === 'runCommand' && !toolCall.dynamic) {
      // Inspect toolCall.input, cross-tool state, messages, or runtimeContext for policy.
      return 'user-approval';
    }
    return undefined; // or 'not-applicable'
  },
  prompt: 'Remove the most recent file in the downloads folder',
});
```

The same pattern works for `streamText` and for `toolApproval` on
[`ToolLoopAgent`](/docs/agents/building-agents#tools) when you need one policy
across all tools.

For a per-tool object instead, each key can be a `SingleToolApprovalFunction`
that receives the tool input and options `toolCallId`, `messages`, `toolContext`
(the same shape as tool execution `context`, without `abortSignal`), and
`runtimeContext`. Return `undefined` for the same effect as `'not-applicable'`.

This is useful for tools that perform sensitive operations like executing commands, processing payments, modifying data, and more potentially dangerous actions.

### How It Works

When a tool requires manual approval, `generateText` and `streamText` don't pause execution. Instead, they complete and return `tool-approval-request` parts in the result content. This means the manual approval flow requires two calls to the model: the first returns the approval request, and the second (after receiving the approval response) either executes the tool or informs the model that approval was denied.

Manual approval comes from `toolApproval` returning `'user-approval'`. If the
tool should just execute normally, use `'not-applicable'`, return `undefined`
from a `GenericToolApprovalFunction` or `SingleToolApprovalFunction`, or omit
the setting entirely. If `toolApproval` returns `'approved'` or `'denied'` or
their object forms, the SDK records that decision automatically in the same
generation by emitting approval request/response parts. When you provide a
`reason` on an automatic approval or denial, that reason is included in the
emitted approval response and can be rendered in the UI.

Here's the manual approval flow:

1. Call `generateText` or `streamText` with `toolApproval`
2. The model generates a tool call
3. The call returns `tool-approval-request` parts in `result.content`
4. Your app requests approval and collects the user's decision
5. Add a `tool-approval-response` to the messages array
6. Call `generateText` or `streamText` again with the updated messages
7. If approved, the tool runs and returns a result. If denied, the model sees the denial and responds accordingly.

### Handling Approval Requests

After calling `generateText` or `streamText`, check `result.content` for `tool-approval-request` parts:

```ts
import { type ModelMessage, generateText } from 'ai';

const messages: ModelMessage[] = [
  { role: 'user', content: 'Remove the most recent file' },
];
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: { runCommand },
  toolApproval: {
    runCommand: 'user-approval',
  },
  messages,
});

messages.push(...result.responseMessages);

for (const part of result.content) {
  if (part.type === 'tool-approval-request' && !part.isAutomatic) {
    console.log(part.approvalId); // Unique ID for this approval request
    console.log(part.toolCall); // Contains toolName, input, etc.
    console.log(part.reason); // Why this tool call requires approval
  }
}
```

To respond, create a `tool-approval-response` and add it to your messages:

```ts
import { type ToolApprovalResponse } from 'ai';

const approvals: ToolApprovalResponse[] = [];

for (const part of result.content) {
  if (part.type === 'tool-approval-request' && !part.isAutomatic) {
    const response: ToolApprovalResponse = {
      type: 'tool-approval-response',
      approvalId: part.approvalId,
      approved: true, // or false to deny
      reason: 'User confirmed the command', // Optional, see below
    };
    approvals.push(response);
  }
}

// add approvals to messages
messages.push({ role: 'tool', content: approvals });
```

Then call `generateText` or `streamText` again with the updated messages. If approved, the tool executes. If denied, the model receives the denial and can respond accordingly.

The optional `reason` is handled differently depending on the decision:

- **Denied**: the reason is included in the `execution-denied` tool result, so the model can see why the tool call was not executed.
- **Approved** (tools executed by the AI SDK): the reason remains in the approval response in your messages (e.g. for rendering in the UI or for audit logs). The SDK does not include it in the model prompt, modify the tool's input, or expose it through a dedicated execution option. The model only sees the tool result. In manual `generateText` and `streamText` continuations, the approval response is available to the tool's `execute` function through `options.messages`.

The approval `reason` is not a channel for passing data to an approved tool.
If you need input from the user (for example, an answer to a question or a
corrected value), use a tool without an `execute` function and provide its
result from the client instead. See [Chatbot Tool
Usage](/docs/ai-sdk-ui/chatbot-tool-usage).

When the tool should execute without any approval metadata in the output, use
`'not-applicable'`, return `undefined` from an approval function, or omit `toolApproval`. Use `'approved'`, `'denied'`, or
their object forms only when you want the result to include an automatic
`tool-approval-request` with `isAutomatic: true` followed by a
`tool-approval-response`, so you can inspect or render the decision without
prompting the user again.

When a tool execution is denied, consider adding a system instruction like
"When a tool execution is not approved, do not retry it" to prevent the model
from attempting the same call again.

Provider-executed tools are executed provider-side without considering the
tool approval setting. `toolApproval` (and the deprecated `needsApproval`)
only control tools that the AI SDK executes locally.

### Dynamic Approval

You can make approval decisions based on tool input by providing an async
function in a per-tool `toolApproval` object:

```ts
const paymentTool = tool({
  description: 'Process a payment',
  inputSchema: z.object({
    amount: z.number(),
    recipient: z.string(),
  }),
  execute: async ({ amount, recipient }) => {
    return await processPayment(amount, recipient);
  },
});

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    processPayment: paymentTool,
  },
  toolApproval: {
    processPayment: async ({ amount }) =>
      amount > 1000 ? 'user-approval' : undefined,
  },
  prompt: 'Send $1500 to the contractor',
});
```

In this example, only transactions over $1000 require approval. Smaller
transactions execute automatically.

You can use a `SingleToolApprovalFunction` in a per-tool `toolApproval` object when you want to return
`'not-applicable'`, `undefined` (equivalent to `'not-applicable'`), `'approved'`, `'denied'`, or `'user-approval'` at call time
instead of defining the default on the tool itself. For automatic approvals and
denials, the callback can also return `{ type, reason }`, for example
`{ type: 'denied', reason: 'blocked by policy' }`. For decisions that need the full `toolCall` or
several tools at once, pass a `GenericToolApprovalFunction` as `toolApproval` instead
of a per-tool map. The generic function can return `undefined` the same way.

### Tool Execution Approval with useChat

When using `useChat`, the approval flow is handled through UI state. See [Chatbot Tool Usage](/docs/ai-sdk-ui/chatbot-tool-usage#tool-execution-approval) for details on handling approvals in your UI with `addToolApprovalResponse`.

## Multi-Step Calls (using stopWhen)

With the `stopWhen` setting, you can enable multi-step calls in `generateText` and `streamText`. When `stopWhen` is set and the model generates a tool call, the AI SDK will trigger a new generation passing in the tool result until there are no further tool calls or the stopping condition is met.

The AI SDK provides several built-in stopping conditions:

- `isStepCount(count)` — stops after a specified number of steps (default: `isStepCount(1)` for `generateText` and `streamText`)
- `hasToolCall(...toolNames)` — stops when any of the specified tools is called
- `isLoopFinished()` — never triggers, letting the loop run until naturally finished

You can also combine multiple conditions in an array or create custom conditions. See [Loop Control](/docs/agents/loop-control) for more details.

The `stopWhen` conditions are only evaluated when the last step contains tool
results.

By default, when you use `generateText` or `streamText`, it triggers a single generation. This works well for many use cases where you can rely on the model's training data to generate a response. However, when you provide tools, the model now has the choice to either generate a normal text response, or generate a tool call. A step includes one model generation and the execution of any local tools requested by that generation. If the model generates a tool call, the model generation finishes first; the step finishes after its local tool execution completes.

You may want the model to generate text after the tool has been executed, either to summarize the tool results in the context of the users query. In many cases, you may also want the model to use multiple tools in a single response. This is where multi-step calls come in.

You can think of multi-step calls in a similar way to a conversation with a human. When you ask a question, if the person does not have the requisite knowledge in their common knowledge (a model's training data), the person may need to look up information (use a tool) before they can provide you with an answer. In the same way, the model may need to call a tool to get the information it needs to answer your question where each generation (tool call or text generation) is a step.

### Example

In the following example, there are two steps:

1. **Step 1**
   1. The prompt `'What is the weather in San Francisco?'` is sent to the model.
   2. The model generates a tool call.
   3. The tool call is executed.
2. **Step 2**
   1. The tool result is sent to the model.
   2. The model generates a response considering the tool result.

```ts {19-20}
import { z } from 'zod';
import { generateText, tool, isStepCount } from 'ai';

const { text, steps } = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  stopWhen: isStepCount(5), // stop after a maximum of 5 steps if tools were called
  prompt: 'What is the weather in San Francisco?',
});
```

You can use

`streamText`

in a similar way.

### Steps

To access intermediate tool calls and results, you can use the `steps` property in the result object
or the `streamText` `onEnd` callback.
It contains all the text, tool calls, tool results, per-step `performance`, and more from each step.

#### Example: Extract tool results from all steps

```ts {4,10-11}
import { generateText } from 'ai';

const { steps } = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  stopWhen: isStepCount(10),
  // ...
});

// extract all tool calls from the steps:
const allToolCalls = steps.flatMap(step => step.toolCalls);
```

### `onStepEnd` callback

When using `generateText` or `streamText`, you can provide an `onStepEnd` callback that
is triggered when a step is finished,
i.e. all text deltas, tool calls, and tool results for the step are available.
When you have multiple steps, the callback is triggered for each step.

The callback receives a `stepNumber` (zero-based) to identify which step just completed:

```tsx {5-8}
import { generateText } from 'ai';

const result = await generateText({
  // ...
  onStepEnd({
    stepNumber,
    text,
    toolCalls,
    toolResults,
    finishReason,
    usage,
    performance,
  }) {
    console.log(`Step ${stepNumber} finished (${finishReason})`, {
      usage,
      performance,
    });
    // your own logic, e.g. for saving the chat history or recording usage
  },
});
```

### Tool call execution concurrency

By default, when a model generates multiple tool calls in one step,
`generateText`, `streamText`, and `ToolLoopAgent` execute those calls
concurrently. Set `toolCallConcurrency` to a positive integer to limit how many
SDK-executed tool calls run at once.

Use `toolCallConcurrency: 1` when later calls need to observe side effects from
earlier calls. The SDK starts calls sequentially in the order the model
generated them:

```ts {5}
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools,
  prompt: 'Update the file, then read it.',
  toolCallConcurrency: 1,
});
```

This option controls execution of tool calls that the SDK runs locally. It does
not change how many tool calls the model may generate, and it does not schedule
provider-executed tools or client-side tools. Provider options such as
`parallelToolCalls` control model generation instead.

When the operation is aborted, active tools receive the abort signal and queued
tool calls are not started. A streaming tool holds its concurrency slot until
its final output or error.

### Tool execution lifecycle callbacks

You can use `onToolExecutionStart` and `onToolExecutionEnd` to observe tool execution.
These callbacks are called right before and after each tool's `execute` function, giving you
visibility into tool execution timing, inputs, outputs, and errors:

```tsx {5-14}
import { generateText } from 'ai';

const result = await generateText({
  // ... model, tools, prompt
  onToolExecutionStart({ toolCall }) {
    console.log(`Calling tool: ${toolCall.toolName}`, {
      toolCallId: toolCall.toolCallId,
      input: toolCall.input,
    });
  },
  onToolExecutionEnd({ toolCall, toolExecutionMs, toolOutput }) {
    if (toolOutput.type === 'tool-error') {
      console.error(
        `Tool ${toolCall.toolName} failed after ${toolExecutionMs}ms:`,
        toolOutput.error,
      );
    } else {
      console.log(
        `Tool ${toolCall.toolName} completed in ${toolExecutionMs}ms`,
        {
          output: toolOutput.output,
        },
      );
    }
  },
});
```

Errors thrown inside these callbacks are silently caught and do not break the generation flow.

### `prepareStep` callback

The `prepareStep` callback is called before a step is started.

It is called with the following parameters:

- `model`: The model that was passed into `generateText`.
- `stopWhen`: The stopping condition that was passed into `generateText`.
- `stepNumber`: The number of the step that is being executed.
- `steps`: The steps that have been executed so far.
- `instructions`: The instructions that will be sent to the model for the current step. If `prepareStep` returns an `instructions` override, those instructions carry forward as the default for later steps.
- `initialInstructions`: The instructions that were passed into `generateText` or `streamText`.
- `messages`: The messages that will be sent to the model for the current step. Treat this as the loop's current message state. If `prepareStep` returns a `messages` override, those messages carry forward as the base for later steps.
- `initialMessages`: The messages that were passed into `generateText` or `streamText`.
- `responseMessages`: The accumulated assistant/tool response messages so far, including any tool results generated before the first model step from approved tool calls in the input messages.
- `runtimeContext`: The runtime context passed via the `runtimeContext` setting.
- `toolsContext`: The per-tool context map passed via the `toolsContext` setting.
- `experimental_sandbox`: The experimental sandbox passed via the `experimental_sandbox` setting.

You can use it to provide different settings for a step, including modifying the input messages.

```tsx {5-7}
import { generateText } from 'ai';

const result = await generateText({
  // ...
  prepareStep: async ({ model, stepNumber, steps, messages }) => {
    if (stepNumber === 0) {
      return {
        // use a different model for this step:
        model: modelForThisParticularStep,
        // force a tool choice for this step:
        toolChoice: { type: 'tool', toolName: 'tool1' },
        // limit the tools that are available for this step:
        activeTools: ['tool1'],
      };
    }

    // when nothing is returned, the default settings are used
  },
});
```

If you return `instructions`, those instructions carry forward to later steps until `prepareStep` returns another `instructions` or `system` override. Use `initialInstructions` when you need to restore or compare against the top-level instructions from the original call.

#### Message Modification for Longer Agentic Loops

In longer agentic loops, you can use the `messages` parameter to mutate the message state that will be used by later steps. This is particularly useful for context compaction, and you decide when compaction should happen.

The `messages` parameter contains the messages for the current step. By default, this is `initialMessages` followed by the accumulated `responseMessages`. If a previous `prepareStep` returned `messages`, later steps use those persisted messages plus the response messages from the previous step.

Use `initialMessages` when you need the original input messages and `responseMessages` when you need the discrete assistant/tool response messages from the model so far.

The `pruneMessages` helper provides a built-in way to remove selected messages or message parts. You can use it inside `prepareStep` when you want a simple compaction strategy.

```tsx
import { generateText, pruneMessages, type ModelMessage } from 'ai';

const COMPACTION_THRESHOLD = 100_000;

const estimateTokens = (messages: ModelMessage[]) => {
  return JSON.stringify(messages).length / 4;
};

const result = await generateText({
  // ...
  prepareStep: ({ messages }) => {
    if (estimateTokens(messages) > COMPACTION_THRESHOLD) {
      return {
        messages: pruneMessages({
          messages,
          reasoning: 'all',
          toolCalls: 'before-last-3-messages',
          emptyMessages: 'remove',
        }),
      };
    }
  },
});
```

This example uses an estimated token threshold, but you can use any trigger. The key behavior is that returning `messages` mutates the message state for later steps.

Returned message changes persist across steps. If you want to derive each step's messages from the original input plus the discrete response messages instead of the persisted message state, rebuild them from `initialMessages` and `responseMessages` each time:

```tsx
prepareStep: ({ initialMessages, responseMessages, stepNumber }) => {
  if (stepNumber > 0) {
    return {
      messages: [...initialMessages, ...responseMessages.slice(-10)],
    };
  }
},
```

#### Provider Options for Step Configuration

You can use `providerOptions` in `prepareStep` to pass provider-specific configuration for each step. This is useful for features like Anthropic's code execution container persistence:

```tsx
import { forwardAnthropicContainerIdFromLastStep } from '@ai-sdk/anthropic';

// Propagate container ID from previous step for code execution continuity
prepareStep: forwardAnthropicContainerIdFromLastStep,
```

## Response Messages

Adding the generated assistant and tool messages to your conversation history is a common task,
especially if you are using multi-step tool calls.

Both `generateText` and `streamText` have a `responseMessages` property that you can use to
add the assistant and tool messages to your conversation history.
It is also available in the `onEnd` callback of `streamText`.

The `responseMessages` property contains the accumulated response messages from the call as an array of `ModelMessage` objects that you can add to your conversation history:

```ts
import { generateText, ModelMessage } from 'ai';

const messages: ModelMessage[] = [
  // ...
];

const { responseMessages } = await generateText({
  // ...
  messages,
});

// add the response messages to your conversation history:
messages.push(...responseMessages); // streamText: ...(await result.responseMessages)
```

## Dynamic Tools

AI SDK Core supports dynamic tools for scenarios where tool schemas are not known at compile time. This is useful for:

- MCP (Model Context Protocol) tools without schemas
- User-defined functions at runtime
- Tools loaded from external sources

### Using dynamicTool

The `dynamicTool` helper creates tools with unknown input/output types:

```ts
import { dynamicTool } from 'ai';
import { z } from 'zod';

const customTool = dynamicTool({
  description: 'Execute a custom function',
  inputSchema: z.object({}),
  execute: async input => {
    // input is typed as 'unknown'
    // You need to validate/cast it at runtime
    const { action, parameters } = input as any;

    // Execute your dynamic logic
    return { result: `Executed ${action}` };
  },
});
```

### Type-Safe Handling

When using both static and dynamic tools, use the `dynamic` flag for type narrowing:

```ts
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    // Static tool with known types
    weather: weatherTool,
    // Dynamic tool
    custom: dynamicTool({
      /* ... */
    }),
  },
  onStepEnd: ({ toolCalls, toolResults }) => {
    // Type-safe iteration
    for (const toolCall of toolCalls) {
      if (toolCall.dynamic) {
        // Dynamic tool: input is 'unknown'
        console.log('Dynamic:', toolCall.toolName, toolCall.input);
        continue;
      }

      // Static tool: full type inference
      switch (toolCall.toolName) {
        case 'weather':
          console.log(toolCall.input.location); // typed as string
          break;
      }
    }
  },
});
```

## Preliminary Tool Results

You can return an `AsyncIterable` over multiple results.
In this case, the last value from the iterable is the final tool result.

This can be used in combination with generator functions to e.g. stream status information
during the tool execution:

```ts
tool({
  description: 'Get the current weather.',
  inputSchema: z.object({
    location: z.string(),
  }),
  async *execute({ location }) {
    yield {
      status: 'loading' as const,
      text: `Getting weather for ${location}`,
      weather: undefined,
    };

    await new Promise(resolve => setTimeout(resolve, 3000));

    const temperature = 72 + Math.floor(Math.random() * 21) - 10;

    yield {
      status: 'success' as const,
      text: `The weather in ${location} is ${temperature}°F`,
      temperature,
    };
  },
});
```

## Tool Choice

You can use the `toolChoice` setting to influence when a tool is selected.
It supports the following settings:

- `auto` (default): the model can choose whether and which tools to call.
- `required`: the model must call a tool. It can choose which tool to call.
- `none`: the model must not call tools
- `{ type: 'tool', toolName: string (typed) }`: the model must call the specified tool

When `toolChoice` is `'none'`, the SDK prevents local tool execution even if the
model returns a tool call. Such responses produce a
[`ToolChoiceViolationError`](/docs/reference/ai-sdk-errors/ai-tool-choice-violation-error).
With `streamText`, tool parts are withheld from the stream, so client-side tools
are not invoked either. Tool call repair and input refinement are skipped for
rejected tool calls.

```ts {19}
import { z } from 'zod';
import { generateText, tool } from 'ai';

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  toolChoice: 'required', // force the model to call a tool
  prompt: 'What is the weather in San Francisco?',
});
```

## Tool Execution Options

When tools are called, they receive additional options as a second parameter.

### Tool Call ID

The ID of the tool call is forwarded to the tool execution.
You can use it e.g. when sending tool-call related information with stream data.

```ts {15-21}
import {
  streamText,
  tool,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        // ...
        messages,
        tools: {
          myTool: tool({
            // ...
            execute: async (args, { toolCallId }) => {
              // return e.g. custom status for tool call
              writer.write({
                type: 'data-tool-status',
                id: toolCallId,
                data: {
                  name: 'myTool',
                  status: 'in-progress',
                },
              });
              // ...
            },
          }),
        },
      });

      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}
```

### Messages

The messages that were sent to the language model to initiate the response that contained the tool call are forwarded to the tool execution.
You can access them in the second parameter of the `execute` function.
In multi-step calls, the messages contain the text, tool calls, and tool results from all previous steps.

```ts {8-9}
import { generateText, tool } from 'ai';

const result = await generateText({
  // ...
  tools: {
    myTool: tool({
      // ...
      execute: async (args, { messages }) => {
        // use the message history in e.g. calls to other language models
        return { ... };
      },
    }),
  },
});
```

### Abort Signals

The abort signals from `generateText` and `streamText` are forwarded to the tool execution.
You can access them in the second parameter of the `execute` function and e.g. abort long-running computations or forward them to fetch calls inside tools.

```ts {7,12,15}
import { z } from 'zod';
import { generateText, tool } from 'ai';

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  abortSignal: myAbortSignal, // signal that will be forwarded to tools
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({ location: z.string() }),
      execute: async ({ location }, { abortSignal }) => {
        return fetch(
          `https://api.weatherapi.com/v1/current.json?q=${location}`,
          { signal: abortSignal }, // forward the abort signal to fetch
        );
      },
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
```

### Experimental Sandbox

Pass `experimental_sandbox` to `generateText`, `streamText`, or a `ToolLoopAgent`
call when a tool needs to run commands or code in an execution environment. The experimental sandbox is available to tool description functions and on the second parameter of the tool's `execute` function.

This API is experimental and can change in patch releases. Passing an
experimental sandbox does not sandbox the tool itself.

Tool code still runs wherever your application runs. Only the operations that your tool explicitly delegates to
the experimental sandbox, such as `experimental_sandbox.run(...)`,
run in the experimental sandbox environment.

```ts {7-15,21}
import { generateText, tool } from 'ai';
import { z } from 'zod';

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    shell: tool({
      inputSchema: z.object({
        command: z.string(),
        workingDirectory: z.string().optional(),
      }),
      execute: async (
        { command, workingDirectory },
        { abortSignal, experimental_sandbox },
      ) => {
        if (!experimental_sandbox) {
          throw new Error('Experimental sandbox is not available');
        }

        return experimental_sandbox.run({
          command,
          workingDirectory,
          abortSignal,
        });
      },
    }),
  },
  experimental_sandbox,
  prompt: 'List the files in the project.',
});
```

The experimental sandbox description is not added to the model prompt automatically. If the model should know about details such as the root directory, exposed ports, or public hostname, include `experimental_sandbox.description` in your system prompt,
instructions, user-visible context, or a tool description function.

`run` also accepts an optional `workingDirectory`, `env`, and `abortSignal`.
Use `workingDirectory` when a tool needs to run a command from a directory other
than the experimental sandbox implementation's default working directory. Use `env`
to set environment variables for the command. Forward
`abortSignal` from the tool execution options so the experimental sandbox can cancel the command if the overall operation is aborted or times out.

The AI SDK forwards your experimental sandbox object but does not create or isolate one for you.

The `Experimental_SandboxSession` interface is only a contract. Its isolation guarantees depend on your implementation or experimental sandbox provider. A local implementation that uses
`child_process.exec` with a working directory is not a security boundary because
commands can still access paths outside that directory. For untrusted commands
or user-directed coding agents, use a real isolation provider, restrict
available commands, set command timeouts, and combine experimental sandbox usage with [tool approval](#tool-execution-approval) for sensitive actions.

### Runtime Context

You can pass in arbitrary runtime context from `generateText` or `streamText` via the `runtimeContext` setting.
This runtime context is available in `prepareStep`.

To avoid confusion with prompt context or retrieved context, the docs refer to this feature as runtime context.

This is useful for values like tenant information, feature flags, session data, or other server-side state that should influence step preparation without being embedded into the prompt.

Tool execution context is now separate. If a tool needs server-side values such as API keys, pass them via `toolsContext`, keyed by tool name. Each tool then receives only its own typed `context` value based on its `contextSchema`.

For the full mental model, examples, lifecycle details, and guidance on choosing
between prompt context, runtime context, and tool context, see
[Runtime and Tool Context](/docs/ai-sdk-core/runtime-and-tool-context).

### Tool Context Telemetry

Tool context often contains server-side values such as API keys, access tokens, or internal identifiers.
Use `telemetry.includeToolsContext` to include selected top-level context properties in telemetry integrations:

```ts {24-30}
const weatherTool = tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  contextSchema: z.object({
    weatherApiKey: z.string(),
    defaultUnit: z.enum(['celsius', 'fahrenheit']),
  }),
  execute: async ({ location }, { context }) => {
    return fetchWeather({
      location,
      apiKey: context.weatherApiKey,
      unit: context.defaultUnit,
    });
  },
});

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: { weather: weatherTool },
  toolsContext: {
    weather: {
      weatherApiKey: process.env.WEATHER_API_KEY,
      defaultUnit: 'fahrenheit',
    },
  },
  prompt: 'What is the weather in San Francisco?',
  telemetry: {
    includeToolsContext: {
      weather: {
        defaultUnit: true,
      },
    },
  },
});
```

Telemetry integrations receive the `weather` tool context as `{ defaultUnit: 'fahrenheit' }`.
Properties set to `false` or omitted are excluded. If `telemetry.includeToolsContext` is omitted, no tool context properties are included.

`telemetry.includeToolsContext` only filters telemetry integrations. Tool
execution, lifecycle callbacks, and returned results still receive the full
typed tool context. See [Runtime and Tool
Context](/docs/ai-sdk-core/runtime-and-tool-context) for how tool context
flows through execution and telemetry.

## Tool Input Lifecycle Hooks

The following tool input lifecycle hooks are available:

- **`onInputStart`**: Called when the model starts generating the input (arguments) for the tool call
- **`onInputDelta`**: Called for each chunk of text as the input is streamed
- **`onInputAvailable`**: Called when the complete input is available and validated

`onInputStart` is always called before `onInputAvailable`, including when using `generateText`. `onInputDelta` is only called in streaming contexts (when using `streamText`).

### Example

```ts {16-24}
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    getWeather: tool({
      description: 'Get the weather in a location',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
      onInputStart: () => {
        console.log('Tool call starting');
      },
      onInputDelta: ({ inputTextDelta }) => {
        console.log('Received input chunk:', inputTextDelta);
      },
      onInputAvailable: ({ input }) => {
        console.log('Complete input:', input);
      },
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
```

## Types

Modularizing your code often requires defining types to ensure type safety and reusability.
To enable this, the AI SDK provides several helper types for tools, tool calls, and tool results.

You can use them to strongly type your variables, function parameters, and return types
in parts of the code that are not directly related to `streamText` or `generateText`.

Each tool call is typed with `ToolCall<NAME extends string, ARGS>`, depending
on the tool that has been invoked.
Similarly, the tool results are typed with `ToolResult<NAME extends string, ARGS, RESULT>`.

The tools in `streamText` and `generateText` are defined as a `ToolSet`.
The type inference helpers `TypedToolCall<TOOLS extends ToolSet>`
and `TypedToolResult<TOOLS extends ToolSet>` can be used to
extract the tool call and tool result types from the tools.

```ts {18-19,23-24}
import { TypedToolCall, TypedToolResult, generateText, tool } from 'ai';
import { z } from 'zod';

const myToolSet = {
  firstTool: tool({
    description: 'Greets the user',
    inputSchema: z.object({ name: z.string() }),
    execute: async ({ name }) => `Hello, ${name}!`,
  }),
  secondTool: tool({
    description: 'Tells the user their age',
    inputSchema: z.object({ age: z.number() }),
    execute: async ({ age }) => `You are ${age} years old!`,
  }),
};

type MyToolCall = TypedToolCall<typeof myToolSet>;
type MyToolResult = TypedToolResult<typeof myToolSet>;

async function generateSomething(prompt: string): Promise<{
  text: string;
  toolCalls: Array<MyToolCall>; // typed tool calls
  toolResults: Array<MyToolResult>; // typed tool results
}> {
  return generateText({
    model: "anthropic/claude-sonnet-5.5",
    tools: myToolSet,
    prompt,
  });
}
```

## Handling Errors

The AI SDK has four tool-call related errors:

- [`NoSuchToolError`](/docs/reference/ai-sdk-errors/ai-no-such-tool-error): the model tries to call a tool that is not defined in the tools object
- [`InvalidToolInputError`](/docs/reference/ai-sdk-errors/ai-invalid-tool-input-error): the model calls a tool with inputs that do not match the tool's input schema
- [`ToolCallRepairError`](/docs/reference/ai-sdk-errors/ai-tool-call-repair-error): an error that occurred during tool call repair
- [`ToolChoiceViolationError`](/docs/reference/ai-sdk-errors/ai-tool-choice-violation-error): the `generateText` response does not satisfy a required or specifically selected tool choice

When tool execution fails (errors thrown by your tool's `execute` function), the AI SDK adds them as `tool-error` content parts to enable automated LLM roundtrips in multi-step scenarios.

### `generateText`

`generateText` throws errors for tool schema validation issues and other errors, and can be handled using a `try`/`catch` block. Tool execution errors appear as `tool-error` parts in the result steps:

```ts
try {
  const result = await generateText({
    //...
  });
} catch (error) {
  if (NoSuchToolError.isInstance(error)) {
    // handle the no such tool error
  } else if (InvalidToolInputError.isInstance(error)) {
    // handle the invalid tool inputs error
  } else {
    // handle other errors
  }
}
```

Tool execution errors are available in the result steps:

```ts
const { steps } = await generateText({
  // ...
});

// check for tool errors in the steps
const toolErrors = steps.flatMap(step =>
  step.content.filter(part => part.type === 'tool-error'),
);

toolErrors.forEach(toolError => {
  console.log('Tool error:', toolError.error);
  console.log('Tool name:', toolError.toolName);
  console.log('Tool input:', toolError.input);
});
```

### `streamText`

`streamText` sends errors as part of the `stream` result. Tool execution errors appear as `tool-error` parts, while other errors appear as `error` parts.

When using `toUIMessageStream`, you can pass an `onError` function to extract the error message from the error part and forward it as part of the stream response:

```ts
const result = streamText({
  // ...
});

return createUIMessageStreamResponse({
  stream: toUIMessageStream({
    stream: result.stream,
    onError: error => {
      if (NoSuchToolError.isInstance(error)) {
        return 'The model tried to call a unknown tool.';
      } else if (InvalidToolInputError.isInstance(error)) {
        return 'The model called a tool with invalid inputs.';
      } else {
        return 'An unknown error occurred.';
      }
    },
  }),
});
```

## Tool Call Repair

Language models sometimes fail to generate valid tool calls,
especially when the input schema is complex or the model is smaller.

If you use multiple steps, those failed tool calls will be sent back to the LLM
in the next step to give it an opportunity to fix it.
However, you may want to control how invalid tool calls are repaired without requiring
additional steps that pollute the message history.

You can use the `repairToolCall` function to attempt to repair the tool call
with a custom function.

You can use different strategies to repair the tool call:

- Use a model with structured outputs to generate the inputs.
- Send the messages, instructions, and tool schema to a stronger model to generate the inputs.
- Provide more specific repair instructions based on which tool was called.

### Example: Use a model with structured outputs for repair

```ts
import { openai } from '@ai-sdk/openai';
import { generateText, NoSuchToolError, Output, tool } from 'ai';

const result = await generateText({
  model,
  tools,
  prompt,

  repairToolCall: async ({ toolCall, tools, inputSchema, error }) => {
    if (NoSuchToolError.isInstance(error)) {
      return null; // do not attempt to fix invalid tool names
    }

    const tool = tools[toolCall.toolName as keyof typeof tools];

    const { output: repairedArgs } = await generateText({
      model: "anthropic/claude-sonnet-5.5",
      output: Output.object({ schema: tool.inputSchema }),
      prompt: [
        `The model tried to call the tool "${toolCall.toolName}"` +
          ` with the following inputs:`,
        JSON.stringify(toolCall.input),
        `The tool accepts the following schema:`,
        JSON.stringify(await inputSchema({ toolName: toolCall.toolName })),
        'Please fix the inputs.',
      ].join('\n'),
    });

    return { ...toolCall, input: JSON.stringify(repairedArgs) };
  },
});
```

### Example: Use the re-ask strategy for repair

```ts
import { openai } from '@ai-sdk/openai';
import { generateText, NoSuchToolError, tool } from 'ai';

const result = await generateText({
  model,
  tools,
  prompt,

  repairToolCall: async ({
    toolCall,
    tools,
    error,
    messages,
    instructions,
  }) => {
    const result = await generateText({
      model,
      instructions,
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: [
            {
              type: 'tool-call',
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              input: toolCall.input,
            },
          ],
        },
        {
          role: 'tool' as const,
          content: [
            {
              type: 'tool-result',
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              output: error.message,
            },
          ],
        },
      ],
      tools,
    });

    const newToolCall = result.toolCalls.find(
      newToolCall => newToolCall.toolName === toolCall.toolName,
    );

    return newToolCall != null
      ? {
          type: 'tool-call' as const,
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          input: JSON.stringify(newToolCall.input),
        }
      : null;
  },
});
```

## Active Tools

Language models can only handle a limited number of tools at a time, depending on the model.
To allow for static typing using a large number of tools and limiting the available tools to the model at the same time,
the AI SDK provides the `activeTools` property.

It is an array of tool names that are currently active.
By default, the value is `undefined` and all tools are active.

```ts {8}
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: myToolSet,
  activeTools: ['firstTool'],
});
```

## Tool Order

Some providers include tool definitions in the cached portion of a request.
If the order of those definitions changes between otherwise similar requests,
the provider may not be able to reuse the cached prefix as effectively.

Use `toolOrder` when you want a stable provider request shape for caching or
debugging. The list can be partial: tools listed in `toolOrder` are sent first
in that order, and any remaining tools are sent afterwards in alphabetical
order. Tool names are typed from your `tools` object.

```ts {7}
import { generateText } from 'ai';

const { text } = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: myToolSet,
  toolOrder: ['search', 'readFile'],
  prompt: 'Summarize the latest project notes.',
});
```

`toolOrder` controls only the order of tool definitions sent to the provider.
It does not force the model to call a tool. Use [`toolChoice`](#tool-choice) to
control tool selection, and use [`activeTools`](#active-tools) when you want to
limit which tools are available. When both `activeTools` and `toolOrder` are
provided, `activeTools` filters the available tools first and `toolOrder`
orders the remaining tools.

## Multi-modal Tool Results

Multi-modal tool results are experimental and supported by Anthropic, OpenAI,
and Google (Gemini 3 models).

For Google Generative AI, use base64 inline-data file parts
(`{ type: 'file', mediaType, data: { type: 'data', data } }`) or base64
`data:` URLs in URL-style file parts
(`{ type: 'file', mediaType, data: { type: 'url', url: new URL('data:...') } }`).
Remote HTTP(S) URLs in tool-result URL parts are not supported.

The [Google Vertex provider](/providers/ai-sdk-providers/google-vertex#tool-result-files)
also supports direct `gs://` tool-result file references for Gemini 3 and later
models with supported image and document MIME types. It downloads HTTP(S)
tool-result URLs and sends their contents as inline data.

In order to send multi-modal tool results, e.g. screenshots, back to the model,
they need to be converted into a specific format.

AI SDK Core tools have an optional `toModelOutput` function
that converts the tool result into a content part.

Here is an example for converting a screenshot into a content part:

```ts {23-38}
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: {
    computer: anthropic.tools.computer_20241022({
      // ...
      async execute({ action, coordinate, text }) {
        switch (action) {
          case 'screenshot': {
            return {
              type: 'file',
              mediaType: 'image',
              data: fs
                .readFileSync('./data/screenshot-editor.png')
                .toString('base64'),
            };
          }
          default: {
            return `executed ${action}`;
          }
        }
      },

      // map to tool result content for LLM consumption:
      toModelOutput({ output }) {
        return {
          type: 'content',
          value:
            typeof output === 'string'
              ? [{ type: 'text', text: output }]
              : [
                  {
                    type: 'file',
                    mediaType: 'image/png',
                    data: { type: 'data', data: output.data },
                  },
                ],
        };
      },
    }),
  },
  // ...
});
```

## Extracting Tools

Once you start having many tools, you might want to extract them into separate files.
The `tool` helper function is crucial for this, because it ensures correct type inference.

Here is an example of an extracted tool:

```ts title="tools/weather-tool.ts" {1,4-5}
import { tool } from 'ai';
import { z } from 'zod';

// the `tool` helper function ensures correct type inference:
export const weatherTool = tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
});
```

## MCP Tools

The AI SDK supports connecting to Model Context Protocol (MCP) servers to access their tools.
MCP enables your AI applications to discover and use tools across various services through a standardized interface.

For detailed information about MCP tools, including initialization, transport options, and usage patterns, see the [MCP Tools documentation](/docs/ai-sdk-core/mcp-tools).

### AI SDK Tools vs MCP Tools

In most cases, you should define your own AI SDK tools for production applications. They provide full control, type safety, and optimal performance. MCP tools are best suited for rapid development iteration and scenarios where users bring their own tools.

| Aspect                 | AI SDK Tools                                              | MCP Tools                                             |
| ---------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **Type Safety**        | Full static typing end-to-end                             | Dynamic discovery at runtime                          |
| **Execution**          | Same process as your request (low latency)                | Separate server (network overhead)                    |
| **Prompt Control**     | Full control over descriptions and schemas                | Controlled by MCP server owner                        |
| **Schema Control**     | You define and optimize for your model                    | Controlled by MCP server owner                        |
| **Version Management** | Full visibility over updates                              | Can update independently (version skew risk)          |
| **Authentication**     | Same process, no additional auth required                 | Separate server introduces additional auth complexity |
| **Best For**           | Production applications requiring control and performance | Development iteration, user-provided tools            |

## Examples

You can see tools in action using various frameworks in the following examples:

- [Learn to use tools in Node.js](/cookbook/node/call-tools)
- [Learn to use tools in Next.js with Route Handlers](/cookbook/next/call-tools)
- [Learn to use MCP tools in Node.js](/cookbook/node/mcp-tools)

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/llms.txt](/llms.txt)

For agent-facing discovery, including API and MCP surfaces, see [/agents.md](/agents.md)





=================================================================
---
title: Runtime and Tool Context
description: Learn how runtime context, tool context, and telemetry context filtering work together.
url: "https://ai-sdk.dev/docs/ai-sdk-core/runtime-and-tool-context"
docs_index: /llms.txt
---

> For an index of all documentation, see [/llms.txt](/llms.txt).

Context lets you pass server-side state through a generation or agent loop
without putting that state into the prompt. The AI SDK separates shared runtime
state from per-tool execution state so agents can keep track of their work while
tools only receive the values they need.

Use context for values such as tenant information, feature flags, session data,
request IDs, API credentials, access tokens, or other application state that
should affect execution.

## Context Types

| Concept                           | Where you define it                                                             | Where you read it                                                                               | Use it for                                                    |
| --------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `runtimeContext`                  | `generateText` or `streamText` calls; `ToolLoopAgent` settings or `prepareCall` | `prepareStep`, lifecycle callbacks, step results, and telemetry                                 | Shared generation or agent state                              |
| `toolsContext`                    | `generateText` or `streamText` calls; `ToolLoopAgent` settings or `prepareCall` | `prepareStep`, approval callbacks, tool context resolution, and tool description functions      | A map of per-tool context values keyed by tool name           |
| tool `context`                    | Each tool's `toolsContext` entry, validated by its `contextSchema`              | Tool description functions, tool `execute`, `needsApproval`, and tool input lifecycle callbacks | Values needed by one tool                                     |
| `toolContext`                     | Derived from one tool's context                                                 | Tool approval callbacks and tool execution events                                               | The event/callback name for one tool's context                |
| `telemetry.includeRuntimeContext` | The generation call or `ToolLoopAgent` settings                                 | Telemetry filtering                                                                             | Top-level `runtimeContext` properties to include in telemetry |
| `telemetry.includeToolsContext`   | The generation call or `ToolLoopAgent` settings                                 | Telemetry filtering                                                                             | Top-level tool context properties to include in telemetry     |

In agents, `runtimeContext` is the agent's shared runtime state. It flows
through the loop and can be read or updated in `prepareStep` between model
calls. Tool-specific data stays in `toolsContext`, where each tool receives only
its own validated `context`.

```txt
generateText / streamText / ToolLoopAgent settings
  -> runtimeContext
       -> prepareStep, lifecycle callbacks, step results
       -> telemetry, filtered by telemetry.includeRuntimeContext
  -> toolsContext
       -> prepareStep
       -> one tool's context / toolContext
            -> execute, approval callbacks, tool events
            -> telemetry, filtered by telemetry.includeToolsContext
```

## Runtime Context

Pass `runtimeContext` when you need shared state for the whole generation or
agent loop. It is not added to the model prompt automatically. Use it to
configure step preparation, track server-side state, or correlate lifecycle
events.

```ts
const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  prompt: 'Help the user plan their trip.',
  runtimeContext: {
    tenantId: 'tenant_123',
    plan: 'enterprise',
    requestId: 'req_abc',
  },
  prepareStep: async ({ runtimeContext }) => {
    if (runtimeContext.plan === 'enterprise') {
      return { temperature: 0.2 };
    }

    return {};
  },
});
```

`prepareStep` can return a new `runtimeContext`. The new value affects the
current step and all subsequent steps, which makes it the right place to update
agent state between turns of the loop.

## Tool Context

Use `toolsContext` for values that belong to a specific tool. Each tool declares
the context it expects with `contextSchema`; the matching `toolsContext` entry is
validated and passed to the tool as `context`.

```ts {9-12,25-30}
import { generateText, tool } from 'ai';
import { z } from 'zod';

const weatherTool = tool({
  description: 'Get the weather in a location',
  inputSchema: z.object({
    location: z.string(),
  }),
  contextSchema: z.object({
    weatherApiKey: z.string(),
    defaultUnit: z.enum(['celsius', 'fahrenheit']),
  }),
  execute: async ({ location }, { context }) => {
    return fetchWeather({
      location,
      apiKey: context.weatherApiKey,
      unit: context.defaultUnit,
    });
  },
});

const result = await generateText({
  model: "anthropic/claude-sonnet-5.5",
  tools: { weather: weatherTool },
  toolsContext: {
    weather: {
      weatherApiKey: process.env.WEATHER_API_KEY!,
      defaultUnit: 'fahrenheit',
    },
  },
  prompt: 'What is the weather in San Francisco?',
});
```

When at least one tool declares `contextSchema`, `toolsContext` is required for
the tools that need context. A tool receives only its own context, not the full
`toolsContext` map. Tool description functions receive the same typed `context`
before each model call, so descriptions can change with the current tool
context.

Treat tool context as immutable inside tools. If you need to change tool context
between steps, inspect the previous step in `prepareStep` and return an updated
`toolsContext`.

For `ToolLoopAgent`, set context in the constructor. For context that changes
with each invocation, use `callOptionsSchema` and `prepareCall`. See
[Configuring Call Options](/docs/agents/configuring-call-options).

## Telemetry Context Filtering

Context often contains values that are useful inside your application but should
not be sent to telemetry providers. Use `telemetry.includeRuntimeContext` to
include selected top-level runtime context properties in telemetry, and
`telemetry.includeToolsContext` to include selected top-level tool context
properties per tool.

```ts
import { ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';

const customerLookup = tool({
  description: 'Look up customer account details',
  inputSchema: z.object({
    customerId: z.string(),
  }),
  contextSchema: z.object({
    apiKey: z.string(),
    region: z.string(),
  }),
  execute: async ({ customerId }, { context }) => {
    return lookupCustomer({
      customerId,
      apiKey: context.apiKey,
      region: context.region,
    });
  },
});

const agent = new ToolLoopAgent({
  model: "anthropic/claude-sonnet-5.5",
  tools: { customerLookup },
  runtimeContext: {
    requestId: 'req_abc',
    tenantId: 'tenant_123',
    userId: 'user_123',
  },
  telemetry: {
    includeRuntimeContext: {
      requestId: true,
    },
    includeToolsContext: {
      customerLookup: {
        region: true,
      },
    },
  },
  toolsContext: {
    customerLookup: {
      apiKey: process.env.CUSTOMER_API_KEY!,
      region: 'us',
    },
  },
});

const result = await agent.generate({
  prompt: 'Check whether customer cust_123 is eligible for priority support.',
});
```

In this example, telemetry receives `runtimeContext` with only `requestId` and the
`customerLookup` context with only `region`.

Context filters only affect telemetry integrations, including OpenTelemetry
integrations. Tool execution, lifecycle callbacks, and returned results still
receive the full context values.

Context telemetry filtering is shallow. For `telemetry.includeRuntimeContext`, only
top-level properties marked as `true` are sent when it is configured; if it is
omitted, no runtime context properties are sent. For
`telemetry.includeToolsContext`, only top-level tool context properties marked as
`true` are sent when it is configured; if it is omitted, no tool context
properties are sent.

## Where Context Is Available

| Location                          | `runtimeContext`                              | `toolsContext`                              | Tool `context` / `toolContext`                           |
| --------------------------------- | --------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `prepareStep`                     | Read and update                               | Read and update                             | Not directly                                             |
| Tool description functions        | Not passed directly                           | Not passed directly                         | Read one tool's validated `context`                      |
| Tool `execute`                    | Not passed directly                           | Not passed directly                         | Read one tool's validated `context`                      |
| Tool approval                     | Read in generic and per-tool callbacks        | Read in generic callbacks                   | Read as `toolContext` in per-tool callbacks              |
| Tool execution events             | Not included                                  | Not included                                | Read as `toolContext`                                    |
| Step results and finish callbacks | Read final or per-step state                  | Read final or per-step state                | Available through the per-tool entries in `toolsContext` |
| Telemetry                         | Filtered by `telemetry.includeRuntimeContext` | Filtered by `telemetry.includeToolsContext` | Filtered by `telemetry.includeToolsContext`              |

## Choosing the Right Context

- Use `runtimeContext` for state shared by the whole generation or agent loop,
  such as request metadata, tenant settings, feature flags, or agent progress.
- Use `toolsContext` and `contextSchema` for values needed by a specific tool,
  such as API keys, scoped clients, user permissions, or default tool settings.
- Use prompt messages for information the model should reason about or mention
  in its answer.
- Use `telemetry.includeRuntimeContext` and `telemetry.includeToolsContext` to
  reduce telemetry exposure, not as a general security boundary.

Learn more about [tools and tool calling](/docs/ai-sdk-core/tools-and-tool-calling),
[lifecycle callbacks](/docs/ai-sdk-core/lifecycle-callbacks), and
[telemetry](/docs/ai-sdk-core/telemetry).

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/llms.txt](/llms.txt)

For agent-facing discovery, including API and MCP surfaces, see [/agents.md](/agents.md)

==================================================================================

---
title: Reasoning
description: Learn how to control reasoning across providers with the top-level reasoning parameter.
url: "https://ai-sdk.dev/docs/ai-sdk-core/reasoning"
docs_index: /llms.txt
---

> For an index of all documentation, see [/llms.txt](/llms.txt).

Many language models support an internal "reasoning" phase (sometimes also called "thinking") before producing a response. The AI SDK provides a top-level `reasoning` parameter on [`generateText`](/docs/reference/ai-sdk-core/generate-text) and [`streamText`](/docs/reference/ai-sdk-core/stream-text) that controls this behavior across providers with a single, portable setting.

## Basic Usage

```ts
import { generateText } from 'ai';

const { text, reasoning, reasoningText } = await generateText({
  model: 'anthropic/claude-sonnet-5.5',
  reasoning: 'medium',
  prompt: 'How many people will live in the world in 2040?',
});
```

The `reasoning` parameter accepts the following values:

| Value                | Behavior                                                             |
| -------------------- | -------------------------------------------------------------------- |
| `'provider-default'` | Use the provider's default reasoning behavior (default when omitted) |
| `'none'`             | Disable reasoning (lowest reasoning level if it cannot be disabled)  |
| `'minimal'`          | Bare-minimum reasoning                                               |
| `'low'`              | Fast, concise reasoning                                              |
| `'medium'`           | Balanced reasoning                                                   |
| `'high'`             | Thorough reasoning                                                   |
| `'xhigh'`            | Extra-high reasoning                                                 |
| `'max'`              | Maximum reasoning                                                    |

## Streaming

The `reasoning` parameter works the same way with `streamText`:

```ts
import { streamText } from 'ai';

const result = streamText({
  model: 'google/gemini-3.8-flash',
  reasoning: 'high',
  prompt: 'Explain the Riemann hypothesis in simple terms.',
});

for await (const part of result.stream) {
  if (part.type === 'reasoning') {
    process.stdout.write(part.textDelta);
  } else if (part.type === 'text-delta') {
    process.stdout.write(part.textDelta);
  }
}
```

## Precedence Rules

Provider-specific settings take precedence over the corresponding fields derived from `reasoning`. Partial configurations may still use portable reasoning to fill missing fields; summary and display settings can be used alongside it.

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text } = await generateText({
  model: openai.responses('gpt-6-astra'),
  reasoning: 'low', // ignored because providerOptions.openai.reasoningEffort is set
  providerOptions: {
    openai: {
      reasoningEffort: 'high', // this wins
    },
  },
  prompt: 'Explain quantum entanglement.',
});
```

This design lets you use the portable `reasoning` parameter by default and fall back to `providerOptions` only when you need provider-specific features like exact token budgets.

## Provider Support

The `reasoning` parameter is supported by providers including OpenAI, Anthropic, Google, xAI, Groq, DeepSeek, Moonshot AI, Fireworks, Amazon Bedrock, Mistral, Cohere, Alibaba, Open Responses, OpenAI Compatible, and Perplexity. Each provider translates the value to its native reasoning API.

### How values are mapped

When a model does not support the requested value, the provider uses the closest supported value, rounding down. The values are ordered `none` \< `minimal` \< `low` \< `medium` \< `high` \< `xhigh` \< `max`, so `'xhigh'` becomes `'high'` on a model without an `xhigh` level. If there is no lower value, the next higher one is used.

Rounding never turns reasoning off: other values never map to `'none'`, and `'none'` on a model that cannot disable reasoning maps to the model's lowest level. Providers emit a `compatibility` warning whenever the value they send differs from the requested value. Values set in `providerOptions` are sent unchanged (see [Precedence Rules](#precedence-rules)).

Providers only round values for models and model families they recognize by model ID, so newer versions of a known family use that family's levels. Unrecognized model IDs, such as fine-tuned or custom models, and OpenAI-compatible and Open Responses endpoints receive the value directly and the API decides whether it is supported.

For providers that use a token budget, the value maps to a percentage of the model's maximum output tokens (`'max'` maps to 95% by default), within the provider's budget limits.

Maximum reasoning can substantially increase token usage, latency, cost, and the chance of reaching request or output limits. Use it when the model's additional reasoning depth is worth those tradeoffs.

Providers and models that do not support reasoning configuration emit an `unsupported` warning and ignore the parameter.

## Migrating from `providerOptions`

If you currently control reasoning via `providerOptions`, you can migrate to the top-level `reasoning` parameter for portability across providers.

### Before (Anthropic)

```ts
const { text } = await generateText({
  model: anthropic('claude-opus-5-5'),
  providerOptions: {
    anthropic: {
      thinking: { type: 'adaptive' },
      effort: 'high',
    },
  },
  prompt: 'How many people will live in the world in 2040?',
});
```

### After (Anthropic)

```ts
const { text } = await generateText({
  model: anthropic('claude-opus-5-5'),
  reasoning: 'high',
  prompt: 'How many people will live in the world in 2040?',
});
```

### Before (Anthropic with older model)

```ts
const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  providerOptions: {
    anthropic: {
      thinking: { type: 'enabled', budgetTokens: 12000 },
    },
  },
  prompt: 'How many people will live in the world in 2040?',
});
```

### After (Anthropic with older model)

```ts
const { text } = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  reasoning: 'medium',
  prompt: 'How many people will live in the world in 2040?',
});
```

If you need to enforce an exact token budget (e.g. exactly 12000 tokens), keep using `providerOptions` instead of the top-level `reasoning` parameter.

### Before (Google with `includeThoughts`)

```ts
const { text } = await generateText({
  model: google('gemini-3.8-flash'),
  providerOptions: {
    google: {
      thinkingConfig: { thinkingLevel: 'high', includeThoughts: true },
    },
  },
  prompt: 'Explain the Riemann hypothesis in simple terms.',
});
```

### After (Google with `includeThoughts`)

```ts
const { text } = await generateText({
  model: google('gemini-3.8-flash'),
  reasoning: 'high',
  providerOptions: {
    google: { thinkingConfig: { includeThoughts: true } },
  },
  prompt: 'Explain the Riemann hypothesis in simple terms.',
});
```

### Before (OpenAI with `reasoningSummary`)

```ts
const { text } = await generateText({
  model: openai.responses('gpt-6-astra'),
  providerOptions: {
    openai: { reasoningEffort: 'high', reasoningSummary: 'auto' },
  },
  prompt: 'Explain quantum entanglement.',
});
```

### After (OpenAI with `reasoningSummary`)

```ts
const { text } = await generateText({
  model: openai.responses('gpt-6-astra'),
  reasoning: 'high',
  providerOptions: {
    openai: { reasoningSummary: 'auto' },
  },
  prompt: 'Explain quantum entanglement.',
});
```

You can combine `providerOptions` with `reasoning` for provider-specific features such as reasoning summaries or display settings. Explicit effort or budget values override the corresponding mapped fields; partial configurations may still use portable reasoning to fill missing fields. See [Precedence Rules](#precedence-rules) for details.

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/llms.txt](/llms.txt)

For agent-facing discovery, including API and MCP surfaces, see [/agents.md](/agents.md)

====================================================

---
title: "Provider & Model Management"
description: Learn how to work with multiple providers and models
url: "https://ai-sdk.dev/docs/ai-sdk-core/provider-management"
docs_index: /llms.txt
---

> For an index of all documentation, see [/llms.txt](/llms.txt).

When you work with multiple providers and models, it is often desirable to manage them in a central place
and access the models through simple string ids.

The AI SDK offers [custom providers](/docs/reference/ai-sdk-core/custom-provider) and
a [provider registry](/docs/reference/ai-sdk-core/provider-registry) for this purpose:

- With **custom providers**, you can pre-configure model settings, provide model name aliases,
  and limit the available models.
- The **provider registry** lets you mix multiple providers and access them through simple string ids.

You can mix and match custom providers, the provider registry, and [middleware](/docs/ai-sdk-core/middleware) in your application.

## Custom Providers

You can create a [custom provider](/docs/reference/ai-sdk-core/custom-provider) using `customProvider`.

### Example: custom model settings

You might want to override the default model settings for a provider or provide model name aliases
with pre-configured settings.

```ts
import {
  gateway,
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
} from 'ai';

// custom provider with different provider options:
export const openai = customProvider({
  languageModels: {
    // replacement model with custom provider options:
    'gpt-6-astra': wrapLanguageModel({
      model: gateway('openai/gpt-6-astra'),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: 'high',
            },
          },
        },
      }),
    }),
    // alias model with custom provider options:
    'gpt-6-astra-high-reasoning': wrapLanguageModel({
      model: gateway('openai/gpt-6-astra'),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: 'high',
            },
          },
        },
      }),
    }),
  },
  fallbackProvider: gateway,
});
```

### Example: model name alias

You can also provide model name aliases, so you can update the model version in one place in the future:

```ts
import { customProvider, gateway } from 'ai';

// custom provider with alias names:
export const anthropic = customProvider({
  languageModels: {
    opus: gateway('anthropic/claude-opus-5.5'),
    sonnet: gateway('anthropic/claude-sonnet-5.5'),
    haiku: gateway('anthropic/claude-haiku-5.5'),
  },
  fallbackProvider: gateway,
});
```

### Example: limit available models

You can limit the available models in the system, even if you have multiple providers.

```ts
import {
  customProvider,
  defaultSettingsMiddleware,
  wrapLanguageModel,
  gateway,
} from 'ai';

export const myProvider = customProvider({
  languageModels: {
    'text-medium': gateway('anthropic/claude-sonnet-5.5'),
    'text-small': gateway('openai/gpt-6-luna'),
    'reasoning-medium': wrapLanguageModel({
      model: gateway('openai/gpt-6-astra'),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: 'high',
            },
          },
        },
      }),
    }),
    'reasoning-fast': wrapLanguageModel({
      model: gateway('openai/gpt-6-astra'),
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: {
              reasoningEffort: 'low',
            },
          },
        },
      }),
    }),
  },
  embeddingModels: {
    embedding: gateway.embeddingModel('openai/text-embedding-3-small'),
  },
  // no fallback provider
});
```

### Example: files and skills interfaces

You can attach a provider's `files` or `skills` interface to your custom provider. This allows you to use `uploadFile` and `uploadSkill` through the same provider abstraction.

```ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { customProvider, uploadFile, uploadSkill } from 'ai';

// custom provider with files interface:
const myOpenAI = customProvider({
  languageModels: {
    'gpt-6-luna': openai.responses('gpt-6-luna'),
  },
  files: openai.files(),
});

// custom provider with skills interface:
const myAnthropic = customProvider({
  languageModels: {
    sonnet: anthropic('claude-sonnet-5-5'),
  },
  skills: anthropic.skills(),
});

// usage:
await uploadFile({
  api: myOpenAI.files!(),
  data: fileData,
  filename: 'image.png',
});
await uploadSkill({
  api: myAnthropic.skills!(),
  files: skillFiles,
  displayTitle: 'My Skill',
});
```

If no `files` or `skills` option is set but a `fallbackProvider` is configured, the custom provider will inherit those interfaces from the fallback.

## Provider Registry

You can create a [provider registry](/docs/reference/ai-sdk-core/provider-registry) with multiple providers and models using `createProviderRegistry`.

### Setup

```ts title="registry.ts"
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createProviderRegistry, gateway } from 'ai';

export const registry = createProviderRegistry({
  // register provider with prefix and default setup using gateway:
  gateway,

  // register provider with prefix and direct provider import:
  anthropic,
  openai,
});
```

### Setup with Custom Separator

By default, the registry uses `:` as the separator between provider and model IDs. You can customize this separator:

```ts title="registry.ts"
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createProviderRegistry, gateway } from 'ai';

export const customSeparatorRegistry = createProviderRegistry(
  {
    gateway,
    anthropic,
    openai,
  },
  { separator: ' > ' },
);
```

### Example: Use language models

You can access language models by using the `languageModel` method on the registry.
The provider id will become the prefix of the model id: `providerId:modelId`.

```ts {5}
import { generateText } from 'ai';
import { registry } from './registry';

const { text } = await generateText({
  model: registry.languageModel('openai:gpt-6-astra'), // default separator
  // or with custom separator:
  // model: customSeparatorRegistry.languageModel('openai > gpt-6-astra'),
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

### Example: Use text embedding models

You can access text embedding models by using the `.embeddingModel` method on the registry.
The provider id will become the prefix of the model id: `providerId:modelId`.

```ts {5}
import { embed } from 'ai';
import { registry } from './registry';

const { embedding } = await embed({
  model: registry.embeddingModel('openai:text-embedding-3-small'),
  value: 'sunny day at the beach',
});
```

### Example: Use image models

You can access image models by using the `imageModel` method on the registry.
The provider id will become the prefix of the model id: `providerId:modelId`.

```ts {5}
import { generateImage } from 'ai';
import { registry } from './registry';

const { image } = await generateImage({
  model: registry.imageModel('openai:dall-e-3'),
  prompt: 'A beautiful sunset over a calm ocean',
});
```

### Example: Use video models

You can access video models by using the `videoModel` method on the registry.
The provider id will become the prefix of the model id: `providerId:modelId`.

```ts {8}
import { experimental_generateVideo } from 'ai';
import { fal } from '@ai-sdk/fal';
import { createProviderRegistry } from 'ai';

const registry = createProviderRegistry({ fal });

const { videos } = await experimental_generateVideo({
  model: registry.videoModel('fal:luma-dream-machine/ray-2'),
  prompt: 'A cat walking on a beach at sunset',
});
```

### Example: Use files interface

You can access a provider's files interface by calling `registry.files(providerId)`.
This is useful when you want to upload files through a provider in the registry before referencing them in model requests.

```ts {12,17}
import { openai } from '@ai-sdk/openai';
import {
  createProviderRegistry,
  customProvider,
  generateText,
  uploadFile,
} from 'ai';

const registry = createProviderRegistry({
  openai: customProvider({
    languageModels: { 'gpt-6-luna': openai.responses('gpt-6-luna') },
    files: openai.files(),
  }),
});

const { providerReference } = await uploadFile({
  api: registry.files('openai'),
  data: fileData,
  filename: 'image.png',
});

const { text } = await generateText({
  model: registry.languageModel('openai:gpt-6-luna'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe what you see in this image.' },
        { type: 'file', mediaType: 'image', data: providerReference },
      ],
    },
  ],
});
```

### Example: Use skills interface

You can access a provider's skills interface by calling `registry.skills(providerId)`.

```ts {7,12}
import { anthropic } from '@ai-sdk/anthropic';
import { createProviderRegistry, customProvider, uploadSkill } from 'ai';

const registry = createProviderRegistry({
  anthropic: customProvider({
    languageModels: { sonnet: anthropic('claude-sonnet-5-5') },
    skills: anthropic.skills(),
  }),
});

await uploadSkill({
  api: registry.skills('anthropic'),
  files: skillFiles,
  displayTitle: 'My Skill',
});
```

## Combining Custom Providers, Provider Registry, and Middleware

The central idea of provider management is to set up a file that contains all the providers and models you want to use.
You may want to pre-configure model settings, provide model name aliases, limit the available models, and more.

Here is an example that implements the following concepts:

- pass through gateway with a namespace prefix (here: `gateway > *`)
- pass through a full provider with a namespace prefix (here: `xai > *`)
- setup an OpenAI-compatible provider with custom api key and base URL (here: `custom > *`)
- setup model name aliases (here: `anthropic > fast`, `anthropic > writing`, `anthropic > reasoning`)
- pre-configure model settings (here: `anthropic > reasoning`)
- validate the provider-specific options (here: `AnthropicLanguageModelOptions`)
- use a fallback provider (here: `anthropic > *`)
- limit a provider to certain models without a fallback (here: `groq > llama-3.1-8b-instant`, `groq > qwen/qwen3.6-27b`)
- define a custom separator for the provider registry (here: `>`)

```ts
import { anthropic, AnthropicLanguageModelOptions } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import {
  createProviderRegistry,
  customProvider,
  defaultSettingsMiddleware,
  gateway,
  wrapLanguageModel,
} from 'ai';

export const registry = createProviderRegistry(
  {
    // pass through gateway with a namespace prefix
    gateway,

    // pass through full providers with namespace prefixes
    xai,

    // access an OpenAI-compatible provider with custom setup
    custom: createOpenAICompatible({
      name: 'provider-name',
      apiKey: process.env.CUSTOM_API_KEY,
      baseURL: 'https://api.custom.com/v1',
    }),

    // setup model name aliases
    anthropic: customProvider({
      languageModels: {
        fast: anthropic('claude-haiku-5-5'),

        // simple model
        writing: anthropic('claude-sonnet-4-5'),

        // extended reasoning model configuration:
        reasoning: wrapLanguageModel({
          model: anthropic('claude-sonnet-4-5'),
          middleware: defaultSettingsMiddleware({
            settings: {
              maxOutputTokens: 100000, // example default setting
              providerOptions: {
                anthropic: {
                  thinking: {
                    type: 'enabled',
                    budgetTokens: 32000,
                  },
                } satisfies AnthropicLanguageModelOptions,
              },
            },
          }),
        }),
      },
      fallbackProvider: anthropic,
    }),

    // limit a provider to certain models without a fallback
    groq: customProvider({
      languageModels: {
        'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
        'qwen/qwen3.6-27b': groq('qwen/qwen3.6-27b'),
      },
    }),
  },
  { separator: ' > ' },
);

// usage:
const model = registry.languageModel('anthropic > reasoning');
```

## Global Provider Configuration

The AI SDK 5 includes a global provider feature that allows you to specify a model using just a plain model ID string:

```ts
import { streamText } from 'ai';

const result = await streamText({
  model: "anthropic/claude-sonnet-5.5", // Uses the global provider (defaults to gateway)
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

By default, the global provider is set to the Vercel AI Gateway.

### Customizing the Global Provider

You can set your own preferred global provider:

```ts title="setup.ts"
import { openai } from '@ai-sdk/openai';

// Initialize once during startup:
globalThis.AI_SDK_DEFAULT_PROVIDER = openai;
```

```ts title="app.ts"
import { streamText } from 'ai';

const result = await streamText({
  model: 'gpt-6-astra', // Uses OpenAI provider without prefix
  prompt: 'Invent a new holiday and describe its traditions.',
});
```

This simplifies provider usage and makes it easier to switch between providers without changing your model references throughout your codebase.

## Experimental decision models

Custom providers accept `decisionModels` aliases, and registries expose
`decisionModel('provider:model')`. These methods return model instances for
`experimental_decide`. Direct string IDs use Gateway by default, or an
explicitly configured default provider with a `decisionModel` method. Registry
middleware for language and image models does not apply to decision.
See [Decisions](/docs/ai-sdk-core/decisions#model-aliases-and-registries)
for aliases, default-provider configuration, and capability differences.

---

For a semantic overview of all documentation, see [/sitemap.md](/sitemap.md)

For an index of all available documentation, see [/llms.txt](/llms.txt)

For agent-facing discovery, including API and MCP surfaces, see [/agents.md](/agents.md)