import { JSX, PropsWithChildren } from 'solid-js';

export interface HTMLStencilElement extends HTMLElement {
  componentOnReady(): Promise<this>;
}

// https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
const camelToKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const handleList = (
  prop: unknown,
  handler: (key: string, value: unknown) => string,
): string | null => {
  let list;
  if (typeof prop === 'object' && prop !== null) {
    list = '';
    for (const key in prop) {
      list += handler(key, (prop as Record<string, unknown>)[key]);
    }
  } else {
    list = prop;
  }
  if (typeof list === 'string' && list.trim().length > 0) {
    return list.trim();
  } else {
    return null;
  }
};

export function createSolidComponent<PropType, ElementType extends HTMLStencilElement>(
  tag: string,
) {
  return (props: PropsWithChildren<PropType & JSX.HTMLAttributes<ElementType>>): ElementType => {
    const node = document.createElement(tag);
    for (const key in props) {
      if (key === 'children') {
        const children = Array.isArray(props[key]) ? props[key] : [props[key]];
        (children as any[]).forEach((child) => {
          if (child instanceof HTMLElement) {
            node.appendChild(child);
          } else {
            node.innerHTML = child;
          }
        });
      } else if (key === 'debug') {
        console.log(tag, props, node);
      } else if (key === 'ref') {
        // https://www.solidjs.com/docs/latest/api#ref
        if (typeof props[key] === 'function' && (props[key] as Function).length > 0) {
          (props[key] as Function)(node);
        } else {
          (props[key] as HTMLElement) = node;
        }
      } else if (key === 'classList') {
        // https://www.solidjs.com/docs/latest/api#classlist
        const list = handleList(props['classList'], (key, value) =>
          value === true ? `${key} ` : '',
        );
        if (list !== null) {
          node.setAttribute('class', list);
        }
      } else if (key === 'style') {
        // https://www.solidjs.com/docs/latest/api#style
        const list = handleList(props['style'], (key, value) => `${key}:${value};`);
        if (list !== null) {
          node.setAttribute('style', list);
        }
      } else if (Object.prototype.hasOwnProperty.call(props, key)) {
        if (
          typeof (props as Record<string, unknown>)[key] === 'string' ||
          typeof (props as Record<string, unknown>)[key] === 'number' ||
          typeof (props as Record<string, unknown>)[key] === 'boolean'
        ) {
          const kebabKey: string = camelToKebabCase(key);
          node.setAttribute(kebabKey, (props as Record<string, any>)[key]);
        } else {
          (node as Record<string, any>)[key] = (props as Record<string, any>)[key];
        }
      }
    }
    return node as ElementType;
  };
}
