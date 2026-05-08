<template>
  <div class="code-block relative group my-5 w-full xl:w-[28rem] max-h-[calc(100%-32px)]">
    <div class="relative flex items-center justify-between gap-2 rounded-t-md border border-muted border-b-0 bg-default px-3 py-2">
        <slot name="header" />
    </div>
    <div class="group overflow-x-auto rounded-md rounded-t-none border border-muted bg-muted px-4 py-3 font-mono text-sm/6 break-words whitespace-pre-wrap focus:outline-none">
      <div class="min-w-full children:!my-0 children:!bg-transparent children:!shadow-none [&_*]:ring-0 [&_*]:outline-none [&_*]:focus:ring-0 [&_*]:focus:outline-none [&_pre]:!m-0 [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre>code]:pr-[3rem] [&_pre>code>span.line-highlight]:min-w-[calc(100%+3rem)] [&_pre>code>span.line-diff]:min-w-[calc(100%+3rem)]">
        <div class="font-mono whitespace-pre flex-none h-full text-xs leading-[1.35rem]">
          <slot name="panel" />
        </div>
      </div>
    </div>
  </div>
</template>
