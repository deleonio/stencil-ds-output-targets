import { JSX, PropsWithChildren } from 'solid-js';

export interface HTMLStencilElement extends HTMLElement {
  componentOnReady(): Promise<this>;
}

// https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
const camelToKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const handleList = (prop: unknown, validator: (val: unknown) => boolean): string | null => {
  let list: unknown;
  if (typeof prop === 'object' && prop !== null) {
    list = '';
    for (const key in prop) {
      if (validator((prop as Record<string, unknown>)[key])) {
        list += `${key};`;
      }
    }
  } else {
    list = prop;
  }
  if (typeof list === 'string' && list.length > 0) {
    return list;
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
      } else if (key === 'class' || key === 'classList') {
        // https://www.solidjs.com/docs/latest/api#classlist
        const list = handleList(
          props['classList'],
          (value) => (value as Record<string, unknown>)[key] === true,
        );
        if (list !== null) {
          node.setAttribute('class', list);
        }
      } else if (key === 'style') {
        // https://www.solidjs.com/docs/latest/api#style
        const list = handleList(
          props['style'],
          (value) => typeof (value as Record<string, unknown>)[key] === 'string',
        );
        if (list !== null) {
          node.setAttribute('style', list);
        }
      } else if (Object.prototype.hasOwnProperty.call(props, key)) {
        const kebabKey: string = camelToKebabCase(key);
        if (
          typeof (props as Record<string, unknown>)[key] === 'string' ||
          typeof (props as Record<string, unknown>)[key] === 'number' ||
          typeof (props as Record<string, unknown>)[key] === 'boolean'
        ) {
          node.setAttribute(kebabKey, (props as Record<string, any>)[key]);
        } else {
          (node as Record<string, any>)[kebabKey] = (props as Record<string, any>)[key];
        }
      }
    }
    return node as ElementType;
  };
}
